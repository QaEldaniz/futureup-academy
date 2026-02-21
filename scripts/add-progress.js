const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find test courses
  const webCourse = await prisma.course.findFirst({ where: { slug: 'web-development-test' }, include: { lessons: true } });
  const pyCourse = await prisma.course.findFirst({ where: { slug: 'python-programming-test' }, include: { lessons: true } });

  if (!webCourse || !pyCourse) {
    console.log('Test courses not found!');
    return;
  }

  console.log(`Web Dev: ${webCourse.id} (${webCourse.lessons.length} lessons)`);
  console.log(`Python: ${pyCourse.id} (${pyCourse.lessons.length} lessons)`);

  // Find test students
  const students = await prisma.student.findMany({
    where: { email: { contains: 'test@academy.az' } }
  });

  const murad = students.find(s => s.email.includes('murad'));
  const leyla = students.find(s => s.email.includes('leyla'));
  const rashad = students.find(s => s.email.includes('rashad'));
  const aysel = students.find(s => s.email.includes('aysel'));
  const tural = students.find(s => s.email.includes('tural'));

  console.log(`\nStudents: ${students.map(s => s.name).join(', ')}`);

  const wLessons = webCourse.lessons.sort((a, b) => a.order - b.order);
  const pLessons = pyCourse.lessons.sort((a, b) => a.order - b.order);

  // Helper to add lesson progress
  async function addLP(studentId, lessonId, st, timeSec) {
    const startedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completedAt = st === 'COMPLETED' ? new Date() : null;
    await prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId, lessonId } },
      update: { status: st, timeSpentSec: timeSec, completedAt },
      create: { studentId, lessonId, status: st, startedAt, completedAt, timeSpentSec: timeSec }
    });
  }

  // Helper to set course progress
  async function setCourseProgress(studentId, courseId, percentage) {
    await prisma.courseProgress.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: { percentage, lastAccessedAt: new Date() },
      create: { studentId, courseId, percentage, lastAccessedAt: new Date() }
    });
  }

  // === MURAD: Web 75%, Python 67% ===
  console.log('\nAdding Murad progress...');
  await addLP(murad.id, wLessons[0].id, 'COMPLETED', 2400);
  await addLP(murad.id, wLessons[1].id, 'COMPLETED', 3200);
  await addLP(murad.id, wLessons[2].id, 'COMPLETED', 4100);
  await addLP(murad.id, wLessons[3].id, 'IN_PROGRESS', 1200);
  await setCourseProgress(murad.id, webCourse.id, 75);

  await addLP(murad.id, pLessons[0].id, 'COMPLETED', 1800);
  await addLP(murad.id, pLessons[1].id, 'COMPLETED', 2700);
  await addLP(murad.id, pLessons[2].id, 'IN_PROGRESS', 900);
  await setCourseProgress(murad.id, pyCourse.id, 67);

  // === LEYLA: Web 50%, Python 100% ===
  console.log('Adding Leyla progress...');
  await addLP(leyla.id, wLessons[0].id, 'COMPLETED', 2000);
  await addLP(leyla.id, wLessons[1].id, 'COMPLETED', 2800);
  await addLP(leyla.id, wLessons[2].id, 'IN_PROGRESS', 1500);
  await setCourseProgress(leyla.id, webCourse.id, 50);

  await addLP(leyla.id, pLessons[0].id, 'COMPLETED', 2100);
  await addLP(leyla.id, pLessons[1].id, 'COMPLETED', 3000);
  await addLP(leyla.id, pLessons[2].id, 'COMPLETED', 2500);
  await setCourseProgress(leyla.id, pyCourse.id, 100);

  // === RASHAD: Web 25% ===
  console.log('Adding Rashad progress...');
  await addLP(rashad.id, wLessons[0].id, 'COMPLETED', 3600);
  await addLP(rashad.id, wLessons[1].id, 'IN_PROGRESS', 800);
  await setCourseProgress(rashad.id, webCourse.id, 25);

  // === AYSEL: Web 100%, Python 67% ===
  console.log('Adding Aysel progress...');
  await addLP(aysel.id, wLessons[0].id, 'COMPLETED', 1900);
  await addLP(aysel.id, wLessons[1].id, 'COMPLETED', 2500);
  await addLP(aysel.id, wLessons[2].id, 'COMPLETED', 3800);
  await addLP(aysel.id, wLessons[3].id, 'COMPLETED', 4200);
  await setCourseProgress(aysel.id, webCourse.id, 100);

  await addLP(aysel.id, pLessons[0].id, 'COMPLETED', 2000);
  await addLP(aysel.id, pLessons[1].id, 'COMPLETED', 2800);
  await addLP(aysel.id, pLessons[2].id, 'IN_PROGRESS', 1100);
  await setCourseProgress(aysel.id, pyCourse.id, 67);

  // === TURAL: Python 33% ===
  console.log('Adding Tural progress...');
  await addLP(tural.id, pLessons[0].id, 'COMPLETED', 2600);
  await addLP(tural.id, pLessons[1].id, 'IN_PROGRESS', 500);
  await setCourseProgress(tural.id, pyCourse.id, 33);

  console.log('\n=== ALL PROGRESS ADDED! ===');
  console.log('Murad: Web 75%, Python 67%');
  console.log('Leyla: Web 50%, Python 100%');
  console.log('Rashad: Web 25%');
  console.log('Aysel: Web 100%, Python 67%');
  console.log('Tural: Python 33%');
}

main().catch(console.error).finally(() => prisma.$disconnect());
