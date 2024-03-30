import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guard/accessToken.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypedEventEmitterModule } from './event-emitter/typed-event-emitter.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    EmailModule,
    EventEmitterModule.forRoot(),
    TypedEventEmitterModule,
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
