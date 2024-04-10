import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ProductService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private uploadService: UploadService,
    private categoryService: CategoryService,
    private brandService: BrandService,
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
      },
    });

    return toProductResponse(product, product.images, product.variant);
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
    return toProductResponse(product, product.images, product.variant);
  }

  async search(
    request: SearchProductsRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const searchRequest: SearchProductsRequest =
      this.validationService.validate(ProductValidation.SEARCH, request);

    const filters = [];

    if (
      searchRequest.brand_id &&
      searchRequest.category_id &&
      searchRequest.name &&
      searchRequest.pmin &&
      searchRequest.pmax &&
      searchRequest.sort === 'Price (Low to High)'
    ) {
      // add name filter
      filters.push({
        OR: [
          {
            name: {
              contains: searchRequest.name,
            },
          },
          {
            description: {
              contains: searchRequest.name,
            },
          },
        ],
        brand_id: {
          equals: searchRequest.brand_id,
        },
        category_id: {
          equals: searchRequest.category_id,
        },
        price: {
          lte: searchRequest.pmin,
          gte: searchRequest.pmax,
        },
        orderBy: {
          price: 'asc',
        },
      });
    }

    // Tambahkan kondisi berdasarkan properti yang tersedia dalam request
    if (searchRequest.brand_id) {
      filters.push({
        brand_id: {
          equals: searchRequest.brand_id,
        },
      });
    }

    if (searchRequest.category_id) {
      filters.push({
        category_id: {
          equals: searchRequest.category_id,
        },
      });
    }

    if (searchRequest.name) {
      // Tambahkan filter berdasarkan nama atau deskripsi
      filters.push({
        OR: [
          {
            name: {
              contains: searchRequest.name,
            },
          },
          {
            description: {
              contains: searchRequest.name,
            },
          },
        ],
      });
    }

    if (searchRequest.pmin && searchRequest.pmax) {
      filters.push({
        price: {
          lte: searchRequest.pmax,
          gte: searchRequest.pmin,
        },
      });
    }

    // Tambahkan pengaturan orderBy berdasarkan sort jika sort tersedia
    if (searchRequest.sort === 'Price (Low to High)') {
      filters.push({
        orderBy: {
          price: 'asc',
        },
      });
    } else if (searchRequest.sort === 'Price (High to Low)') {
      filters.push({
        orderBy: {
          price: 'desc',
        },
      });
    }
    const skip = (searchRequest.page - 1) * searchRequest.size;

    const products = await this.prismaService.product.findMany({
      where: {
        status: 'ACTIVE',
        AND: filters.length > 0 ? filters : undefined,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.product.count({
      where: {
        status: 'ACTIVE',
        AND: filters.length > 0 ? filters : undefined,
      },
    });

    return {
      status: true,
      message: 'Search Success',
      data: products.map((product) => toProductResponse(product)),
      paging: {
        count_item_in_page: total,
        current_page: searchRequest.page,
        size: searchRequest.size,
        total_page: Math.ceil(total / searchRequest.size),
      },
    };
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
