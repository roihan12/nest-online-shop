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
import { Public } from 'src/auth/decorator/public..decorator';
import { VariantService } from './variant.service';
import {
  CreateVariantRequest,
  DeleteVariantRequest,
  GetVariantRequest,
  UpdateVariantRequest,
  VariantResponse,
} from 'src/model/variant.model';

@ApiTags('Variants')
@Controller('products/:productId/variants')
export class VariantController {
  constructor(private variantService: VariantService) {}

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
  @ApiCreateResponse(VariantResponse)
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
    type: CreateVariantRequest,
    description: 'Request body to create variant product',
  })
  @ApiOperation({ summary: 'Create new variant product ' })
  async createVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() request: CreateVariantRequest,
  ): Promise<WebResponse<VariantResponse>> {
    request.product_id = productId;
    const response = await this.variantService.createVariant(request, file);
    return {
      status: true,
      message: 'Create variant success',
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
  @ApiSucessResponse(VariantResponse)
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
    type: UpdateVariantRequest,
    description: 'Request body to update variant product',
  })
  @ApiOperation({ summary: 'Update products ' })
  async UpdateVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    request: UpdateVariantRequest,
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
  ): Promise<WebResponse<VariantResponse>> {
    request.product_id = productId;
    request.id = id;
    const response = await this.variantService.updateVariant(request, file);
    return {
      status: true,
      message: 'Update variant success',
      data: response,
    };
  }

  @Delete('/:id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @ApiBearerAuth()
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
  @ApiSucessResponse(VariantResponse)
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
  @ApiOperation({ summary: 'Delete variant product' })
  async deleteVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    const request: DeleteVariantRequest = {
      product_id: productId,
      variant_id: id,
    };
    await this.variantService.deleteVariant(request);
    return {
      status: true,
      message: 'Delete variant success',
      data: true,
    };
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiSucessResponse(VariantResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get variant by id' })
  async getVariantById(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<VariantResponse>> {
    const request: GetVariantRequest = {
      product_id: productId,
      variant_id: id,
    };
    const response = await this.variantService.getById(request);
    return {
      status: true,
      message: 'Get variant by id success',
      data: response,
    };
  }

  @Public()
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiArrayResponse(VariantResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'List variant of product' })
  async listProductVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<WebResponse<VariantResponse[]>> {
    const response = await this.variantService.listVariants(productId);
    return {
      status: true,
      message: 'Get list variant of product success',
      data: response,
    };
  }
}
