import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from 'src/model/category.model';
import { CategoryValidation } from './category.validation';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getCategoryById(id: string): Promise<CategoryResponse> {
    this.logger.debug('CategoryService.getCategoryByid()');

    const category = await this.prismaService.category.findFirst({
      where: {
        id,
      },
    });

    if (!category) {
      throw new HttpException('Category not found', 404);
    }

    return {
      id: category.id,
      name: category.name,
      billboardId: category.billboard_id,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  async createCategory(
    request: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    this.logger.debug('CategoryService.createCategory()');

    const createRequest: CreateCategoryRequest =
      this.validationService.validate(CategoryValidation.Create, request);

    const newCategory = await this.prismaService.category.create({
      data: {
        name: createRequest.name,
        billboard_id: createRequest.billboardId,
      },
    });

    return {
      id: newCategory.id,
      name: newCategory.name,
      billboardId: newCategory.billboard_id,
      created_at: newCategory.created_at,
      updated_at: newCategory.updated_at,
    };
  }

  async updateCategory(
    request: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    this.logger.debug('CategoryService.updateCategory()');

    const updateRequest: UpdateCategoryRequest =
      this.validationService.validate(CategoryValidation.Update, request);

    const category = await this.prismaService.category.update({
      where: {
        id: updateRequest.id,
      },
      data: {
        name: updateRequest.name,
        billboard_id: updateRequest.billboardId,
      },
    });

    return {
      id: category.id,
      name: category.name,
      billboardId: category.billboard_id,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  async deleteCategory(id: string): Promise<void> {
    this.logger.debug('CategoryService.deleteCategory()');

    const category = await this.getCategoryById(id);
    if (!category) {
      throw new HttpException('Category not found', 404);
    }

    await this.prismaService.category.delete({
      where: {
        id,
      },
    });
  }

  async getAllCategory(): Promise<CategoryResponse[]> {
    this.logger.debug('CategoryService.getAllCategory()');
    const categories = await this.prismaService.category.findMany();
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      billboardId: category.billboard_id,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));
  }
}
