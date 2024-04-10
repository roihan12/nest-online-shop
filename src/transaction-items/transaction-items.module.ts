import { Module } from '@nestjs/common';
import { TransactionItemsService } from './transaction-items.service';

@Module({
  providers: [TransactionItemsService],
  exports: [TransactionItemsService],
})
export class TransactionItemsModule {}
