import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Phase 6 Seed: Messaging + Gamification ---');

  // ========== 1. Seed Badges ==========
  console.log('[1/4] Seeding badges...');

  const badges = [
    { code: 'FIRST_LESSON', name: 'First Steps', description: 'Complete your first lesson', icon: '\ud83c\udfaf', category: 'learning', condition: { type: 'lessons_completed', value: 1 }, xpReward: 10, order: 1 },
    { code: 'LESSON_MASTER', name: 'Lesson Master', description: 'Complete 10 lessons', icon: '\ud83d\udcda', category: 'learning', condition: { type: 'lessons_completed', value: 10 }, xpReward: 50, order: 2 },
    { code: 'FIRST_QUIZ', name: 'Quiz Taker', description: 'Pass your first quiz', icon: '\u270f\ufe0f', category: 'quiz', condition: { type: 'quizzes_passed', value: 1 }, xpReward: 10, order: 3 },
    { code: 'QUIZ_MASTER', name: 'Quiz Master', description: 'Pass 5 quizzes with 90%+ score', icon: '\ud83c\udfc6', category: 'quiz', condition: { type: 'quizzes_high_score', value: 5 }, xpReward: 100, order: 4 },
    { code: 'PERFECT_SCORE', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '\ud83d\udcaf', category: 'quiz', condition: { type: 'perfect_quiz_score', value: 1 }, xpReward: 30, order: 5 },
    { code: 'FIRST_ASSIGNMENT', name: 'Homework Hero', description: 'Submit your first assignment', icon: '\ud83d\udcdd', category: 'learning', condition: { type: 'assignments_submitted', value: 1 }, xpReward: 10, order: 6 },
    { code: 'ASSIGNMENT_STREAK', name: 'Streak Master', description: 'Submit 5 assignments on time', icon: '\ud83d\udd25', category: 'learning', condition: { type: 'assignments_on_time', value: 5 }, xpReward: 50, order: 7 },
    { code: 'PERFECT_ATTENDANCE', name: 'Always Present', description: '100% attendance for a month', icon: '\u2b50', category: 'attendance', condition: { type: 'perfect_attendance_month', value: 1 }, xpReward: 50, order: 8 },
    { code: 'EARLY_BIRD', name: 'Early Bird', description: 'Submit an assignment 24h before deadline', icon: '\ud83d\udc26', category: 'learning', condition: { type: 'early_submission', value: 1 }, xpReward: 20, order: 9 },
    { code: 'FIRST_CERT', name: 'Certified', description: 'Earn your first certificate', icon: '\ud83c\udf93', category: 'learning', condition: { type: 'certificates_earned', value: 1 }, xpReward: 50, order: 10 },
    { code: 'TOP_STUDENT', name: 'Top Student', description: 'Earn 500 XP', icon: '\ud83d\udc51', category: 'social', condition: { type: 'xp_total', value: 500 }, xpReward: 50, order: 11 },
    { code: 'XP_1000', name: 'Legend', description: 'Earn 1000 XP', icon: '\ud83c\udf1f', category: 'social', condition: { type: 'xp_total', value: 1000 }, xpReward: 100, order: 12 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: { ...badge },
      create: { ...badge },
    });
  }
  console.log(`  Created/updated ${badges.length} badges`);

  // ========== 2. Award XP to existing students ==========
  console.log('[2/4] Awarding sample XP...');

  const students = await prisma.student.findMany({ take: 10 });
  if (students.length > 0) {
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const xpAmount = Math.floor(Math.random() * 200) + 50; // 50-250 XP

      // Check if XP transaction already exists for this student from seed
      const existing = await prisma.xPTransaction.findFirst({
        where: { studentId: student.id, reason: 'seed_initial_xp' },
      });

      if (!existing) {
        await prisma.xPTransaction.create({
          data: {
            studentId: student.id,
            amount: xpAmount,
            reason: 'seed_initial_xp',
            sourceId: null,
          },
        });

        await prisma.student.update({
          where: { id: student.id },
          data: { xpTotal: { increment: xpAmount } },
        });

        console.log(`  Awarded ${xpAmount} XP to ${student.name}`);
      }
    }
  }

  // ========== 3. Award sample badges ==========
  console.log('[3/4] Awarding sample badges...');

  const allBadges = await prisma.badge.findMany();
  if (students.length > 0 && allBadges.length > 0) {
    // Give first student 3 badges
    const firstStudent = students[0];
    const badgesToAward = allBadges.slice(0, 3);
    for (const badge of badgesToAward) {
      await prisma.studentBadge.upsert({
        where: {
          studentId_badgeId: { studentId: firstStudent.id, badgeId: badge.id },
        },
        update: {},
        create: { studentId: firstStudent.id, badgeId: badge.id },
      });
    }
    console.log(`  Awarded ${badgesToAward.length} badges to ${firstStudent.name}`);

    // Give second student 1 badge
    if (students.length > 1) {
      const secondStudent = students[1];
      await prisma.studentBadge.upsert({
        where: {
          studentId_badgeId: { studentId: secondStudent.id, badgeId: allBadges[0].id },
        },
        update: {},
        create: { studentId: secondStudent.id, badgeId: allBadges[0].id },
      });
      console.log(`  Awarded 1 badge to ${secondStudent.name}`);
    }
  }

  // ========== 4. Seed Conversations + Messages ==========
  console.log('[4/4] Seeding conversations and messages...');

  const teachers = await prisma.teacher.findMany({ take: 3 });

  if (students.length > 0 && teachers.length > 0) {
    const teacher = teachers[0];
    const student = students[0];

    // Check if conversation already exists
    const existingConvo = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            OR: [
              { userId: teacher.id, userType: 'teacher' },
              { userId: student.id, userType: 'student' },
            ],
          },
        },
      },
    });

    if (!existingConvo) {
      // Create direct conversation between first teacher and first student
      const conv = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: teacher.id, userType: 'teacher' },
              { userId: student.id, userType: 'student' },
            ],
          },
        },
      });

      // Add messages
      const messages = [
        { senderId: teacher.id, senderType: 'teacher', text: `Hello ${student.name}! Welcome to the course. If you have any questions, feel free to ask here.` },
        { senderId: student.id, senderType: 'student', text: 'Thank you! I\'m excited to start learning. When is the first assignment due?' },
        { senderId: teacher.id, senderType: 'teacher', text: 'The first assignment will be posted this week. Check the Assignments section for updates.' },
        { senderId: student.id, senderType: 'student', text: 'Got it, thanks! I\'ll keep an eye on it.' },
        { senderId: teacher.id, senderType: 'teacher', text: 'Great! Also, don\'t forget to complete the first lesson before the quiz opens next Monday.' },
      ];

      for (let i = 0; i < messages.length; i++) {
        await prisma.message.create({
          data: {
            conversationId: conv.id,
            ...messages[i],
            createdAt: new Date(Date.now() - (messages.length - i) * 3600000), // 1 hour apart
          },
        });
      }

      console.log(`  Created conversation between ${teacher.nameEn} and ${student.name} with ${messages.length} messages`);
    }

    // Create a group conversation for first course if exists
    const course = await prisma.course.findFirst({
      include: {
        students: { include: { student: true }, take: 5 },
        teachers: { include: { teacher: true }, take: 1 },
      },
    });

    if (course && course.teachers.length > 0) {
      const courseTeacher = course.teachers[0].teacher;

      const existingGroup = await prisma.conversation.findFirst({
        where: { courseId: course.id, isGroup: true },
      });

      if (!existingGroup) {
        const participants = [
          { userId: courseTeacher.id, userType: 'teacher' },
          ...course.students.map(e => ({ userId: e.student.id, userType: 'student' as const })),
        ];

        const groupConv = await prisma.conversation.create({
          data: {
            courseId: course.id,
            title: `${course.titleEn || course.titleAz || 'Course'} - Group Chat`,
            isGroup: true,
            participants: {
              create: participants,
            },
          },
        });

        // Add group messages
        await prisma.message.create({
          data: {
            conversationId: groupConv.id,
            senderId: courseTeacher.id,
            senderType: 'teacher',
            text: `Welcome to the ${course.titleEn || course.titleAz} group chat! Use this space to discuss course materials and ask questions.`,
            createdAt: new Date(Date.now() - 86400000),
          },
        });

        if (course.students.length > 0) {
          await prisma.message.create({
            data: {
              conversationId: groupConv.id,
              senderId: course.students[0].student.id,
              senderType: 'student',
              text: 'Thanks for setting this up! Looking forward to the course.',
              createdAt: new Date(Date.now() - 43200000),
            },
          });
        }

        console.log(`  Created group chat for "${course.titleEn || course.titleAz}" with ${participants.length} participants`);
      }
    }
  }

  console.log('\n--- Phase 6 Seed Complete! ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
