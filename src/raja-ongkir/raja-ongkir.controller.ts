import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { RajaOngkirService } from './raja-ongkir.service';
import {
  ForbiddenResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
} from 'src/model/web.model';

@ApiTags('Raja-ongkir')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('raja-ongkir')
export class RajaOngkirController {
  constructor(private rajaOngkirService: RajaOngkirService) {}

  @Get('/province')
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden response',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get all province' })
  @Get()
  async getProvinci() {
    return this.rajaOngkirService.getProvinsi();
  }

  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden response',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get all city by province' })
  @Get('/city')
  async getCity(@Query('id') id?: number, @Query('id') provinceId?: number) {
    return this.rajaOngkirService.getCity(id, provinceId);
  }

  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden response',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get shipping cost' })
  @Get('/shipping-cost/:origin/:destination/:weight/:courier')
  async getShippingCost(
    @Param('origin') origin: string,
    @Param('destination') destination: string,
    @Param('weight') weight: number,
    @Param('courier') courier: string,
  ) {
    return this.rajaOngkirService.getCost(origin, destination, weight, courier);
  }
}
