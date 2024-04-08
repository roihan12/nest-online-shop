import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Image } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  DeleteProductImageRequest,
  GetProductImageRequest,
  ImageResponse,
} from 'src/model/image.model';
import { ProductService } from 'src/product/product.service';
import { UploadService } from 'src/upload/upload.service';
import { ImageValidation } from './image.validation';

@Injectable()
export class ImageService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private uploadService: UploadService,
    private productService: ProductService,
    private validationService: ValidationService,
  ) {}
  async createImageProduct(productId: string, url: string) {
    this.logger.debug(
      `ImageService.createImageProduct(${JSON.stringify(productId)} ${JSON.stringify(url)})`,
    );
    await this.prismaService.image.create({
      data: {
        url,
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });
  }

  async addImageProduct(
    productId: string,
    product_image: Express.Multer.File[],
  ): Promise<ImageResponse[]> {
    await this.productService.getProductById(productId);
    if (product_image) {
      await this.uploadService.uploadImageProductToS3(productId, product_image);
    } else {
      throw new BadRequestException('Product Image is required');
    }

    const productImages = await this.prismaService.image.findMany({
      where: {
        product_id: productId,
      },
    });

    return productImages.map((image) => this.toImageResponse(image));
  }
  async checkImageMustExists(
    productId: string,
    imageId: string,
  ): Promise<Image> {
    const image = await this.prismaService.image.findFirst({
      where: {
        id: imageId,
        product_id: productId,
      },
    });

    if (!image) {
      throw new HttpException('Image is not found', 404);
    }

    return image;
  }

  async deleteProductImages(
    request: DeleteProductImageRequest,
  ): Promise<ImageResponse> {
    const removeRequest: DeleteProductImageRequest =
      this.validationService.validate(ImageValidation.Delete, request);

    await this.productService.getProductById(removeRequest.product_id);
    await this.checkImageMustExists(
      removeRequest.product_id,
      removeRequest.image_id,
    );

    const image = await this.prismaService.image.delete({
      where: {
        id: removeRequest.image_id,
        product_id: removeRequest.product_id,
      },
    });

    await this.uploadService.deleteFromS3(image.url);

    return this.toImageResponse(image);
  }

  toImageResponse(imageProduct: Image): ImageResponse {
    return {
      id: imageProduct.id,
      url: imageProduct.url,
      product_id: imageProduct.product_id,
      created_at: imageProduct.created_at,
      updated_at: imageProduct.updated_at,
    };
  }

  async getById(request: GetProductImageRequest): Promise<ImageResponse> {
    const getRequest: GetProductImageRequest = this.validationService.validate(
      ImageValidation.GET,
      request,
    );

    await this.productService.getProductById(getRequest.product_id);

    const image = await this.checkImageMustExists(
      getRequest.product_id,
      getRequest.image_id,
    );

    return this.toImageResponse(image);
  }

  async listImage(productId: string): Promise<ImageResponse[]> {
    await this.productService.getProductById(productId);
    const images = await this.prismaService.image.findMany({
      where: {
        product_id: productId,
      },
    });

    return images.map((image) => this.toImageResponse(image));
  }
}
