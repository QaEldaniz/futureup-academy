/**
 * One-time script to set test passwords for existing students and create parents in production DB.
 * Run: npx tsx apps/api/prisma/set-test-passwords.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔑 Setting test passwords...\n');

  const studentPassword = await bcrypt.hash('student123', 10);
  const parentPassword = await bcrypt.hash('parent123', 10);

  // Update all students without a password
  const studentsWithoutPassword = await prisma.student.findMany({
    where: { password: null },
    select: { id: true, name: true, email: true },
  });

  if (studentsWithoutPassword.length > 0) {
    await prisma.student.updateMany({
      where: { password: null },
      data: { password: studentPassword },
    });
    console.log(`✅ Set password for ${studentsWithoutPassword.length} students (password: student123)`);
  } else {
    console.log('ℹ️  All students already have passwords');
  }

  // Create parents if they don't exist
  const parentData = [
    { nameAz: 'Əhmədov Rəşid', nameRu: 'Ахмедов Рашид', nameEn: 'Ahmadov Rashid', email: 'parent1@futureup.az', phone: '+994551001010' },
    { nameAz: 'Hüseynova Sevil', nameRu: 'Гусейнова Севиль', nameEn: 'Huseynova Sevil', email: 'parent2@futureup.az', phone: '+994551002020' },
    { nameAz: 'Quliyev Elşən', nameRu: 'Кулиев Эльшан', nameEn: 'Guliyev Elshan', email: 'parent3@futureup.az', phone: '+994551003030' },
    { nameAz: 'Əlizadə Nigar', nameRu: 'Ализаде Нигяр', nameEn: 'Alizade Nigar', email: 'parent4@futureup.az', phone: '+994551004040' },
    { nameAz: 'Həsənov Ramiz', nameRu: 'Гасанов Рамиз', nameEn: 'Hasanov Ramiz', email: 'parent5@futureup.az', phone: '+994551005050' },
  ];

  const parents = [];
  for (const p of parentData) {
    const parent = await prisma.parent.upsert({
      where: { email: p.email },
      update: { password: parentPassword },
      create: { ...p, password: parentPassword },
    });
    parents.push(parent);
  }
  console.log(`✅ 5 parents upserted (password: parent123)`);

  // Link parents to first 10 students
  const students = await prisma.student.findMany({
    take: 10,
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });

  if (students.length >= 10) {
    for (let i = 0; i < 5; i++) {
      const relation = i % 2 === 0 ? 'FATHER' as const : 'MOTHER' as const;
      for (let j = 0; j < 2; j++) {
        const studentIdx = i * 2 + j;
        await prisma.studentParent.upsert({
          where: {
            studentId_parentId: {
              studentId: students[studentIdx].id,
              parentId: parents[i].id,
            },
          },
          update: {},
          create: {
            studentId: students[studentIdx].id,
            parentId: parents[i].id,
            relation,
          },
        });
      }
    }
    console.log('✅ Parents linked to students');
  }

  console.log('\n📋 Test accounts:');
  console.log('  Admin:   admin@futureup.az / admin123');
  console.log('  Teacher: kamran@futureup.az / teacher123');
  console.log('  Student: farid.ahmadov@gmail.com / student123');
  console.log('  Parent:  parent1@futureup.az / parent123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
