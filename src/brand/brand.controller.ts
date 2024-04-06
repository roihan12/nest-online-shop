import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { BrandService } from './brand.service';
import {
  BrandResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from 'src/model/brand.model';

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @UseInterceptors(FileInterceptor('file'))
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
  @ApiCreateResponse(BrandResponse)
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
    type: CreateBrandRequest,
    description: 'Request body to create brand',
  })
  @ApiOperation({ summary: 'Create new brand ' })
  async createBrand(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() request: CreateBrandRequest,
  ): Promise<WebResponse<BrandResponse>> {
    const response = await this.brandService.createBrand(request, file);
    return {
      status: true,
      message: 'Create new brand success',
      data: response,
    };
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @UseInterceptors(FileInterceptor('file', {}))
  @ApiConsumes('multipart/form-data')
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
  @ApiSucessResponse(BrandResponse)
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
    type: UpdateBrandRequest,
    description: 'Request body to update brand',
  })
  @ApiOperation({ summary: 'Update brand ' })
  async UpdateBrand(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    request: UpdateBrandRequest,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 2048 })
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file?: Express.Multer.File,
  ): Promise<WebResponse<BrandResponse>> {
    request.id = id;
    const response = await this.brandService.updateBrand(request, file);
    return {
      status: true,
      message: 'Update brand success',
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
    description: 'Delete brand success',
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
  @ApiOperation({ summary: 'Delete brand' })
  async deleteBrand(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    await this.brandService.deleteBrand(id);
    return {
      status: true,
      message: 'Delete brand success',
      data: true,
    };
  }

  @Get('/:id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(BrandResponse)
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
  @ApiOperation({ summary: 'Get billboard by id' })
  async getBillboardById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<BrandResponse>> {
    const response = await this.brandService.getBrandById(id);
    return {
      status: true,
      message: 'Get brand by id success',
      data: response,
    };
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiArrayResponse(BrandResponse)
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
  @ApiOperation({ summary: 'Get all brand' })
  async getAllBrands(): Promise<WebResponse<BrandResponse[]>> {
    const response = await this.brandService.getAllBrand();
    return {
      status: true,
      message: 'Get all brands success',
      data: response,
    };
  }
}
