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
import { RajaOngkirModule } from './raja-ongkir/raja-ongkir.module';
import { ReviewModule } from './review/review.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { Redis } from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      no_ready_check: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 100, ttl: seconds(60) }],

      // default config (host = localhost, port = 6379)
      storage: new ThrottlerStorageRedisService(
        new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
        }),
      ),
    }),
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
    RajaOngkirModule,
    ReviewModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
