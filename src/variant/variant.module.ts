import { Module } from '@nestjs/common';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';
import { UploadModule } from 'src/upload/upload.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [UploadModule, ProductModule],
  providers: [VariantService],
  controllers: [VariantController],
})
export class VariantModule {}
