import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  BillboardResponse,
  CreateBillboardRequest,
  UpdateBillboardRequest,
} from 'src/model/billboard.model';
import { Logger } from 'winston';
import { BillboardValidation } from './billboard.validation';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class BillboardService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private uploadService: UploadService,
  ) {}

  async getBillboard() {
    this.logger.debug('BillboardService.getBillboard()');
  }

  async createBillboard(
    request: CreateBillboardRequest,
    file: Express.Multer.File,
  ): Promise<BillboardResponse> {
    this.logger.debug(
      `BillboardService.createBillboard() ${JSON.stringify(request)}`,
    );

    const createRequest: CreateBillboardRequest =
      this.validationService.validate(BillboardValidation.Create, request);
    if (file) {
      const imageUrl = await this.uploadService.uploadImageProfileToS3(file);
      if (imageUrl) {
        createRequest.file = imageUrl;
      }
    }
    const billboard = await this.prismaService.billboard.create({
      data: {
        label: createRequest.label,
        imageUrl: createRequest.file,
      },
    });

    return {
      id: billboard.id,
      label: billboard.label,
      imageUrl: billboard.imageUrl,
      created_at: billboard.created_at,
      updated_at: billboard.updated_at,
    };
  }

  async updateBillboard(
    request: UpdateBillboardRequest,
    file?: Express.Multer.File,
  ): Promise<BillboardResponse> {
    this.logger.debug(
      `BillboardService.updateBillboard() ${JSON.stringify(request)}`,
    );

    const updateRequest: UpdateBillboardRequest =
      this.validationService.validate(BillboardValidation.Update, request);
    if (file) {
      const imageUrl = await this.uploadService.uploadImageProfileToS3(file);
      if (imageUrl) {
        updateRequest.file = imageUrl;
      }
    }

    const billboard = await this.prismaService.billboard.update({
      where: {
        id: updateRequest.id,
      },
      data: {
        label: updateRequest.label,
        imageUrl: updateRequest.file,
      },
    });

    if (!billboard) {
      throw new HttpException('Billboard not found', 404);
    }

    return {
      id: billboard.id,
      label: billboard.label,
      imageUrl: billboard.imageUrl,
      created_at: billboard.created_at,
      updated_at: billboard.updated_at,
    };
  }

  async getBillboardById(id: string): Promise<BillboardResponse> {
    this.logger.debug(`BillboardService.getBillboardById() ${id}`);
    const billboard = await this.prismaService.billboard.findFirst({
      where: {
        id,
      },
    });
    if (!billboard) {
      throw new HttpException('Billboard not found', 404);
    }
    return {
      id: billboard.id,
      label: billboard.label,
      imageUrl: billboard.imageUrl,
      created_at: billboard.created_at,
      updated_at: billboard.updated_at,
    };
  }

  async getAllBillboard(): Promise<BillboardResponse[]> {
    this.logger.debug(`BillboardService.getAllBillboard()`);
    const billboards = await this.prismaService.billboard.findMany();
    return billboards.map((billboard) => ({
      id: billboard.id,
      label: billboard.label,
      imageUrl: billboard.imageUrl,
      created_at: billboard.created_at,
      updated_at: billboard.updated_at,
    }));
  }

  async deleteBillboard(id: string): Promise<void> {
    this.logger.debug(`BillboardService.deleteBillboard() ${id}`);

    const billboard = await this.prismaService.billboard.findFirst({
      where: {
        id,
      },
    });
    if (!billboard) {
      throw new HttpException('Billboard not found', 404);
    }
    await this.prismaService.billboard.delete({
      where: {
        id,
      },
    });
  }
}
