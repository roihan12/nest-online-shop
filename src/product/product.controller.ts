import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
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
import { ProductService } from './product.service';
import {
  CreateProductRequest,
  ProductResponse,
  SearchProductsRequest,
  UpdateProductRequest,
} from 'src/model/product.model';
import { Public } from 'src/auth/decorator/public..decorator';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 4 },
      { name: 'variant_images', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
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
  @ApiCreateResponse(ProductResponse)
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
    type: CreateProductRequest,
    description: 'Request body to create product',
  })
  @ApiOperation({ summary: 'Create new product ' })
  async createProduct(
    @UploadedFiles()
    files: {
      product_images?: Express.Multer.File[];
      variant_images?: Express.Multer.File[];
    },
    @Body() request: CreateProductRequest,
  ): Promise<WebResponse<ProductResponse>> {
    console.log(files);
    console.log(typeof files);
    const valid = await this.validateFiles(files);
    if (!valid) {
      throw new HttpException(
        'Invalid files must be image png, jpg, or jpeg and less than 4MB',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      typeof request.is_variant === 'string' &&
      request.is_variant === 'false'
    ) {
      request.is_variant = false;
    }
    request.price = Number(request.price);
    request.is_featured = Boolean(request.is_featured);
    request.is_variant = Boolean(request.is_variant);
    request.weight = Number(request.weight);
    request.variants?.map((v) => {
      v.price = Number(v.price);
      v.stock = Number(v.stock);
    });

    const response = await this.productService.createProduct(
      request,
      files.product_images,
      files.variant_images,
    );
    return {
      status: true,
      message: 'Create Product success',
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
  @ApiSucessResponse(ProductResponse)
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
    type: UpdateProductRequest,
    description: 'Request body to update product',
  })
  @ApiOperation({ summary: 'Update product ' })
  async UpdateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    request: UpdateProductRequest,
  ): Promise<WebResponse<ProductResponse>> {
    request.id = id;
    const response = await this.productService.updateProduct(request);
    return {
      status: true,
      message: 'Update product success',
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
  @ApiOkResponse({
    description: 'Delete product success',
    type: WebResponse,
  })
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
  @ApiOperation({ summary: 'Delete product' })
  async deleteBrand(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    await this.productService.deleteProduct(id);
    return {
      status: true,
      message: 'Delete brand success',
      data: true,
    };
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiSucessResponse(ProductResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get product by id' })
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<ProductResponse>> {
    const response = await this.productService.getProductById(id);
    return {
      status: true,
      message: 'Get product by id success',
      data: response,
    };
  }

  @Public()
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiArrayResponse(ProductResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get all or search products' })
  async searchProduct(
    @Query('name') name?: string,
    @Query('brand_id') brand_id?: string,
    @Query('category_id') category_id?: string,
    @Query('sort')
    sort?: 'ASC' | 'DESC' | 'Price (Low to High)' | 'Price (High to Low)',
    @Query('pmax') pmax?: number,
    @Query('pmin') pmin?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ProductResponse[]>> {
    const request: SearchProductsRequest = {
      name: name,
      brand_id: brand_id,
      category_id: category_id,
      pmax: pmax,
      pmin: pmin,
      sort: sort,
      page: page || 1,
      size: size || 10,
    };
    return await this.productService.search(request);
  }

  isValidImage(image: any): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (!allowedMimeTypes.includes(image.mimetype)) {
      return false;
    }
    if (image.size > maxSizeInBytes) {
      return false;
    }
    return true;
  }

  async validateFiles(files: { [key: string]: any[] }): Promise<boolean> {
    for (const key in files) {
      if (Object.prototype.hasOwnProperty.call(files, key)) {
        const fileList = files[key];
        for (const file of fileList) {
          if (!this.isValidImage(file)) {
            console.log(
              `File '${file.originalname}' in '${key}' is not a valid image.`,
            );
            return false;
          }
        }
      }
    }
    return true;
  }
}
