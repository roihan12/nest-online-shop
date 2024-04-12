import { TransactionService } from './transaction.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
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
import {
  CreateTransactionRequest,
  FilterTransactionRequest,
  TransactionResponse,
  TransactionStatus,
  UpdateTransactionRequest,
} from 'src/model/transaction.model';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Public } from 'src/auth/decorator/public..decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

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
  @ApiSucessResponse(TransactionResponse)
  @ApiBody({
    type: CreateTransactionRequest,
    description: 'Request body to create transaction item user',
  })
  @ApiOperation({ summary: 'create transaction user' })
  async createTransaction(
    @GetCurrentUserId() userId: string,
    @Body() request: CreateTransactionRequest,
  ): Promise<WebResponse<TransactionResponse>> {
    request.user_id = userId;
    const response = await this.transactionService.createTransaction(request);
    return {
      status: true,
      message: 'Create transaction success',
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
  @ApiSucessResponse(TransactionResponse)
  @ApiBody({
    type: CreateTransactionRequest,
    description: 'Request body to create transaction item user',
  })
  @ApiOperation({ summary: 'create transaction user' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() request: UpdateTransactionRequest,
  ): Promise<WebResponse<TransactionResponse>> {
    const response = await this.transactionService.updateTransactionStatus({
      transaction_id: id,
      statusTransaction: request.status,
    });
    return {
      status: true,
      message: 'Update transaction success',
      data: response,
    };
  }
  @Public()
  @Post('/notification')
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
  @ApiOkResponse({
    type: WebResponse,
  })
  @ApiOperation({ summary: 'Get notification transaction user' })
  async transactionNotification(
    @Body() request: any,
  ): Promise<WebResponse<TransactionResponse>> {
    await this.transactionService.PaymentNotification(request);
    return {
      status: true,
      message: 'OK',
      data: null,
    };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(240)
  @Get('/users')
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
  @ApiArrayResponse(TransactionResponse)
  @ApiOperation({ summary: 'Get list all transaction user' })
  async getListTransactionUser(
    @GetCurrentUserId() userId: string,
    @Query('status') status?: TransactionStatus,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<TransactionResponse[]>> {
    const request: FilterTransactionRequest = {
      status,
      page: page || 1,
      size: size || 10,
    };

    return await this.transactionService.getTransactionByUserId(
      userId,
      request,
    );
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(240)
  @Get('/')
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
  @ApiArrayResponse(TransactionResponse)
  @ApiOperation({ summary: 'Get list all transaction' })
  async getListTransaction(
    @Query('status') status?: TransactionStatus,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<TransactionResponse[]>> {
    const request: FilterTransactionRequest = {
      status,
      page: page || 1,
      size: size || 10,
    };

    return await this.transactionService.getTransactionByAdmin(request);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(240)
  @Get('/:id')
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
  @ApiArrayResponse(TransactionResponse)
  @ApiOperation({ summary: 'Get list all transaction user' })
  async getTransactionById(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<WebResponse<TransactionResponse>> {
    const response = await this.transactionService.getTransactionByIdWithUserId(
      id,
      userId,
    );
    return {
      status: true,
      message: 'Get list transaction success',
      data: response,
    };
  }
}
