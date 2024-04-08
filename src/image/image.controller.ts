import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
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
import { Public } from 'src/auth/decorator/public..decorator';
import { ImageService } from './image.service';
import {
  CreateImageRequest,
  DeleteProductImageRequest,
  GetProductImageRequest,
  ImageResponse,
} from 'src/model/image.model';

@ApiTags('Images')
@Controller('products/:productId/images')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('/')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @UseInterceptors(FileInterceptor('files'))
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
  @ApiCreateResponse(ImageResponse)
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
    type: CreateImageRequest,
    description: 'Request body to create image product',
  })
  @ApiOperation({ summary: 'Create new image product ' })
  async createImageProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ): Promise<WebResponse<ImageResponse[]>> {
    const response = await this.imageService.addImageProduct(productId, files);
    return {
      status: true,
      message: 'Create image product success',
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
  @ApiOkResponse({
    description: 'Delete image product success',
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
  @ApiOperation({ summary: 'Delete image product' })
  async deleteVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    const request: DeleteProductImageRequest = {
      product_id: productId,
      image_id: id,
    };
    await this.imageService.deleteProductImages(request);
    return {
      status: true,
      message: 'Delete images success',
      data: true,
    };
  }

  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiSucessResponse(ImageResponse)
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
  @ApiOperation({ summary: 'Get variant by id' })
  async getImageById(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<ImageResponse>> {
    const request: GetProductImageRequest = {
      product_id: productId,
      image_id: id,
    };
    const response = await this.imageService.getById(request);
    return {
      status: true,
      message: 'Get image by id success',
      data: response,
    };
  }

  @Public()
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiArrayResponse(ImageResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'List image of product' })
  async listProductImage(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<WebResponse<ImageResponse[]>> {
    const response = await this.imageService.listImage(productId);
    return {
      status: true,
      message: 'Get list image of product success',
      data: response,
    };
  }
}
