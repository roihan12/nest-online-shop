import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UploadModule } from 'src/upload/upload.module';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [UploadModule, SearchModule],
  providers: [ProductService, BrandService, CategoryService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
