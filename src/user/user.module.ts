import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadService } from 'src/upload/upload.service';

@Module({
  providers: [UserService, UploadService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
