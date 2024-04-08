import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guard/accessToken.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypedEventEmitterModule } from './event-emitter/typed-event-emitter.module';
import { EmailModule } from './email/email.module';
import { PassportModule } from '@nestjs/passport';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ImageModule } from './image/image.module';
import { BillboardModule } from './billboard/billboard.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { VariantModule } from './variant/variant.module';
import { AddressModule } from './address/address.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionItemsModule } from './transaction-items/transaction-items.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    EmailModule,
    EventEmitterModule.forRoot(),
    TypedEventEmitterModule,
    PassportModule.register({ session: true }),
    UploadModule,
    UserModule,
    ProductModule,
    ImageModule,
    BillboardModule,
    BrandModule,
    CategoryModule,
    VariantModule,
    AddressModule,
    ShoppingCartModule,
    WishlistModule,
    TransactionModule,
    TransactionItemsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
