import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Fixing passwords for all accounts ===\n');

  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);
  const parentPassword = await bcrypt.hash('parent123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Fix admin
  const adminResult = await prisma.user.updateMany({
    data: { password: adminPassword },
  });
  console.log(`Updated ${adminResult.count} admin(s)`);

  // Fix teachers (ALL teachers with email)
  const teacherResult = await prisma.teacher.updateMany({
    where: { email: { not: null } },
    data: { password: teacherPassword },
  });
  console.log(`Updated ${teacherResult.count} teacher(s) -> password: teacher123`);

  // Also set password for teachers without one
  const teacherNullPw = await prisma.teacher.updateMany({
    where: { email: { not: null }, password: null },
    data: { password: teacherPassword },
  });
  if (teacherNullPw.count > 0) console.log(`  + Set password for ${teacherNullPw.count} teacher(s) that had null password`);

  // Fix students (ALL students, including those with null password)
  const studentResult = await prisma.student.updateMany({
    data: { password: studentPassword },
  });
  console.log(`Updated ${studentResult.count} student(s) -> password: student123`);

  // Fix parents
  const parentResult = await prisma.parent.updateMany({
    data: { password: parentPassword },
  });
  console.log(`Updated ${parentResult.count} parent(s) -> password: parent123`);

  // List all accounts
  console.log('\n--- Teacher accounts ---');
  const teachers = await prisma.teacher.findMany({ where: { email: { not: null } }, select: { email: true, nameEn: true } });
  teachers.forEach(t => console.log(`  ${t.email} (${t.nameEn})`));

  console.log('\n--- Student accounts ---');
  const students = await prisma.student.findMany({ select: { email: true, name: true }, take: 15 });
  students.forEach(s => console.log(`  ${s.email} (${s.name})`));

  console.log('\n--- Parent accounts ---');
  const parents = await prisma.parent.findMany({ select: { email: true, nameEn: true } });
  parents.forEach(p => console.log(`  ${p.email} (${p.nameEn})`));

  console.log('\n=== Done! All passwords reset ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
