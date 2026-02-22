import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Production Seed Script
 * Creates realistic demo data for all LMS features:
 * - Lessons with materials
 * - Assignments with submissions
 * - Quizzes with questions and attempts
 * - Attendance records
 * - Grades
 * - Schedules
 * - Teacher comments
 * - Course progress & lesson progress
 * - Conversations & messages
 * - Badges & XP
 * - Notifications
 * - Certificates
 */

async function main() {
  console.log('=== Production Seed: Full Demo Data ===\n');

  // -------- Fetch existing data --------
  const teachers = await prisma.teacher.findMany({ take: 5 });
  const students = await prisma.student.findMany({ take: 10 });
  const courses = await prisma.course.findMany({
    include: {
      teachers: { include: { teacher: true } },
      students: { include: { student: true } },
    },
  });

  if (teachers.length === 0 || students.length === 0 || courses.length === 0) {
    console.error('ERROR: No teachers/students/courses found. Run main seed first.');
    return;
  }

  console.log(`Found: ${teachers.length} teachers, ${students.length} students, ${courses.length} courses\n`);

  // -------- Helper dates --------
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);

  // ======================================================================
  // 1. LESSONS + MATERIALS for each course
  // ======================================================================
  console.log('[1/11] Creating lessons & materials...');

  const lessonTemplates: Record<string, { title: string; desc: string; materials: { title: string; type: string; url: string }[] }[]> = {};

  // Generic lesson templates per course
  for (const course of courses) {
    const courseName = course.titleEn || course.titleAz;
    const existing = await prisma.lesson.count({ where: { courseId: course.id } });
    if (existing >= 5) {
      console.log(`  Skipping lessons for "${courseName}" (already has ${existing})`);
      continue;
    }

    const lessons = [
      { titleEn: `Introduction to ${courseName}`, titleAz: `${courseName} - Giriş`, titleRu: `Введение в ${courseName}`, desc: `Overview and fundamentals of ${courseName}. What you'll learn and course expectations.` },
      { titleEn: `Core Concepts`, titleAz: `Əsas Anlayışlar`, titleRu: `Основные концепции`, desc: `Deep dive into the fundamental concepts and building blocks.` },
      { titleEn: `Hands-on Practice`, titleAz: `Praktiki Məşğələ`, titleRu: `Практическое занятие`, desc: `Apply what you've learned with practical exercises and examples.` },
      { titleEn: `Advanced Techniques`, titleAz: `Qabaqcıl Texnikalar`, titleRu: `Продвинутые техники`, desc: `Explore advanced patterns and best practices used in industry.` },
      { titleEn: `Project Work`, titleAz: `Layihə İşi`, titleRu: `Проектная работа`, desc: `Build a real-world project applying all concepts from the course.` },
      { titleEn: `Review & Assessment`, titleAz: `Nəzərdən keçirmə`, titleRu: `Обзор и оценка`, desc: `Review all material and prepare for the final assessment.` },
    ];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          titleAz: lessons[i].titleAz,
          titleRu: lessons[i].titleRu,
          titleEn: lessons[i].titleEn,
          descAz: lessons[i].desc,
          descRu: lessons[i].desc,
          descEn: lessons[i].desc,
          order: i + 1,
          isPublished: true,
        },
      });

      // Add materials for each lesson
      await prisma.lessonMaterial.createMany({
        data: [
          { lessonId: lesson.id, title: 'Lecture Slides', type: 'SLIDES', url: 'https://docs.google.com/presentation/d/example', order: 1 },
          { lessonId: lesson.id, title: 'Study Guide', type: 'DOCUMENT', url: 'https://docs.google.com/document/d/example', order: 2 },
          ...(i % 2 === 0 ? [{ lessonId: lesson.id, title: 'Video Tutorial', type: 'VIDEO' as const, url: 'https://www.youtube.com/watch?v=example', order: 3 }] : []),
        ],
      });
    }
    console.log(`  Created 6 lessons for "${courseName}"`);
  }

  // ======================================================================
  // 2. LESSON PROGRESS for students
  // ======================================================================
  console.log('[2/11] Creating lesson progress...');

  for (const course of courses) {
    const lessons = await prisma.lesson.findMany({ where: { courseId: course.id }, orderBy: { order: 'asc' } });
    const enrolledStudents = course.students.map(s => s.student);

    for (const student of enrolledStudents) {
      // Each student completes different amount of lessons
      const completedCount = Math.floor(Math.random() * lessons.length) + 1;

      for (let i = 0; i < lessons.length; i++) {
        const existing = await prisma.lessonProgress.findUnique({
          where: { studentId_lessonId: { studentId: student.id, lessonId: lessons[i].id } },
        });
        if (existing) continue;

        if (i < completedCount) {
          await prisma.lessonProgress.create({
            data: {
              studentId: student.id,
              lessonId: lessons[i].id,
              status: 'COMPLETED',
              startedAt: daysAgo(30 - i * 3),
              completedAt: daysAgo(28 - i * 3),
              timeSpentSec: Math.floor(Math.random() * 3600) + 1200,
            },
          });
        } else if (i === completedCount) {
          await prisma.lessonProgress.create({
            data: {
              studentId: student.id,
              lessonId: lessons[i].id,
              status: 'IN_PROGRESS',
              startedAt: daysAgo(2),
              timeSpentSec: Math.floor(Math.random() * 1800) + 300,
            },
          });
        }
      }

      // Update course progress
      const pct = Math.round((completedCount / Math.max(lessons.length, 1)) * 100);
      await prisma.courseProgress.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
        update: { percentage: pct, lastAccessedAt: daysAgo(Math.floor(Math.random() * 3)) },
        create: { studentId: student.id, courseId: course.id, percentage: pct, lastAccessedAt: daysAgo(1) },
      });
    }
    console.log(`  Progress for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 3. ASSIGNMENTS with submissions
  // ======================================================================
  console.log('[3/11] Creating assignments & submissions...');

  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const existing = await prisma.assignment.count({ where: { courseId: course.id } });
    if (existing >= 3) {
      console.log(`  Skipping assignments for "${course.titleEn}" (already has ${existing})`);
      continue;
    }

    const assignments = [
      { title: 'Homework #1: Fundamentals', desc: 'Complete the exercises from Lesson 1-2. Submit your solutions as a single file.\n\n**Requirements:**\n- Follow coding standards\n- Include comments\n- Test your code before submission', dueDate: daysAgo(10), maxScore: 100 },
      { title: 'Homework #2: Practical Project', desc: 'Build a small project applying concepts from Lessons 3-4.\n\n**Deliverables:**\n- Source code (GitHub link)\n- README with instructions\n- Screenshots of the working application', dueDate: daysAgo(3), maxScore: 100 },
      { title: 'Homework #3: Advanced Challenge', desc: 'Solve the advanced challenge problems.\n\n**Bonus:** Extra points for creative solutions and optimized code.', dueDate: daysFromNow(5), maxScore: 100 },
      { title: 'Final Project', desc: 'Build a complete project demonstrating all skills learned in this course.\n\n**Requirements:**\n- Full documentation\n- Clean code\n- Deployed demo\n- Presentation slides', dueDate: daysFromNow(14), maxScore: 200 },
    ];

    for (const asg of assignments) {
      const assignment = await prisma.assignment.create({
        data: {
          courseId: course.id,
          teacherId: teacher.id,
          title: asg.title,
          description: asg.desc,
          dueDate: asg.dueDate,
          maxScore: asg.maxScore,
          isActive: true,
        },
      });

      // Create submissions for past-due assignments
      if (asg.dueDate < now) {
        const enrolledStudents = course.students.map(s => s.student);
        for (const student of enrolledStudents) {
          const roll = Math.random();
          const grade = Math.floor(Math.random() * 30) + 70; // 70-100
          const status = roll > 0.1 ? 'GRADED' : 'SUBMITTED';
          const submittedAt = new Date(asg.dueDate.getTime() - Math.floor(Math.random() * 3 * 86400000));

          await prisma.assignmentSubmission.upsert({
            where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
            update: {},
            create: {
              assignmentId: assignment.id,
              studentId: student.id,
              text: `Here is my solution for ${asg.title}. I worked on this for several hours and covered all the requirements.`,
              linkUrl: 'https://github.com/student/project',
              grade: status === 'GRADED' ? grade : null,
              feedback: status === 'GRADED' ? (grade >= 90 ? 'Excellent work! Great attention to detail.' : grade >= 80 ? 'Good job! Minor improvements needed.' : 'Decent effort. Please review the feedback points.') : null,
              status,
              submittedAt,
              gradedAt: status === 'GRADED' ? daysAgo(1) : null,
            },
          });
        }
      }
    }
    console.log(`  Created 4 assignments for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 4. QUIZZES with questions and attempts
  // ======================================================================
  console.log('[4/11] Creating quizzes with questions & attempts...');

  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const existing = await prisma.quiz.count({ where: { courseId: course.id } });
    if (existing >= 2) {
      console.log(`  Skipping quizzes for "${course.titleEn}" (already has ${existing})`);
      continue;
    }

    // Quiz 1: Multiple choice
    const quiz1 = await prisma.quiz.create({
      data: {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Module 1 Quiz: Fundamentals',
        description: 'Test your knowledge of the fundamental concepts covered in the first two lessons.',
        timeLimit: 15,
        maxAttempts: 2,
        passingScore: 60,
        isActive: true,
        isPublished: true,
        showResults: true,
        shuffleQuestions: true,
        questions: {
          create: [
            { type: 'MULTIPLE_CHOICE', question: 'Which of the following is the correct definition of an algorithm?', options: [{ id: 'a', text: 'A programming language' }, { id: 'b', text: 'A step-by-step procedure for solving a problem' }, { id: 'c', text: 'A type of database' }, { id: 'd', text: 'A hardware component' }], correctAnswer: ['b'], points: 2, explanation: 'An algorithm is a step-by-step procedure or formula for solving a problem.', order: 1 },
            { type: 'MULTIPLE_CHOICE', question: 'What does IDE stand for?', options: [{ id: 'a', text: 'Internet Development Environment' }, { id: 'b', text: 'Integrated Design Engine' }, { id: 'c', text: 'Integrated Development Environment' }, { id: 'd', text: 'Internal Data Exchange' }], correctAnswer: ['c'], points: 2, explanation: 'IDE stands for Integrated Development Environment.', order: 2 },
            { type: 'TRUE_FALSE', question: 'Variables can change their value during program execution.', options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }], correctAnswer: ['true'], points: 1, explanation: 'Variables are designed to hold values that can be changed.', order: 3 },
            { type: 'MULTIPLE_CHOICE', question: 'Which data structure uses FIFO (First In, First Out)?', options: [{ id: 'a', text: 'Stack' }, { id: 'b', text: 'Queue' }, { id: 'c', text: 'Tree' }, { id: 'd', text: 'Graph' }], correctAnswer: ['b'], points: 2, explanation: 'A queue follows the FIFO principle.', order: 4 },
            { type: 'TRUE_FALSE', question: 'HTML is a programming language.', options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }], correctAnswer: ['false'], points: 1, explanation: 'HTML is a markup language, not a programming language.', order: 5 },
            { type: 'MULTIPLE_CHOICE', question: 'What is the time complexity of binary search?', options: [{ id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(n^2)' }, { id: 'c', text: 'O(log n)' }, { id: 'd', text: 'O(1)' }], correctAnswer: ['c'], points: 2, explanation: 'Binary search has O(log n) time complexity.', order: 6 },
          ],
        },
      },
    });

    // Quiz 2: Mixed types
    const quiz2 = await prisma.quiz.create({
      data: {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Module 2 Quiz: Advanced Concepts',
        description: 'Test your understanding of advanced concepts. Includes multiple choice and open-ended questions.',
        timeLimit: 20,
        maxAttempts: 1,
        passingScore: 70,
        isActive: true,
        isPublished: true,
        showResults: true,
        questions: {
          create: [
            { type: 'MULTIPLE_CHOICE', question: 'Which design pattern ensures only one instance of a class?', options: [{ id: 'a', text: 'Factory' }, { id: 'b', text: 'Observer' }, { id: 'c', text: 'Singleton' }, { id: 'd', text: 'Strategy' }], correctAnswer: ['c'], points: 2, order: 1 },
            { type: 'MULTIPLE_SELECT', question: 'Which of the following are JavaScript frameworks? (Select all that apply)', options: [{ id: 'a', text: 'React' }, { id: 'b', text: 'Django' }, { id: 'c', text: 'Vue.js' }, { id: 'd', text: 'Angular' }], correctAnswer: ['a', 'c', 'd'], points: 3, order: 2 },
            { type: 'TRUE_FALSE', question: 'REST APIs must always use JSON format.', options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }], correctAnswer: ['false'], points: 1, explanation: 'REST APIs can use various formats including XML, YAML, etc.', order: 3 },
            { type: 'OPEN_ENDED', question: 'Explain the difference between SQL and NoSQL databases in 2-3 sentences.', options: null, correctAnswer: ['SQL databases are relational and use structured tables, while NoSQL databases are non-relational and can store unstructured data.'], points: 5, order: 4 },
            { type: 'MULTIPLE_CHOICE', question: 'What HTTP status code indicates "Not Found"?', options: [{ id: 'a', text: '200' }, { id: 'b', text: '301' }, { id: 'c', text: '404' }, { id: 'd', text: '500' }], correctAnswer: ['c'], points: 2, order: 5 },
          ],
        },
      },
    });

    // Create quiz attempts for enrolled students
    const quiz1Questions = await prisma.quizQuestion.findMany({ where: { quizId: quiz1.id }, orderBy: { order: 'asc' } });
    const quiz2Questions = await prisma.quizQuestion.findMany({ where: { quizId: quiz2.id }, orderBy: { order: 'asc' } });

    const enrolledStudents = course.students.map(s => s.student);
    for (const student of enrolledStudents) {
      // Quiz 1 attempt
      const q1Score = Math.floor(Math.random() * 40) + 60; // 60-100
      const q1MaxPoints = quiz1Questions.reduce((s, q) => s + q.points, 0);
      const q1TotalPoints = (q1Score / 100) * q1MaxPoints;

      const attempt1 = await prisma.quizAttempt.create({
        data: {
          quizId: quiz1.id,
          studentId: student.id,
          score: q1Score,
          totalPoints: q1TotalPoints,
          maxPoints: q1MaxPoints,
          status: 'COMPLETED',
          startedAt: daysAgo(15),
          completedAt: daysAgo(15),
          timeSpentSec: Math.floor(Math.random() * 600) + 300,
        },
      });

      // Create answers for quiz 1
      for (const q of quiz1Questions) {
        const isCorrect = Math.random() > 0.3;
        const ca = q.correctAnswer as string[];
        const opts = q.options as any[];
        let answer: string[];
        if (isCorrect) {
          answer = ca;
        } else {
          const wrongOpts = opts ? opts.filter((o: any) => !ca.includes(o.id)) : [];
          answer = wrongOpts.length > 0 ? [wrongOpts[0].id] : ca;
        }

        await prisma.quizAnswer.upsert({
          where: { attemptId_questionId: { attemptId: attempt1.id, questionId: q.id } },
          update: {},
          create: {
            attemptId: attempt1.id,
            questionId: q.id,
            answer,
            isCorrect,
            pointsEarned: isCorrect ? q.points : 0,
          },
        });
      }

      // Quiz 2 attempt (some students only)
      if (Math.random() > 0.3) {
        const q2Score = Math.floor(Math.random() * 50) + 50;
        const q2MaxPoints = quiz2Questions.reduce((s, q) => s + q.points, 0);
        const q2TotalPoints = (q2Score / 100) * q2MaxPoints;

        const attempt2 = await prisma.quizAttempt.create({
          data: {
            quizId: quiz2.id,
            studentId: student.id,
            score: q2Score,
            totalPoints: q2TotalPoints,
            maxPoints: q2MaxPoints,
            status: 'COMPLETED',
            startedAt: daysAgo(7),
            completedAt: daysAgo(7),
            timeSpentSec: Math.floor(Math.random() * 900) + 400,
          },
        });

        for (const q of quiz2Questions) {
          const isCorrect = q.type === 'OPEN_ENDED' ? null : Math.random() > 0.35;
          const ca = q.correctAnswer as string[];
          await prisma.quizAnswer.upsert({
            where: { attemptId_questionId: { attemptId: attempt2.id, questionId: q.id } },
            update: {},
            create: {
              attemptId: attempt2.id,
              questionId: q.id,
              answer: q.type === 'OPEN_ENDED' ? ['SQL uses tables with predefined schemas, NoSQL uses flexible document-based storage.'] : ca,
              isCorrect,
              pointsEarned: isCorrect ? q.points : (q.type === 'OPEN_ENDED' ? 3 : 0),
            },
          });
        }
      }
    }
    console.log(`  Created 2 quizzes for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 5. ATTENDANCE records (last 30 days)
  // ======================================================================
  console.log('[5/11] Creating attendance records...');

  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const enrolledStudents = course.students.map(s => s.student);
    const existing = await prisma.attendance.count({ where: { courseId: course.id } });
    if (existing >= 10) {
      console.log(`  Skipping attendance for "${course.titleEn}" (already has ${existing})`);
      continue;
    }

    // Generate attendance for the last 4 weeks (Mon/Wed/Fri)
    for (let d = 28; d >= 0; d -= 2) {
      const date = daysAgo(d);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

      for (const student of enrolledStudents) {
        const roll = Math.random();
        const status = roll > 0.15 ? 'PRESENT' : roll > 0.08 ? 'LATE' : roll > 0.03 ? 'ABSENT' : 'EXCUSED';

        try {
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              courseId: course.id,
              teacherId: teacher.id,
              date,
              status,
              note: status === 'ABSENT' ? 'Did not attend class' : status === 'LATE' ? 'Arrived 10 minutes late' : status === 'EXCUSED' ? 'Medical excuse provided' : null,
            },
          });
        } catch (e) {
          // unique constraint violation — skip
        }
      }
    }
    console.log(`  Attendance for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 6. GRADES
  // ======================================================================
  console.log('[6/11] Creating grades...');

  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const lessons = await prisma.lesson.findMany({ where: { courseId: course.id }, take: 3 });
    const enrolledStudents = course.students.map(s => s.student);

    const existing = await prisma.grade.count({ where: { courseId: course.id } });
    if (existing >= 5) continue;

    for (const student of enrolledStudents) {
      // Participation grade
      await prisma.grade.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          teacherId: teacher.id,
          value: Math.floor(Math.random() * 20) + 80,
          maxValue: 100,
          type: 'PARTICIPATION',
          comment: 'Active participation in class discussions',
        },
      });

      // Quiz grades
      await prisma.grade.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          teacherId: teacher.id,
          lessonId: lessons[0]?.id || null,
          value: Math.floor(Math.random() * 30) + 70,
          maxValue: 100,
          type: 'QUIZ',
          comment: 'Module 1 quiz result',
        },
      });

      // Assignment grade
      await prisma.grade.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          teacherId: teacher.id,
          value: Math.floor(Math.random() * 25) + 75,
          maxValue: 100,
          type: 'ASSIGNMENT',
          comment: 'Homework #1 graded',
        },
      });
    }
    console.log(`  Grades for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 7. SCHEDULES
  // ======================================================================
  console.log('[7/11] Creating schedules...');

  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const existing = await prisma.schedule.count({ where: { courseId: course.id } });
    if (existing >= 2) continue;

    const schedules = [
      { dayOfWeek: 1, startTime: '10:00', endTime: '11:30', room: 'Room 101' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '11:30', room: 'Room 101' },
      { dayOfWeek: 5, startTime: '14:00', endTime: '15:30', room: 'Room 203' },
    ];

    const idx = courses.indexOf(course);
    const courseSchedules = schedules.slice(0, idx % 2 === 0 ? 3 : 2);

    for (const s of courseSchedules) {
      await prisma.schedule.create({
        data: {
          courseId: course.id,
          teacherId: teacher.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime.replace('10:00', `${10 + idx}:00`).replace('14:00', `${14 + idx}:00`),
          endTime: s.endTime.replace('11:30', `${11 + idx}:30`).replace('15:30', `${15 + idx}:30`),
          room: s.room.replace('101', `${101 + idx}`).replace('203', `${203 + idx}`),
          isActive: true,
        },
      });
    }
    console.log(`  Schedule for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 8. TEACHER COMMENTS
  // ======================================================================
  console.log('[8/11] Creating teacher comments...');

  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const enrolledStudents = course.students.map(s => s.student);
    const existing = await prisma.teacherComment.count({ where: { courseId: course.id } });
    if (existing >= 3) continue;

    const comments = [
      { type: 'PROGRESS' as const, comment: 'Student is making excellent progress. Consistently completes assignments on time and participates actively in discussions.' },
      { type: 'ACHIEVEMENT' as const, comment: 'Outstanding performance on the recent quiz! Top of the class.' },
      { type: 'BEHAVIOR' as const, comment: 'Please improve punctuality. Arriving late disrupts the class.' },
      { type: 'GENERAL' as const, comment: 'Good effort overall. Would benefit from more practice with the advanced topics.' },
    ];

    for (let i = 0; i < Math.min(enrolledStudents.length, comments.length); i++) {
      await prisma.teacherComment.create({
        data: {
          teacherId: teacher.id,
          studentId: enrolledStudents[i].id,
          courseId: course.id,
          comment: comments[i].comment,
          type: comments[i].type,
        },
      });
    }
    console.log(`  Comments for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 9. CONVERSATIONS & MESSAGES
  // ======================================================================
  console.log('[9/11] Creating conversations & messages...');

  // For each course: create direct conversations between teacher and each student
  for (const course of courses) {
    const teacher = course.teachers[0]?.teacher;
    if (!teacher) continue;

    const enrolledStudents = course.students.map(s => s.student);

    for (const student of enrolledStudents.slice(0, 3)) {
      // Check if direct conversation exists
      const existingParticipations = await prisma.conversationParticipant.findMany({
        where: { userId: teacher.id, userType: 'teacher' },
        select: { conversationId: true },
      });
      const convIds = existingParticipations.map(p => p.conversationId);

      let existingDirect = null;
      if (convIds.length > 0) {
        existingDirect = await prisma.conversationParticipant.findFirst({
          where: {
            conversationId: { in: convIds },
            userId: student.id,
            userType: 'student',
            conversation: { isGroup: false },
          },
        });
      }

      if (!existingDirect) {
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

        const msgs = [
          { senderId: teacher.id, senderType: 'teacher', text: `Hi ${student.name}! Welcome to ${course.titleEn || course.titleAz}. Feel free to ask any questions here.`, createdAt: daysAgo(20) },
          { senderId: student.id, senderType: 'student', text: 'Thank you! I\'m really enjoying the course so far. The materials are very well organized.', createdAt: daysAgo(19) },
          { senderId: teacher.id, senderType: 'teacher', text: 'Glad to hear that! Don\'t forget to submit Homework #1 by the deadline.', createdAt: daysAgo(14) },
          { senderId: student.id, senderType: 'student', text: 'Already submitted it! Could you check if everything looks okay?', createdAt: daysAgo(13) },
          { senderId: teacher.id, senderType: 'teacher', text: 'I\'ll review it today. Great job staying on top of things! 👍', createdAt: daysAgo(12) },
          { senderId: student.id, senderType: 'student', text: 'Thanks! Also, I had a question about the quiz - is there a time limit?', createdAt: daysAgo(8) },
          { senderId: teacher.id, senderType: 'teacher', text: 'Yes, 15 minutes for the first quiz. Make sure you review all the materials before starting.', createdAt: daysAgo(7) },
        ];

        for (const msg of msgs) {
          await prisma.message.create({
            data: { conversationId: conv.id, ...msg },
          });
        }
      }
    }

    // Create group chat for course if not exists
    const existingGroup = await prisma.conversation.findFirst({
      where: { courseId: course.id, isGroup: true },
    });

    if (!existingGroup && enrolledStudents.length > 0) {
      const groupConv = await prisma.conversation.create({
        data: {
          courseId: course.id,
          title: `${course.titleEn || course.titleAz} - Group`,
          isGroup: true,
          participants: {
            create: [
              { userId: teacher.id, userType: 'teacher' },
              ...enrolledStudents.map(s => ({ userId: s.id, userType: 'student' as const })),
            ],
          },
        },
      });

      const groupMsgs = [
        { senderId: teacher.id, senderType: 'teacher', text: `Welcome everyone to the ${course.titleEn || course.titleAz} group chat! 🎉 Use this space for course discussions.`, createdAt: daysAgo(25) },
        { senderId: enrolledStudents[0].id, senderType: 'student', text: 'Thanks for creating this! Very convenient.', createdAt: daysAgo(24) },
        { senderId: teacher.id, senderType: 'teacher', text: 'Reminder: Homework #1 is due this Friday. Let me know if you need any help!', createdAt: daysAgo(12) },
        ...(enrolledStudents.length > 1 ? [{ senderId: enrolledStudents[1].id, senderType: 'student' as const, text: 'Is it okay to use external libraries for the homework?', createdAt: daysAgo(11) }] : []),
        { senderId: teacher.id, senderType: 'teacher', text: 'Yes, you can use any libraries mentioned in the course materials. Good question!', createdAt: daysAgo(11) },
        { senderId: enrolledStudents[0].id, senderType: 'student', text: 'Just finished the quiz. It was challenging but fair! 💪', createdAt: daysAgo(5) },
      ];

      for (const msg of groupMsgs) {
        await prisma.message.create({
          data: { conversationId: groupConv.id, ...msg },
        });
      }
    }

    console.log(`  Conversations for "${course.titleEn || course.titleAz}"`);
  }

  // ======================================================================
  // 10. XP & BADGES
  // ======================================================================
  console.log('[10/11] Updating XP & badges...');

  // Reset XP and recalculate
  for (const student of students) {
    const xpReasons = [
      { amount: 10, reason: 'lesson_completed' },
      { amount: 10, reason: 'lesson_completed' },
      { amount: 10, reason: 'lesson_completed' },
      { amount: 15, reason: 'assignment_submitted' },
      { amount: 25, reason: 'assignment_high_grade' },
      { amount: 20, reason: 'quiz_completed' },
      { amount: 5, reason: 'attendance_present' },
      { amount: 5, reason: 'attendance_present' },
      { amount: 5, reason: 'attendance_present' },
    ];

    // Vary XP per student
    const txCount = Math.floor(Math.random() * 5) + 4; // 4-8 transactions
    let totalXp = 0;

    for (let i = 0; i < txCount; i++) {
      const xp = xpReasons[i % xpReasons.length];
      const existing = await prisma.xPTransaction.findFirst({
        where: { studentId: student.id, reason: xp.reason },
      });
      if (!existing || i > 3) {
        await prisma.xPTransaction.create({
          data: {
            studentId: student.id,
            amount: xp.amount,
            reason: xp.reason,
            createdAt: daysAgo(30 - i * 3),
          },
        });
      }
      totalXp += xp.amount;
    }

    // Update total XP
    const currentXp = await prisma.xPTransaction.aggregate({
      where: { studentId: student.id },
      _sum: { amount: true },
    });
    await prisma.student.update({
      where: { id: student.id },
      data: { xpTotal: currentXp._sum.amount || 0 },
    });
  }

  // Award badges
  const badges = await prisma.badge.findMany();
  for (const student of students) {
    const studentData = await prisma.student.findUnique({ where: { id: student.id } });
    if (!studentData) continue;

    // Award FIRST_LESSON badge to all
    const firstLesson = badges.find(b => b.code === 'FIRST_LESSON');
    if (firstLesson) {
      await prisma.studentBadge.upsert({
        where: { studentId_badgeId: { studentId: student.id, badgeId: firstLesson.id } },
        update: {},
        create: { studentId: student.id, badgeId: firstLesson.id },
      });
    }

    // Award FIRST_QUIZ to most students
    if (Math.random() > 0.2) {
      const firstQuiz = badges.find(b => b.code === 'FIRST_QUIZ');
      if (firstQuiz) {
        await prisma.studentBadge.upsert({
          where: { studentId_badgeId: { studentId: student.id, badgeId: firstQuiz.id } },
          update: {},
          create: { studentId: student.id, badgeId: firstQuiz.id },
        });
      }
    }

    // Award FIRST_ASSIGNMENT to most
    if (Math.random() > 0.3) {
      const firstAsg = badges.find(b => b.code === 'FIRST_ASSIGNMENT');
      if (firstAsg) {
        await prisma.studentBadge.upsert({
          where: { studentId_badgeId: { studentId: student.id, badgeId: firstAsg.id } },
          update: {},
          create: { studentId: student.id, badgeId: firstAsg.id },
        });
      }
    }

    // Award TOP_STUDENT if XP >= 500
    if ((studentData.xpTotal || 0) >= 150) {
      const top = badges.find(b => b.code === 'LESSON_MASTER');
      if (top) {
        await prisma.studentBadge.upsert({
          where: { studentId_badgeId: { studentId: student.id, badgeId: top.id } },
          update: {},
          create: { studentId: student.id, badgeId: top.id },
        });
      }
    }
  }
  console.log(`  XP & badges updated for ${students.length} students`);

  // ======================================================================
  // 11. NOTIFICATIONS
  // ======================================================================
  console.log('[11/11] Creating sample notifications...');

  for (const student of students.slice(0, 5)) {
    const notifs = [
      { type: 'NEW_ASSIGNMENT' as const, title: 'New Assignment', message: 'Homework #3: Advanced Challenge has been posted. Due in 5 days.', link: '/lms/student/assignments', createdAt: daysAgo(2) },
      { type: 'ASSIGNMENT_GRADED' as const, title: 'Assignment Graded', message: 'Your Homework #1 has been graded: 92/100. Great work!', link: '/lms/student/assignments', createdAt: daysAgo(5), isRead: true },
      { type: 'NEW_QUIZ' as const, title: 'New Quiz Available', message: 'Module 2 Quiz is now available. Time limit: 20 minutes.', link: '/lms/student/quizzes', createdAt: daysAgo(7) },
      { type: 'BADGE_EARNED' as const, title: 'Badge Earned: First Steps 🎯', message: 'Congratulations! You earned the "First Steps" badge!', link: '/lms/student/achievements', createdAt: daysAgo(15), isRead: true },
      { type: 'ATTENDANCE_MARKED' as const, title: 'Attendance Recorded', message: 'Your attendance was marked as Present for today\'s class.', link: '/lms/student/attendance', createdAt: daysAgo(1) },
      { type: 'NEW_COMMENT' as const, title: 'New Teacher Comment', message: 'Your teacher left a comment about your progress.', link: '/lms/student/courses', createdAt: daysAgo(10), isRead: true },
    ];

    for (const n of notifs) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          userType: 'student',
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.isRead || false,
          createdAt: n.createdAt,
        },
      });
    }
  }

  // Teacher notifications
  for (const teacher of teachers.slice(0, 3)) {
    const tNotifs = [
      { type: 'SYSTEM' as const, title: 'New Submission', message: 'A student submitted Homework #2. Review when available.', link: '/lms/teacher/courses', createdAt: daysAgo(3) },
      { type: 'NEW_MESSAGE' as const, title: 'New Message', message: 'You have a new message from a student.', link: '/lms/teacher/messages', createdAt: daysAgo(1) },
    ];

    for (const n of tNotifs) {
      await prisma.notification.create({
        data: {
          userId: teacher.id,
          userType: 'teacher',
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: false,
          createdAt: n.createdAt,
        },
      });
    }
  }

  console.log(`  Notifications created`);

  console.log('\n=== Production Seed Complete! ===');
  console.log('All features now have demo data ready for testing.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
