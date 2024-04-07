import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UploadModule } from 'src/upload/upload.module';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';

@Module({
  imports: [UploadModule],
  providers: [ProductService, BrandService, CategoryService],
  controllers: [ProductController],
})
export class ProductModule {}
