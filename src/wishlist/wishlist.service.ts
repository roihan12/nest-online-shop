import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateWishlistRequest,
  DeleteWishlistRequest,
  WishlistResponse,
} from 'src/model/wishlist.model';
import { WishlistValidation } from './wishlist.validation';
import { UserService } from 'src/user/user.service';
import { ProductService } from 'src/product/product.service';
import { Product, Wishlist } from '@prisma/client';

@Injectable()
export class WishlistService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private userService: UserService,
    private productService: ProductService,
  ) {}

  async addToWishlist(
    request: CreateWishlistRequest,
  ): Promise<WishlistResponse> {
    this.logger.debug(`WishlistService.addToWishlist(${request}) `);

    const createRequest: CreateWishlistRequest =
      this.validationService.validate(WishlistValidation.Create, request);

    await this.userService.getProfile(createRequest.user_id);
    await this.productService.getProductById(createRequest.product_id);

    const newWishlist = await this.prismaService.wishlist.create({
      data: {
        user_id: createRequest.user_id,
        product_id: createRequest.product_id,
      },
      include: {
        Product: true,
      },
    });

    return this.toWishlistResponse(newWishlist, newWishlist.Product);
  }

  async remove(request: DeleteWishlistRequest): Promise<void> {
    this.logger.debug(`WishlistService.remove(${request}) `);

    const deleteRequest: DeleteWishlistRequest =
      this.validationService.validate(WishlistValidation.Delete, request);
    const whislist = await this.prismaService.wishlist.findFirst({
      where: {
        id: deleteRequest.id,
        user_id: deleteRequest.user_id,
      },
    });
    if (!whislist) {
      throw new HttpException('Wishlist not found', 404);
    }

    await this.prismaService.wishlist.delete({
      where: {
        id: deleteRequest.id,
        user_id: deleteRequest.user_id,
      },
    });
  }

  async removeMany(userId: string, wishlistId: string[]): Promise<void> {
    if (!wishlistId || wishlistId.length === 0) {
      throw new Error('No cart ids');
    }
    for (const id of wishlistId) {
      const wishlist = await this.prismaService.wishlist.findFirst({
        where: {
          id: id,
          user_id: userId,
        },
      });

      if (!wishlist) {
        throw new HttpException(`Wishlist with ID ${id} not found`, 404);
      }

      await this.prismaService.wishlist.delete({
        where: {
          id,
        },
      });
    }
  }
  async listWishlist(userId: string): Promise<WishlistResponse[]> {
    const myWishlist = await this.prismaService.wishlist.findMany({
      where: {
        user_id: userId,
      },
      include: {
        Product: true,
      },
    });
    return myWishlist.map((wishlist) =>
      this.toWishlistResponse(wishlist, wishlist.Product),
    );
  }

  toWishlistResponse(wishlist: Wishlist, product: Product[]): WishlistResponse {
    return {
      id: wishlist.id,
      user_id: wishlist.user_id,
      product: product,
      created_at: wishlist.created_at,
      updated_at: wishlist.updated_at,
    };
  }
}
