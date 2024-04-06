import { CategoryService } from './category.service';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiArrayResponse,
  ApiCreateResponse,
  ApiSucessResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
  WebResponse,
} from 'src/model/web.model';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from 'src/model/category.model';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiCreateResponse(CategoryResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiBody({
    type: CreateCategoryRequest,
    description: 'Request body to create category',
  })
  @ApiOperation({ summary: 'Create new category ' })
  async createCategory(
    @Body() request: CreateCategoryRequest,
  ): Promise<WebResponse<CategoryResponse>> {
    const response = await this.categoryService.createCategory(request);
    return {
      status: true,
      message: 'Create category success',
      data: response,
    };
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(CategoryResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiBody({
    type: UpdateCategoryRequest,
    description: 'Request body to update category',
  })
  @ApiOperation({ summary: 'Update category ' })
  async UpdateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    request: UpdateCategoryRequest,
  ): Promise<WebResponse<CategoryResponse>> {
    request.id = id;
    const response = await this.categoryService.updateCategory(request);
    return {
      status: true,
      message: 'Update category success',
      data: response,
    };
  }

  @Delete('/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(CategoryResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Delete category' })
  async deleteBillboard(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    await this.categoryService.deleteCategory(id);
    return {
      status: true,
      message: 'Delete category success',
      data: true,
    };
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(CategoryResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get category by id' })
  async getBillboardById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<CategoryResponse>> {
    const response = await this.categoryService.getCategoryById(id);
    return {
      status: true,
      message: 'Get category by id success',
      data: response,
    };
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiArrayResponse(CategoryResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get all categories' })
  async getAllBillboards(): Promise<WebResponse<CategoryResponse[]>> {
    const response = await this.categoryService.getAllCategory();
    return {
      status: true,
      message: 'Get all categories success',
      data: response,
    };
  }
}
