import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class TransactionItemsService {
  constructor(private prismaService: PrismaService) {}

  async createTransactionItems(products: any[], transaction_id: string) {
    try {
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

      const createdItems = await this.prismaService.transactionsItem.createMany(
        {
          data: transactionItemsData,
        },
      );

      return createdItems;
    } catch (error) {
      console.error('Error creating transaction items:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }
}
