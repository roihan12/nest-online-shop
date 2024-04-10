import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateShoppingCartRequest,
  DeleteShoppingCartRequest,
  ShoppingCartResponse,
  UpdateShoppingCartRequest,
} from 'src/model/shopping-cart.model';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { ShoopingCartValidation } from './shopping-cart.validation';
import { Product, ShoppingCart, Variant } from '@prisma/client';
import { VariantService } from 'src/variant/variant.service';

@Injectable()
export class ShoppingCartService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private userService: UserService,
    private productService: ProductService,
    private variantService: VariantService,
  ) {}

  async addToCart(
    request: CreateShoppingCartRequest,
  ): Promise<ShoppingCartResponse> {
    this.logger.debug(`ShoppingCartService.addToCart(${request}) `);

    const createRequest: CreateShoppingCartRequest =
      this.validationService.validate(ShoopingCartValidation.Create, request);

    await this.userService.getProfile(createRequest.user_id);
    await this.productService.getProductById(createRequest.product_id);
    await this.variantService.checkVariantMustExists(
      createRequest.product_id,
      createRequest.variant_id,
    );

    const newShoppingCart = await this.prismaService.shoppingCart.create({
      data: {
        user_id: createRequest.user_id,
        product_id: createRequest.product_id,
        qty: createRequest.quantity,
        variant_id: createRequest.variant_id,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return this.toShoppingCartResponse(
      newShoppingCart,
      newShoppingCart.product,
      newShoppingCart.variant,
    );
  }

  async updateCart(
    request: UpdateShoppingCartRequest,
  ): Promise<ShoppingCartResponse> {
    this.logger.debug(`ShoppingCartService.updateCart(${request}) `);

    const updateRequest: UpdateShoppingCartRequest =
      this.validationService.validate(ShoopingCartValidation.Update, request);
    await this.userService.getProfile(updateRequest.user_id);
    await this.variantService.checkVariantMustExists(
      updateRequest.product_id,
      updateRequest.variant_id,
    );

    const updateShoppingCart = await this.prismaService.shoppingCart.update({
      where: {
        id: updateRequest.id,
        user_id: updateRequest.user_id,
      },
      data: {
        product_id: updateRequest.product_id,
        qty: updateRequest.quantity,
        variant_id: updateRequest.variant_id,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return this.toShoppingCartResponse(
      updateShoppingCart,
      updateShoppingCart.product,
      updateShoppingCart.variant,
    );
  }

  async remove(request: DeleteShoppingCartRequest): Promise<void> {
    this.logger.debug(`ShoppingCartService.remove(${request}) `);

    const deleteRequest: DeleteShoppingCartRequest =
      this.validationService.validate(ShoopingCartValidation.Delete, request);
    const cart = await this.prismaService.shoppingCart.findFirst({
      where: {
        id: deleteRequest.id,
        user_id: deleteRequest.user_id,
      },
    });
    if (!cart) {
      throw new HttpException('Shopping cart not found', 404);
    }

    await this.prismaService.shoppingCart.delete({
      where: {
        id: deleteRequest.id,
        user_id: deleteRequest.user_id,
      },
    });
  }

  async removeMany(userId: string, cartId: string[]): Promise<void> {
    if (!cartId || cartId.length === 0) {
      throw new Error('No cart id');
    }
    for (const id of cartId) {
      const cart = await this.prismaService.shoppingCart.findFirst({
        where: {
          id: id,
          user_id: userId,
        },
      });

      if (!cart) {
        throw new HttpException(`Cart with ID ${id} not found`, 404);
      }

      await this.prismaService.wishlist.delete({
        where: {
          id,
        },
      });
    }
  }
  async listCart(userId: string): Promise<ShoppingCartResponse[]> {
    const myCart = await this.prismaService.shoppingCart.findMany({
      where: {
        user_id: userId,
      },
      include: {
        product: true,
        variant: true,
      },
    });
    console.log(myCart);
    return myCart.map((cart) =>
      this.toShoppingCartResponse(cart, cart.product, cart.variant),
    );
  }

  toShoppingCartResponse(
    item: ShoppingCart,
    product: Product,
    variant: Variant,
  ): ShoppingCartResponse {
    return {
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product: product,
      variants: variant,
      quantity: item.qty,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}
