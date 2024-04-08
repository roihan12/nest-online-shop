import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUserId } from '../auth/decorator/get-current-user-id.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiSucessResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
  WebResponse,
} from '../model/web.model';
import { AccessTokenGuard } from '../auth/guard/accessToken.guard';
import { GetCurrentUser } from '../auth/decorator/get-current-user.decorator';
import { WishlistService } from './wishlist.service';
import {
  CreateWishlistRequest,
  DeleteWishlistRequest,
  WishlistResponse,
} from 'src/model/wishlist.model';

@ApiTags('Wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(WishlistResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get all wishlist user' })
  async getMyWishlist(
    @GetCurrentUserId() userId: string,
  ): Promise<WebResponse<WishlistResponse[]>> {
    const response = await this.wishlistService.listWishlist(userId);
    return {
      status: true,
      message: 'Get list wishlist Success',
      data: response,
    };
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: 'Success response delete wishlist',
    type: WebResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden response',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Delete wishlist' })
  async DeleteUser(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    const request: DeleteWishlistRequest = {
      id,
      user_id: userId,
    };
    await this.wishlistService.remove(request);
    return {
      status: true,
      message: 'Delete wishlist user success',
      data: true,
    };
  }

  @Post('/')
  @UseGuards(AccessTokenGuard)
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
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiSucessResponse(WishlistResponse)
  @ApiBody({
    type: CreateWishlistRequest,
    description: 'Request body to create new wishlist user',
  })
  @ApiOperation({ summary: 'create new wishlist user' })
  async createWishlist(
    @GetCurrentUser('userId') userId: string,
    @Body() request: CreateWishlistRequest,
  ): Promise<WebResponse<WishlistResponse>> {
    request.user_id = userId;
    const response = await this.wishlistService.addToWishlist(request);
    return {
      status: true,
      message: 'Create user wishlist success',
      data: response,
    };
  }

  @Post('delete-many')
  @UseGuards(AccessTokenGuard)
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
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiSucessResponse(WishlistResponse)
  @ApiBody({
    type: Array<string>,
    description: 'Request body to delete many wishlist user',
  })
  @ApiOperation({ summary: 'Delete many wishlist user' })
  async deleteMany(
    @GetCurrentUser('userId') userId: string,
    @Body('wishlistId', ParseUUIDPipe) wishlistId: string[],
  ): Promise<WebResponse<boolean>> {
    if (!wishlistId || wishlistId.length === 0) {
      throw new Error('No Wishlist ID provided');
    }
    await this.wishlistService.removeMany(userId, wishlistId);

    return {
      status: true,
      message: 'Delete many wishlist user success',
      data: true,
    };
  }
}
