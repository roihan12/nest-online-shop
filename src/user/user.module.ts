import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadService } from 'src/upload/upload.service';
import { ImageService } from 'src/image/image.service';

@Module({
  providers: [UserService, UploadService, ImageService],
  controllers: [UserController],
})
export class UserModule {}
