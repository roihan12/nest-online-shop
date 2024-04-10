import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateVariantRequest,
  DeleteVariantRequest,
  GetVariantRequest,
  UpdateVariantRequest,
  VariantResponse,
} from 'src/model/variant.model';
import { ProductService } from 'src/product/product.service';
import { UploadService } from 'src/upload/upload.service';
import { Logger } from 'winston';
import { VariantValidation } from './variant.validation';
import { toVariantResponse } from './variant.mapping';
import { Variant } from '@prisma/client';
import { ShoppingCartResponse } from 'src/model/shopping-cart.model';

@Injectable()
export class VariantService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private uploadService: UploadService,
    private productService: ProductService,
  ) {}

  async createVariant(
    request: CreateVariantRequest,
    variant_image: Express.Multer.File,
  ): Promise<VariantResponse> {
    this.logger.debug(`VariantService.create( ${JSON.stringify(request)})`);
    const createRequest: CreateVariantRequest = this.validationService.validate(
      VariantValidation.Create,
      request,
    );

    await this.productService.getProductById(createRequest.product_id);

    let variantImage: string;
    if (variant_image) {
      variantImage =
        await this.uploadService.uploadSingleImageVariantToS3(variant_image);
    } else {
      throw new BadRequestException('Variant Image is required');
    }

    const variant = await this.prismaService.variant.create({
      data: {
        product_id: createRequest.product_id,
        name: createRequest.name,
        price: createRequest.price,
        stock: createRequest.stock,
        value: createRequest.value,
        image_url: variantImage,
      },
    });

    return toVariantResponse(variant);
  }

  async checkVariantMustExists(
    productId: string,
    variantId: string,
  ): Promise<Variant> {
    const variant = await this.prismaService.variant.findFirst({
      where: {
        id: variantId,
        product_id: productId,
      },
    });

    if (!variant) {
      throw new HttpException('Variant is not found', 404);
    }

    return variant;
  }

  async getById(request: GetVariantRequest): Promise<VariantResponse> {
    const getRequest: GetVariantRequest = this.validationService.validate(
      VariantValidation.GET,
      request,
    );

    await this.productService.getProductById(getRequest.product_id);

    const variant = await this.checkVariantMustExists(
      getRequest.product_id,
      getRequest.variant_id,
    );

    return toVariantResponse(variant);
  }

  async updateVariant(
    request: UpdateVariantRequest,
    variant_image?: Express.Multer.File,
  ): Promise<VariantResponse> {
    this.logger.debug(`VariantService.update( ${JSON.stringify(request)})`);
    const updateRequest: UpdateVariantRequest = this.validationService.validate(
      VariantValidation.Update,
      request,
    );

    await this.productService.getProductById(updateRequest.product_id);

    let variantImage: string;
    if (variant_image) {
      variantImage =
        await this.uploadService.uploadSingleImageVariantToS3(variant_image);
    }

    let variant = await this.checkVariantMustExists(
      updateRequest.product_id,
      updateRequest.id,
    );

    variant = await this.prismaService.variant.update({
      where: {
        id: updateRequest.id,
        product_id: updateRequest.product_id,
      },
      data: {
        name: updateRequest.name,
        price: updateRequest.price,
        stock: updateRequest.stock,
        value: updateRequest.value,
        image_url: variantImage,
      },
    });

    return toVariantResponse(variant);
  }

  async deleteVariant(request: DeleteVariantRequest): Promise<VariantResponse> {
    const removeRequest: DeleteVariantRequest = this.validationService.validate(
      VariantValidation.Delete,
      request,
    );

    await this.productService.getProductById(removeRequest.product_id);
    await this.checkVariantMustExists(
      removeRequest.product_id,
      removeRequest.variant_id,
    );

    const variant = await this.prismaService.variant.delete({
      where: {
        id: removeRequest.variant_id,
        product_id: removeRequest.product_id,
      },
    });

    await this.uploadService.deleteFromS3(variant.image_url);

    return toVariantResponse(variant);
  }

  async listVariants(productId: string): Promise<VariantResponse[]> {
    await this.productService.getProductById(productId);
    const variants = await this.prismaService.variant.findMany({
      where: {
        product_id: productId,
      },
    });

    return variants.map((variant) => toVariantResponse(variant));
  }

  async getProductsAndVariantByIds(
    products: ShoppingCartResponse[],
  ): Promise<Variant[]> {
    // Mengumpulkan daftar product_id dari produk
    const productIds = products.map((product) => product.product_id);

    // Mengambil varian berdasarkan product_id dari produk
    const variants = await this.prismaService.variant.findMany({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });

    if (!variants) {
      throw new HttpException('Variants not found', 404);
    }

    return variants;
  }
}
