import { UpdateShoppingCartRequest } from './../model/shopping-cart.model';
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
  ApiArrayResponse,
  ApiSucessResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
  WebResponse,
} from '../model/web.model';
import { AccessTokenGuard } from '../auth/guard/accessToken.guard';
import { GetCurrentUser } from '../auth/decorator/get-current-user.decorator';
import { ShoppingCartService } from './shopping-cart.service';
import {
  CreateShoppingCartRequest,
  DeleteShoppingCartRequest,
  ShoppingCartResponse,
} from 'src/model/shopping-cart.model';

@ApiTags('Shopping-Cart')
@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private shoppingCartService: ShoppingCartService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiArrayResponse(ShoppingCartResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get all shopping-cart user' })
  async getMyShoppingCart(
    @GetCurrentUserId() userId: string,
  ): Promise<WebResponse<ShoppingCartResponse[]>> {
    const response = await this.shoppingCartService.listCart(userId);
    return {
      status: true,
      message: 'Get list shopping cart Success',
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
  @ApiOperation({ summary: 'Delete item shopping cart' })
  async DeleteItemShoppingCart(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    const request: DeleteShoppingCartRequest = {
      id,
      user_id: userId,
    };
    await this.shoppingCartService.remove(request);
    return {
      status: true,
      message: 'Delete item shopping cart user success',
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
  @ApiSucessResponse(ShoppingCartResponse)
  @ApiBody({
    type: CreateShoppingCartRequest,
    description: 'Request body to create add item to shopping cart user',
  })
  @ApiOperation({ summary: 'create item shopping cart user' })
  async createItemShoppingCart(
    @GetCurrentUser('userId') userId: string,
    @Body() request: CreateShoppingCartRequest,
  ): Promise<WebResponse<ShoppingCartResponse>> {
    request.user_id = userId;
    const response = await this.shoppingCartService.addToCart(request);
    return {
      status: true,
      message: 'Create item shopping cart success',
      data: response,
    };
  }

  @Patch('/:id')
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
  @ApiSucessResponse(ShoppingCartResponse)
  @ApiBody({
    type: UpdateShoppingCartRequest,
    description: 'Request body to update item shopping cart user',
  })
  @ApiOperation({ summary: 'update item shopping cart user' })
  async updateItemShoppingCart(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser('userId') userId: string,
    @Body() request: UpdateShoppingCartRequest,
  ): Promise<WebResponse<ShoppingCartResponse>> {
    request.id = id;
    request.user_id = userId;
    const response = await this.shoppingCartService.updateCart(request);
    return {
      status: true,
      message: 'Update item shopping cart success',
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
  @ApiSucessResponse(ShoppingCartResponse)
  @ApiBody({
    type: Array<string>,
    description: 'Request body to delete many wishlist user',
  })
  @ApiOperation({ summary: 'Delete many wishlist user' })
  async deleteMany(
    @GetCurrentUser('userId') userId: string,
    @Body('cartId', ParseUUIDPipe) cartId: string[],
  ): Promise<WebResponse<boolean>> {
    if (!cartId || cartId.length === 0) {
      throw new Error('No cart ID provided');
    }
    await this.shoppingCartService.removeMany(userId, cartId);

    return {
      status: true,
      message: 'Delete many shopping cart user success',
      data: true,
    };
  }
}
