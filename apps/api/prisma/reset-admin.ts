/**
 * Reset or create admin user
 * Usage: cd apps/api && npx tsx prisma/reset-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@futureup.az';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      isActive: true,
    },
    create: {
      email,
      password: hashed,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user ready:', admin.email, '| isActive:', admin.isActive);
  console.log('   Login: admin@futureup.az / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
