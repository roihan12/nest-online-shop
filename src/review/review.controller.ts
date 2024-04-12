import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
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
import { GetCurrentUser } from '../auth/decorator/get-current-user.decorator';
import { ReviewService } from './review.service';
import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetReviewOfProduct,
  ReviewResponse,
  UpdateReviewRequest,
} from 'src/model/review.model';
import { Public } from 'src/auth/decorator/public..decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiArrayResponse(ReviewResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get all review user' })
  async getMyAllReview(
    @GetCurrentUserId() userId: string,
  ): Promise<WebResponse<ReviewResponse[]>> {
    const response = await this.reviewService.getReviewByUserId(userId);
    return {
      status: true,
      message: 'Get list review user Success',
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
    description: 'Success response delete review',
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
  @ApiOperation({ summary: 'Delete review' })
  async DeleteReview(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<boolean>> {
    const request: DeleteReviewRequest = {
      id,
      user_id: userId,
    };
    await this.reviewService.deleteReview(request);
    return {
      status: true,
      message: 'Delete review user success',
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
  @ApiSucessResponse(ReviewResponse)
  @ApiBody({
    type: CreateReviewRequest,
    description: 'Request body to create review user',
  })
  @ApiOperation({ summary: 'create review user' })
  async createReview(
    @GetCurrentUser('userId') userId: string,
    @Body() request: CreateReviewRequest,
  ): Promise<WebResponse<ReviewResponse>> {
    request.user_id = userId;
    const response = await this.reviewService.createReview(request);
    return {
      status: true,
      message: 'Create review success',
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
  @ApiSucessResponse(ReviewResponse)
  @ApiBody({
    type: UpdateReviewRequest,
    description: 'Request body to update review user',
  })
  @ApiOperation({ summary: 'update rwview user' })
  async updateReview(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser('userId') userId: string,
    @Body() request: UpdateReviewRequest,
  ): Promise<WebResponse<ReviewResponse>> {
    request.id = id;
    request.user_id = userId;
    const response = await this.reviewService.updateReview(request);
    return {
      status: true,
      message: 'Update review success',
      data: response,
    };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(240)
  @Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiSucessResponse(ReviewResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get review by id' })
  async getReviewById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WebResponse<ReviewResponse>> {
    const response = await this.reviewService.getReviewById(id);
    return {
      status: true,
      message: 'Get review by id success',
      data: response,
    };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(240)
  @Public()
  @Get('/products/:id')
  @HttpCode(HttpStatus.OK)
  @ApiArrayResponse(ReviewResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Get all reviews of product' })
  async reviewProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ReviewResponse[]>> {
    const request: GetReviewOfProduct = {
      product_id: id,
      page: page || 1,
      size: size || 10,
    };

    return await this.reviewService.getReviewByProductId(request);
  }
}
