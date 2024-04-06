import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { UploadService } from 'src/upload/upload.service';
import {
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from 'src/model/brand.model';
import { BrandValidation } from './brand.validation';

@Injectable()
export class BrandService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private uploadService: UploadService,
  ) {}

  async createBrand(
    request: CreateBrandRequest,
    file: Express.Multer.File,
  ): Promise<BrandResponse> {
    this.logger.debug(`BrandService.createBrand() ${JSON.stringify(request)}`);

    const createRequest: CreateBrandRequest = this.validationService.validate(
      BrandValidation.Create,
      request,
    );
    if (file) {
      const imageUrl = await this.uploadService.uploadImageProfileToS3(file);
      if (imageUrl) {
        createRequest.file = imageUrl;
      }
    }
    const newBrand = await this.prismaService.brand.create({
      data: {
        name: createRequest.name,
        image_url: createRequest.file,
      },
    });

    return {
      id: newBrand.id,
      name: newBrand.name,
      imageUrl: newBrand.image_url,
      created_at: newBrand.created_at,
      updated_at: newBrand.updated_at,
    };
  }

  async updateBrand(
    request: UpdateBrandRequest,
    file?: Express.Multer.File,
  ): Promise<BrandResponse> {
    this.logger.debug(`BrandService.updateBrand() ${JSON.stringify(request)}`);

    const updateRequest: UpdateBrandRequest = this.validationService.validate(
      BrandValidation.Update,
      request,
    );
    if (file) {
      const imageUrl = await this.uploadService.uploadImageProfileToS3(file);
      if (imageUrl) {
        updateRequest.file = imageUrl;
      }
    }

    const updateBrand = await this.prismaService.brand.update({
      where: {
        id: updateRequest.id,
      },
      data: {
        name: updateRequest.name,
        image_url: updateRequest.file,
      },
    });

    if (!updateBrand) {
      throw new HttpException('Brand not found', 404);
    }

    return {
      id: updateBrand.id,
      name: updateBrand.name,
      imageUrl: updateBrand.image_url,
      created_at: updateBrand.created_at,
      updated_at: updateBrand.updated_at,
    };
  }

  async getBrandById(id: string): Promise<BrandResponse> {
    this.logger.debug(`BrandService.getBrandById() ${id}`);
    const brand = await this.prismaService.brand.findFirst({
      where: {
        id,
      },
    });
    if (!brand) {
      throw new HttpException('Brand not found', 404);
    }
    return {
      id: brand.id,
      name: brand.name,
      imageUrl: brand.image_url,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
    };
  }

  async getAllBrand(): Promise<BrandResponse[]> {
    this.logger.debug(`BrandService.getAllBrand()`);
    const brands = await this.prismaService.brand.findMany();
    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      imageUrl: brand.image_url,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
    }));
  }

  async deleteBrand(id: string): Promise<void> {
    this.logger.debug(`BrandService.deleteBrand() ${id}`);

    const brand = await this.prismaService.brand.findFirst({
      where: {
        id,
      },
    });
    if (!brand) {
      throw new HttpException('Brand not found', 404);
    }
    await this.prismaService.brand.delete({
      where: {
        id,
      },
    });
  }
}
