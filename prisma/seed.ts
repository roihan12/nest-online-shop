import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@nestshop.com', 'owner@nestshop.com'],
      },
    },
  });

  await prisma.user.create({
    data: {
      full_name: 'admin',
      email: 'admin@nestshop.com',
      password: bcrypt.hashSync(process.env.SEED_PASSWORD, 10),
      role: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      username: 'admin',
    },
  });

  await prisma.user.create({
    data: {
      full_name: 'owner',
      email: 'owner@nestshop.com',
      password: bcrypt.hashSync(process.env.SEED_PASSWORD, 10),
      role: 'OWNER',
      status: 'ACTIVE',
      verified: true,
      username: 'owner',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
