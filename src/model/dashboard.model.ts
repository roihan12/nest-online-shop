import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponse {
  @ApiProperty({
    example: 2000,
  })
  total_user: number;
  @ApiProperty({
    example: 206,
  })
  total_product: number;
  @ApiProperty({
    example: 200,
  })
  total_transaction: number;
  @ApiProperty({
    example: 200,
  })
  total_all_revenue: number;
  @ApiProperty({
    example: 200,
  })
  total_sales: number;
  @ApiProperty({
    example: 200,
  })
  total_revenue_now: number;
}

export class MonthlyDataResponse {
  revenue: MonthlyRecord[]; // Data total pendapatan per bulan
  orders: MonthlyRecord[]; // Data total pesanan per bulan
}

export interface MonthlyRecord {
  month: string; // Nama bulan (e.g., "January", "February", dst.)
  value: number; // Nilai data (e.g., total pendapatan atau jumlah pesanan)
}

export class GraphData {
  name: string;
  total: number;
}
