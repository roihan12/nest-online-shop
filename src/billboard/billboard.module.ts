import { Module } from '@nestjs/common';
import { BillboardService } from './billboard.service';
import { BillboardController } from './billboard.controller';
import { UploadService } from 'src/upload/upload.service';
import { ImageService } from 'src/image/image.service';

@Module({
  providers: [BillboardService, UploadService, ImageService],
  controllers: [BillboardController],
})
export class BillboardModule {}
