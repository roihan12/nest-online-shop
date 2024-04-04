import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class ImageService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
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
}
