import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import {
  ApiSucessResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
  WebResponse,
} from 'src/model/web.model';
import {
  DashboardResponse,
  GraphData,
  MonthlyDataResponse,
} from 'src/model/dashboard.model';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Transaction } from '@prisma/client';
import { ProductResponse } from 'src/model/product.model';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(240)
  @Get('/')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(DashboardResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get dashboard data' })
  async getDashboard(): Promise<WebResponse<DashboardResponse>> {
    const response = await this.dashboardService.getDashboard();
    return {
      status: true,
      message: 'Get dashboard data success',
      data: response,
    };
  }

  @Get('/chart/:year')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(MonthlyDataResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get dashboard chart data' })
  async getDashboardChart(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<WebResponse<MonthlyDataResponse>> {
    const response =
      await this.dashboardService.chartRevenueAndTransactionPerMonth(year);
    return {
      status: true,
      message: 'Get dashboard data chart success',
      data: response,
    };
  }

  @Get('/graph')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(MonthlyDataResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get dashboard chart data' })
  async getDashboardGraph(): Promise<WebResponse<GraphData[]>> {
    const response = await this.dashboardService.getGraphRevenue();
    return {
      status: true,
      message: 'Get dashboard data graph success',
      data: response,
    };
  }

  @Get('/transactions')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(MonthlyDataResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get dashboard graph data' })
  async getDashboardTransactions(): Promise<WebResponse<Transaction[]>> {
    const response = await this.dashboardService.getRecentTransaction();
    return {
      status: true,
      message: 'Get dashboard data graph success',
      data: response,
    };
  }

  @Get('/new-products')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(MonthlyDataResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get dashboard new product data' })
  async getDashboardNewProducts(): Promise<WebResponse<ProductResponse[]>> {
    const response = await this.dashboardService.getNewProducts();
    return {
      status: true,
      message: 'Get dashboard data new porduct success',
      data: response,
    };
  }

  @Get('/most-product-sales')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'OWNER'])
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiSucessResponse(MonthlyDataResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden resource',
    type: ForbiddenResponse,
  })
  @ApiOperation({ summary: 'Get dashboard most sold product data' })
  async getDashboardNewProdcts(): Promise<WebResponse<ProductResponse[]>> {
    const response = await this.dashboardService.getMostProductsSold();
    return {
      status: true,
      message: 'Get dashboard data most product success',
      data: response,
    };
  }
}
