import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { VariantModule } from 'src/variant/variant.module';
import { TransactionController } from './transaction.controller';
import { AddressModule } from 'src/address/address.module';
import { TransactionItemsModule } from 'src/transaction-items/transaction-items.module';

@Module({
  imports: [
    ProductModule,
    UserModule,
    VariantModule,
    AddressModule,
    TransactionItemsModule,
  ],

  providers: [TransactionService],

  controllers: [TransactionController],

  exports: [TransactionService],
})
export class TransactionModule {}
