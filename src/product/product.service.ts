import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { UploadService } from 'src/upload/upload.service';
import { Logger } from 'winston';

@Injectable()
export class ProductService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private uploadService: UploadService,
  ) {}

  async getAllProduct(): Promise<any> {
    this.logger.debug(`ProductService.getAllProduct()`);
    return await this.prismaService.product.findMany();
  }
}
