import { Injectable } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import {
  DashboardResponse,
  GraphData,
  MonthlyDataResponse,
  MonthlyRecord,
} from 'src/model/dashboard.model';
import { ProductResponse } from 'src/model/product.model';

@Injectable()
export class DashboardService {
  constructor(private prismaService: PrismaService) {}

  async getDashboard(): Promise<DashboardResponse> {
    // Mendapatkan tanggal hari ini
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Mengambil total produk
    const totalProducts = await this.prismaService.product.count();
    const totalUsers = await this.prismaService.user.count({
      where: {
        role: 'USER',
      },
    });
    // Mengambil total transaksi
    const totalTransactions = await this.prismaService.transaction.count();

    // Menghitung total pendapatan dari semua transaksi
    const totalAllRevenue = await this.prismaService.transaction.aggregate({
      _sum: {
        total_price: true,
      },
      where: {
        status: 'DELIVERED',
      },
    });

    // Menghitung total penjualan (jumlah item terjual)
    const totalSales = await this.prismaService.product.aggregate({
      _sum: {
        stock_sold: true,
      },
    });

    // Menghitung total pendapatan dari transaksi hari ini
    const totalRevenueToday = await this.prismaService.transaction.aggregate({
      _sum: {
        total_price: true,
      },
      where: {
        AND: [
          { created_at: { gte: startDate } }, // Mulai dari awal hari ini
          { created_at: { lt: endDate } }, // Kurang dari awal besok
        ],
      },
    });

    // Mengembalikan respons dashboard dengan data yang terkumpul
    return {
      total_user: totalUsers, // Implementasi untuk mengambil total pengguna
      total_product: totalProducts,
      total_transaction: totalTransactions,
      total_all_revenue: totalAllRevenue._sum.total_price || 0,
      total_sales: totalSales._sum.stock_sold || 0,
      total_revenue_now: totalRevenueToday._sum.total_price || 0,
    };
  }

  async getGraphRevenue(): Promise<GraphData[]> {
    const paidOrders = await this.prismaService.transaction.findMany({
      where: {
        status: 'DELIVERED',
      },
      include: {
        transactions_items: {
          include: {
            products: { include: { category: true } },
          },
        },
      },
    });

    const monthlyRevenue: { [key: number]: number } = {};

    // Grouping the orders by month and summing the revenue
    for (const order of paidOrders) {
      const month = order.created_at.getMonth(); // 0 for Jan, 1 for Feb, ...

      // Adding the revenue for this order to the respective month
      monthlyRevenue[month] = monthlyRevenue[month] || 0;
    }

    // Converting the grouped data into the format expected by the graph
    const graphData: GraphData[] = [
      { name: 'Jan', total: 0 },
      { name: 'Feb', total: 0 },
      { name: 'Mar', total: 0 },
      { name: 'Apr', total: 0 },
      { name: 'May', total: 0 },
      { name: 'Jun', total: 0 },
      { name: 'Jul', total: 0 },
      { name: 'Aug', total: 0 },
      { name: 'Sep', total: 0 },
      { name: 'Oct', total: 0 },
      { name: 'Nov', total: 0 },
      { name: 'Dec', total: 0 },
    ];

    // Filling in the revenue data
    for (const month in monthlyRevenue) {
      graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
    }

    return graphData;
  }

  async getRecentTransaction(): Promise<Transaction[]> {
    const transactions = await this.prismaService.transaction.findMany({
      include: {
        user: true,
        address: true,
        transactions_items: {
          include: {
            products: { include: { category: true } },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    return transactions;
  }

  async getNewProducts(): Promise<ProductResponse[]> {
    const products = await this.prismaService.product.findMany({
      include: {
        variant: true,
        images: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    return products;
  }

  async getMostProductsSold(): Promise<ProductResponse[]> {
    const products = await this.prismaService.product.findMany({
      include: {
        variant: true,
        images: true,
      },
      orderBy: {
        stock_sold: 'desc',
      },
      take: 5,
    });

    return products;
  }

  async chartRevenueAndTransactionPerMonth(
    year: number,
  ): Promise<MonthlyDataResponse> {
    const revenuePerMonth = await this.prismaService.transaction.groupBy({
      by: ['created_at'],
      _sum: {
        total_price: true,
      },
      where: {
        AND: [
          { created_at: { gte: new Date(year, 0, 1) } }, // Mulai dari 1 Januari tahun yang diberikan
          { created_at: { lt: new Date(year + 1, 0, 1) } }, // Kurang dari 1 Januari tahun berikutnya
        ],
      },
    });

    // Query untuk total pesanan per bulan
    const ordersPerMonth = await this.prismaService.transaction.groupBy({
      by: ['created_at'],
      _count: {
        id: true,
      },
      where: {
        AND: [
          { created_at: { gte: new Date(year, 0, 1) } }, // Mulai dari 1 Januari tahun yang diberikan
          { created_at: { lt: new Date(year + 1, 0, 1) } }, // Kurang dari 1 Januari tahun berikutnya
        ],
      },
    });
    console.log(revenuePerMonth);
    console.log(ordersPerMonth);
    // Format data untuk digunakan dalam grafik
    const monthlyData: MonthlyDataResponse = {
      revenue: this.formatMonthlyDataRevenue(revenuePerMonth),
      orders: this.formatMonthlyDataOrder(ordersPerMonth),
    };

    return monthlyData;
  }

  // Fungsi untuk memformat data bulanan

  formatMonthlyDataRevenue(data: any[]): MonthlyRecord[] {
    const monthlyRecords: MonthlyRecord[] = [];

    data.forEach((item) => {
      const month = new Date(item.created_at).toLocaleString('default', {
        month: 'long',
      });

      // Periksa apakah item memiliki properti _sum dan total_price
      if (item._sum && item._sum.total_price !== undefined) {
        const value = item._sum.total_price;
        monthlyRecords.push({ month, value });
      } else {
        console.warn('Item does not have expected structure:', item);
      }
    });
    return monthlyRecords;
  }

  formatMonthlyDataOrder(data: any[]): MonthlyRecord[] {
    const monthlyRecords: MonthlyRecord[] = [];

    data.forEach((item) => {
      const month = new Date(item.created_at).toLocaleString('default', {
        month: 'long',
      });

      // Periksa apakah item memiliki properti _sum dan total_price
      if (item._count && item._count.id !== undefined) {
        const value = item._count.id;
        monthlyRecords.push({ month, value });
      } else {
        console.warn('Item does not have expected structure:', item);
      }
    });

    return monthlyRecords;
  }
}
