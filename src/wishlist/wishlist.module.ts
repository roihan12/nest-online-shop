import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ProductModule, UserModule],
  providers: [WishlistService],
  controllers: [WishlistController],
})
export class WishlistModule {}
