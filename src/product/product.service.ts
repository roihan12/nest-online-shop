import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateProductRequest,
  ProductResponse,
  SearchProductsRequest,
  UpdateProductRequest,
} from 'src/model/product.model';
import { UploadService } from 'src/upload/upload.service';
import { Logger } from 'winston';
import { ProductValidation } from './product.validation';
import { slugify, toProductResponse } from './product.mapping';
import { CategoryService } from 'src/category/category.service';
import { BrandService } from 'src/brand/brand.service';
import { WebResponse } from 'src/model/web.model';
import { Product } from '@prisma/client';
import { ShoppingCartResponse } from 'src/model/shopping-cart.model';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private uploadService: UploadService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private searchService: SearchService,
  ) {}

  async createProduct(
    request: CreateProductRequest,
    product_image?: Express.Multer.File[],
    variant_image?: Express.Multer.File[],
  ): Promise<ProductResponse> {
    this.logger.debug(
      `ProductService.createProduct(${JSON.stringify(request)})`,
    );

    const createRequest: CreateProductRequest = this.validationService.validate(
      ProductValidation.Create,
      request,
    );

    await this.brandService.getBrandById(createRequest.brand_id);
    await this.categoryService.getCategoryById(createRequest.category_id);

    const newProduct = await this.prismaService.product.create({
      data: {
        brand_id: createRequest.brand_id,
        category_id: createRequest.category_id,
        slug: slugify(createRequest.name),
        name: createRequest.name,
        price: createRequest.price,
        weight: createRequest.weight,
        description: createRequest.description,
        is_featured: createRequest.is_featured,
        is_variant: createRequest.is_variant,
      },
    });

    if (product_image) {
      await this.uploadService.uploadImageProductToS3(
        newProduct.id,
        product_image,
      );
    }

    if (createRequest.is_variant) {
      let variantImage: string;
      if (variant_image) {
        variantImage =
          await this.uploadService.uploadImageVariantToS3(variant_image);
      }
      for (const variant of createRequest.variants) {
        await this.prismaService.variant.createMany({
          data: {
            product_id: newProduct.id,
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            value: variant.value,
            image_url: variantImage,
          },
        });
      }
    }

    const product = await this.prismaService.product.findFirst({
      where: {
        id: newProduct.id,
      },
      include: {
        variant: true,
        images: true,
      },
    });

    await this.searchService.indexProductInElasticsearch(
      product,
      product.images,
      product.variant,
    );
    return toProductResponse(product, product.images, product.variant);
  }

  async getProductById(id: string): Promise<ProductResponse> {
    this.logger.debug(`ProductService.getProductById(${id})`);
    const product = await this.prismaService.product.findFirst({
      where: {
        id: id,
      },
      include: {
        variant: true,
        images: true,
        reviews: {
          take: 5,
        },
      },
    });

    return toProductResponse(
      product,
      product.images,
      product.variant,
      product.reviews,
    );
  }

  async deleteProduct(id: string): Promise<void> {
    this.logger.debug(`ProductService.deleteProduct(${id})`);
    await this.prismaService.product.update({
      where: {
        id: id,
      },
      data: {
        variant: {
          deleteMany: {},
        },
        images: {
          deleteMany: {},
        },
      },
      include: {
        variant: true,
        images: true,
      },
    });
    await this.prismaService.product.delete({
      where: {
        id: id,
      },
    });
    await this.searchService.remove(id);
  }

  async updateProduct(request: UpdateProductRequest): Promise<ProductResponse> {
    this.logger.debug(
      `ProductService.updateProduct(${JSON.stringify(request)}`,
    );

    const updateRequest: UpdateProductRequest = this.validationService.validate(
      ProductValidation.Update,
      request,
    );
    await this.brandService.getBrandById(updateRequest.brand_id);
    await this.categoryService.getCategoryById(updateRequest.category_id);

    const product = await this.prismaService.product.update({
      where: {
        id: updateRequest.id,
      },
      data: {
        brand_id: updateRequest.brand_id,
        category_id: updateRequest.category_id,
        slug: slugify(updateRequest.name),
        name: updateRequest.name,
        price: updateRequest.price,
        weight: updateRequest.weight,
        description: updateRequest.description,
        is_featured: updateRequest.is_featured,
        is_variant: updateRequest.is_variant,
      },
      include: {
        variant: true,
        images: true,
      },
    });

    await this.searchService.update(product, product.images, product.variant);

    return toProductResponse(product, product.images, product.variant);
  }

  async search(
    request: SearchProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const searchRequest: SearchProductsRequest =
      this.validationService.validate(ProductValidation.SEARCH, request);
    const { brand_id, category_id, name, pmin, pmax, sort, page, size } =
      searchRequest;

    const where: any = {
      status: 'ACTIVE',
    };

    if (brand_id) {
      where.brand_id = { equals: brand_id };
    }

    if (category_id) {
      where.category_id = { equals: category_id };
    }

    if (name) {
      where.OR = [
        { name: { contains: name } },
        { description: { contains: name } },
      ];
    }

    if (pmin && pmax) {
      where.price = {
        lte: pmax,
        gte: pmin,
      };
    }

    const orderBy: any[] = [];
    if (sort === 'Price (Low to High)') {
      orderBy.push({ price: 'asc' });
    } else if (sort === 'Price (High to Low)') {
      orderBy.push({ price: 'desc' });
    } else if (sort === 'Best Selling') {
      orderBy.push({ stock_sold: 'desc' }); // Sort by highest stock_sold
    } else if (sort === 'asc') {
      orderBy.push({ created_at: 'asc' });
    } else if (sort === 'desc') {
      orderBy.push({ created_at: 'desc' });
    }

    const skip = (page - 1) * size;

    try {
      const products = await this.prismaService.product.findMany({
        where,
        orderBy,
        include: {
          variant: true,
          images: true,
        },
        take: size,
        skip,
      });

      const total = await this.prismaService.product.count({ where });

      return {
        status: true,
        message: 'Search Success',
        data: products.map((product) =>
          toProductResponse(product, product.images, product.variant),
        ),
        paging: {
          count_item: total,
          current_page: page,
          size,
          total_page: Math.ceil(total / size),
        },
      };
    } catch (error) {
      // Handle error appropriately
      this.logger.error('Error searching products:', error);
      return {
        status: false,
        message: 'Search failed',
        data: [],
        paging: {
          count_item: 0,
          current_page: page,
          size,
          total_page: 0,
        },
      };
    }
  }

  async searchByElasticSearch(
    keyword: SearchProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const searchRequest: SearchProductsRequest =
      this.validationService.validate(ProductValidation.SEARCH, keyword);
    try {
      return await this.searchService.searchProduct(
        searchRequest.name,
        searchRequest.page,
        searchRequest.size,
      );
    } catch (error: any) {
      throw new HttpException('Error on search', 500);
    }
  }

  async getProductsByIds(products: ShoppingCartResponse[]): Promise<Product[]> {
    const findProducts = await this.prismaService.product.findMany({
      where: {
        id: {
          in: products.map((product) => product.product_id),
        },
      },
    });

    if (!findProducts) {
      throw new NotFoundException('Product not found');
    }

    return findProducts;
  }
}
