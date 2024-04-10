import { TransactionService } from './transaction.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
  ApiOperation,
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
import {
  CreateTransactionRequest,
  TransactionResponse,
} from 'src/model/transaction.model';
@Controller('transaction')
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
}
