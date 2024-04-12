import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class TransactionItemsService {
  constructor(private prismaService: PrismaService) {}

  async createTransactionItems(
    products: any[],
    transaction_id: string,
  ): Promise<any> {
    const transactionItemsData = products.map((product: any) => ({
      id: `TRX-ITEM-${randomUUID()}`,
      transaction_id,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: product.quantity,
      total_price: product.itemTotal,
      variant_id: product.variant_id,
      variant_name: product.variantName,
    }));

    console.log('Transaction Items Data:', transactionItemsData);

    let createdItems: any;

    try {
      // Create transaction items
      createdItems = await this.prismaService.transactionsItem.createMany({
        data: transactionItemsData,
      });

      // Update product quantities
      for (const product of products) {
        await this.prismaService.product.update({
          where: { id: product.id },

          data: { stock: { decrement: product.quantity } },
        });

        // Update variant quantities if applicable
        if (product.variant_id) {
          await this.prismaService.variant.update({
            where: { id: product.variant_id },
            data: { stock: { decrement: product.quantity } },
          });
        }
      }

      // Delete cart items
      await this.prismaService.shoppingCart.deleteMany({
        where: {
          product_id: {
            in: products.map((product) => product.id),
          },
        },
      });

      return createdItems;
    } catch (error) {
      throw new InternalServerErrorException(error); // Rethrow the error to be handled by the caller
    }
  }

  async getTransactionItemsByTransactionId(
    transaction_id: string,
  ): Promise<any> {
    const transactionItems = await this.prismaService.transactionsItem.findMany(
      {
        where: {
          transaction_id,
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              variant: true,
            },
          },
        },
      },
    );

    if (!transactionItems) {
      throw new NotFoundException('Transaction items not found');
    }
    return transactionItems;
  }
}
