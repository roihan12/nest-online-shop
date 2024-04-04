import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ImageService } from 'src/image/image.service';

@Module({
  providers: [UploadService, ImageService],
  exports: [UploadService],
})
export class UploadModule {}
