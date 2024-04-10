import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { VariantModule } from 'src/variant/variant.module';

@Module({
  imports: [ProductModule, UserModule, VariantModule],
  providers: [ShoppingCartService],
  controllers: [ShoppingCartController],
})
export class ShoppingCartModule {}
