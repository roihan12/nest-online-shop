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
