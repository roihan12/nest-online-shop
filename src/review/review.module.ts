import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { TransactionItemsModule } from 'src/transaction-items/transaction-items.module';

@Module({
  imports: [UserModule, ProductModule, TransactionItemsModule],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
