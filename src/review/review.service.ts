import { WebResponse } from './../model/web.model';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateReviewRequest,
  DeleteReviewRequest,
  GetReviewOfProduct,
  ReviewResponse,
  UpdateReviewRequest,
} from 'src/model/review.model';
import { ProductService } from 'src/product/product.service';
import { TransactionItemsService } from 'src/transaction-items/transaction-items.service';
import { UserService } from 'src/user/user.service';
import { ReviewValidation } from './review.validation';
import { Review } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private userService: UserService,
    private productService: ProductService,
    private transactionItemService: TransactionItemsService,
  ) {}

  async createReview(request: CreateReviewRequest): Promise<ReviewResponse> {
    this.logger.debug(
      `ReviewService.createReview(${JSON.stringify(request)}) `,
    );
    const createRequest: CreateReviewRequest = this.validationService.validate(
      ReviewValidation.Create,
      request,
    );

    await this.userService.getProfile(createRequest.user_id);
    await this.productService.getProductById(createRequest.product_id);
    await this.transactionItemService.getTransactionItemsByTransactionId(
      createRequest.transactions_item_id,
    );

    if (createRequest.rating < 1 || createRequest.rating > 5) {
      throw new HttpException('Rating must be between 1 and 5', 400);
    }

    const newReview = await this.prismaService.review.create({
      data: {
        product_id: createRequest.product_id,
        user_id: createRequest.user_id,
        transactions_item_id: createRequest.transactions_item_id,
        rating: createRequest.rating,
        message: createRequest.message,
      },
    });

    return this.toReviewResponse(newReview);
  }

  async updateReview(request: UpdateReviewRequest): Promise<ReviewResponse> {
    this.logger.debug(
      `ReviewService.updateReview(${JSON.stringify(request)}) `,
    );
    const updateRequest: UpdateReviewRequest = this.validationService.validate(
      ReviewValidation.Update,
      request,
    );

    const review = await this.checkReviewMustExists(
      updateRequest.user_id,
      updateRequest.id,
    );

    if (updateRequest.rating < 1 || updateRequest.rating > 5) {
      throw new HttpException('Rating must be between 1 and 5', 400);
    }

    const updatedReview = await this.prismaService.review.update({
      where: {
        id: review.id,
      },
      data: {
        rating: updateRequest.rating,
        message: updateRequest.message,
      },
    });

    return this.toReviewResponse(updatedReview);
  }

  async deleteReview(request: DeleteReviewRequest): Promise<ReviewResponse> {
    this.logger.debug(
      `ReviewService.deleteReview(${JSON.stringify(request)}) `,
    );
    const deleteRequest: DeleteReviewRequest = this.validationService.validate(
      ReviewValidation.Delete,
      request,
    );
    const review = await this.checkReviewMustExists(
      deleteRequest.user_id,
      deleteRequest.id,
    );
    await this.prismaService.review.delete({
      where: {
        id: review.id,
      },
    });
    return this.toReviewResponse(review);
  }

  async checkReviewMustExists(userId: string, id: string): Promise<Review> {
    const review = await this.prismaService.review.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    });
    if (!review) {
      throw new HttpException('Review not found', 404);
    }
    return review;
  }

  async getReviewById(id: string): Promise<ReviewResponse> {
    const review = await this.prismaService.review.findFirst({
      where: {
        id: id,
      },
    });
    if (!review) {
      throw new HttpException('Review not found', 404);
    }
    return this.toReviewResponse(review);
  }

  async getReviewByProductId(
    request: GetReviewOfProduct,
  ): Promise<WebResponse<ReviewResponse[]>> {
    this.logger.debug(
      `ReviewService.getReviewByProductId(${JSON.stringify(request)}) `,
    );
    const reviewRequest: GetReviewOfProduct = this.validationService.validate(
      ReviewValidation.GetReviews,
      request,
    );

    const skip = (reviewRequest.page - 1) * reviewRequest.size;
    const reviews = await this.prismaService.review.findMany({
      where: {
        product_id: reviewRequest.product_id,
      },
      take: reviewRequest.size,
      skip,
    });

    const total = await this.prismaService.review.count({
      where: {
        product_id: reviewRequest.product_id,
      },
    });
    return {
      status: true,
      message: 'Search Success',
      data: reviews.map((review) => this.toReviewResponse(review)),
      paging: {
        count_item: total,
        current_page: reviewRequest.page,
        size: reviewRequest.size,
        total_page: Math.ceil(total / reviewRequest.size),
      },
    };
  }

  async getReviewByUserId(id: string): Promise<ReviewResponse[]> {
    const reviews = await this.prismaService.review.findMany({
      where: {
        user_id: id,
      },
    });
    return reviews.map((review) => this.toReviewResponse(review));
  }

  toReviewResponse(review: Review): ReviewResponse {
    return {
      id: review.id,
      product_id: review.product_id,
      rating: review.rating,
      message: review.message,
      created_at: review.created_at,
      updated_at: review.updated_at,
    };
  }
}
