import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { UploadModule } from 'src/upload/upload.module';
import { ProductModule } from 'src/product/product.module';
import { ImageController } from './image.controller';

@Module({
  imports: [UploadModule, ProductModule],
  providers: [ImageService],
  exports: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
