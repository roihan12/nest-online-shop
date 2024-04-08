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
  ApiSucessResponse,
  BadRequestResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
  WebResponse,
} from '../model/web.model';
import { AccessTokenGuard } from '../auth/guard/accessToken.guard';
import { GetCurrentUser } from '../auth/decorator/get-current-user.decorator';
import { AddressService } from './address.service';
import {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from 'src/model/address.model';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(AddressResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get all address user' })
  async getAddresses(
    @GetCurrentUserId() userId: string,
  ): Promise<WebResponse<AddressResponse[]>> {
    const response = await this.addressService.listAddress(userId);
    return {
      status: true,
      message: 'Get list address Success',
      data: response,
    };
  }

  @Get('/:id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(AddressResponse)
  @ApiForbiddenResponse({
    description: 'Forbidden response',
    type: ForbiddenResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get address by id' })
  async getAddressById(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<AddressResponse>> {
    const response = await this.addressService.getAddressById(userId, id);
    return {
      status: true,
      message: 'Get address by id success',
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
    description: 'Success response logout',
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
  @ApiOperation({ summary: 'Delete address' })
  async DeleteUser(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    await this.addressService.remove(userId, id);
    return {
      status: true,
      message: 'Delete user success',
      data: true,
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
  @ApiSucessResponse(AddressResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiBody({
    type: UpdateAddressRequest,
    description: 'Request body to update user address',
  })
  @ApiOperation({ summary: 'Update user address' })
  async updateUser(
    @GetCurrentUser('userId') userId: string,
    @Body() request: UpdateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    const response = await this.addressService.updateAddress(userId, request);
    return {
      status: true,
      message: 'Update user address success',
      data: response,
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
  @ApiSucessResponse(AddressResponse)
  @ApiBody({
    type: CreateAddressRequest,
    description: 'Request body to create address user',
  })
  @ApiOperation({ summary: 'Create new User' })
  async createUser(
    @GetCurrentUser('userId') userId: string,
    @Body() request: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    const response = await this.addressService.createAddress(userId, request);
    return {
      status: true,
      message: 'Create user address success',
      data: response,
    };
  }
}
