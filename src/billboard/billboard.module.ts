import { Module } from '@nestjs/common';
import { BillboardService } from './billboard.service';
import { BillboardController } from './billboard.controller';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [UploadModule],
  providers: [BillboardService],
  controllers: [BillboardController],
})
export class BillboardModule {}
