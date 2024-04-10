import { Module } from '@nestjs/common';
import { RajaOngkirService } from './raja-ongkir.service';
import { RajaOngkirController } from './raja-ongkir.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [RajaOngkirService],
  controllers: [RajaOngkirController],
})
export class RajaOngkirModule {}
