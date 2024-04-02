import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        OR: [{ username: 'roihan20' }, { username: 'test' }],
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        email: 'test@gmail.com',
        password: await bcrypt.hash('12345678', 10),
        full_name: 'test',
        username: 'test',
        verified: true,
      },
    });
  }
}
