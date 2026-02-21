import { FastifyInstance } from 'fastify';
import { adminAuth, teacherAuth, studentAuth, adminOrTeacherAuth, anyAuth } from '../middleware/auth.middleware.js';

export async function quizRoutes(server: FastifyInstance) {
  // ==========================================
  // TEACHER/ADMIN ENDPOINTS
  // ==========================================

  // GET /courses/:courseId — Get quizzes for a course (teacher/admin)
  server.get('/courses/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };

    if (request.user.type !== 'admin') {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const quizzes = await server.prisma.quiz.findMany({
      where: { courseId },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get stats for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (q) => {
        const completedAttempts = await server.prisma.quizAttempt.count({
          where: { quizId: q.id, status: { in: ['COMPLETED', 'GRADED'] } },
        });
        const avgScore = await server.prisma.quizAttempt.aggregate({
          where: { quizId: q.id, status: { in: ['COMPLETED', 'GRADED'] }, score: { not: null } },
          _avg: { score: true },
        });
        return {
          ...q,
          stats: {
            totalAttempts: q._count.attempts,
            completedAttempts,
            avgScore: avgScore._avg.score ? Math.round(avgScore._avg.score * 10) / 10 : null,
          },
        };
      })
    );

    return reply.send({ success: true, data: quizzesWithStats });
  });

  // POST /courses/:courseId — Create quiz (teacher/admin)
  server.post('/courses/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId } = request.params as { courseId: string };
    const body = request.body as {
      title: string;
      description?: string;
      timeLimit?: number;
      maxAttempts?: number;
      passingScore?: number;
      showResults?: boolean;
      shuffleQuestions?: boolean;
      questions?: Array<{
        type: string;
        question: string;
        options?: Array<{ id: string; text: string }>;
        correctAnswer: any;
        points?: number;
        explanation?: string;
        order?: number;
      }>;
    };

    if (!body.title) {
      return reply.status(400).send({ success: false, message: 'Title is required' });
    }

    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const course = await server.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    const quiz = await server.prisma.quiz.create({
      data: {
        courseId,
        teacherId: isAdmin ? null : id,
        title: body.title,
        description: body.description || null,
        timeLimit: body.timeLimit || null,
        maxAttempts: body.maxAttempts || 1,
        passingScore: body.passingScore || null,
        showResults: body.showResults !== undefined ? body.showResults : true,
        shuffleQuestions: body.shuffleQuestions || false,
        questions: body.questions ? {
          create: body.questions.map((q, idx) => ({
            type: q.type as any,
            question: q.question,
            options: q.options || undefined,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            explanation: q.explanation || null,
            order: q.order !== undefined ? q.order : idx,
          })),
        } : undefined,
      },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        questions: { orderBy: { order: 'asc' } },
      },
    });

    return reply.status(201).send({ success: true, data: quiz });
  });

  // GET /courses/:courseId/:quizId — Get single quiz with questions (teacher/admin)
  server.get('/courses/:courseId/:quizId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, quizId } = request.params as { courseId: string; quizId: string };

    if (request.user.type !== 'admin') {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const quiz = await server.prisma.quiz.findFirst({
      where: { id: quizId, courseId },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        questions: { orderBy: { order: 'asc' } },
        attempts: {
          include: {
            student: { select: { id: true, name: true, email: true, photo: true } },
            answers: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quiz) {
      return reply.status(404).send({ success: false, message: 'Quiz not found' });
    }

    return reply.send({ success: true, data: quiz });
  });

  // PUT /courses/:courseId/:quizId — Update quiz (teacher/admin)
  server.put('/courses/:courseId/:quizId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId, quizId } = request.params as { courseId: string; quizId: string };
    const body = request.body as {
      title?: string;
      description?: string;
      timeLimit?: number | null;
      maxAttempts?: number;
      passingScore?: number | null;
      showResults?: boolean;
      shuffleQuestions?: boolean;
      isActive?: boolean;
      isPublished?: boolean;
    };

    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const existing = await server.prisma.quiz.findFirst({ where: { id: quizId, courseId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Quiz not found' });
    }

    if (!isAdmin && existing.teacherId !== id) {
      return reply.status(403).send({ success: false, message: 'You can only edit your own quizzes' });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.timeLimit !== undefined) updateData.timeLimit = body.timeLimit;
    if (body.maxAttempts !== undefined) updateData.maxAttempts = body.maxAttempts;
    if (body.passingScore !== undefined) updateData.passingScore = body.passingScore;
    if (body.showResults !== undefined) updateData.showResults = body.showResults;
    if (body.shuffleQuestions !== undefined) updateData.shuffleQuestions = body.shuffleQuestions;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    // If publishing for the first time, notify students
    if (body.isPublished && !existing.isPublished) {
      const enrollments = await server.prisma.studentCourse.findMany({
        where: { courseId, status: 'ACTIVE' },
        select: { studentId: true },
      });

      if (enrollments.length > 0) {
        await server.prisma.notification.createMany({
          data: enrollments.map((e) => ({
            userId: e.studentId,
            userType: 'student',
            type: 'NEW_QUIZ' as const,
            title: 'New Quiz Available',
            message: `A new quiz "${existing.title}" is now available${existing.timeLimit ? ` (${existing.timeLimit} min)` : ''}`,
            link: `/lms/student/courses/${courseId}/quizzes`,
          })),
        });
      }
    }

    const quiz = await server.prisma.quiz.update({
      where: { id: quizId },
      data: updateData,
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        questions: { orderBy: { order: 'asc' } },
      },
    });

    return reply.send({ success: true, data: quiz });
  });

  // DELETE /courses/:courseId/:quizId — Delete quiz (teacher/admin)
  server.delete('/courses/:courseId/:quizId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId, quizId } = request.params as { courseId: string; quizId: string };

    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const existing = await server.prisma.quiz.findFirst({ where: { id: quizId, courseId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Quiz not found' });
    }

    if (!isAdmin && existing.teacherId !== id) {
      return reply.status(403).send({ success: false, message: 'You can only delete your own quizzes' });
    }

    await server.prisma.quiz.delete({ where: { id: quizId } });
    return reply.send({ success: true, message: 'Quiz deleted' });
  });

  // ==========================================
  // QUESTION MANAGEMENT (teacher/admin)
  // ==========================================

  // POST /courses/:courseId/:quizId/questions — Add question to quiz
  server.post('/courses/:courseId/:quizId/questions', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId, quizId } = request.params as { courseId: string; quizId: string };
    const body = request.body as {
      type: string;
      question: string;
      options?: Array<{ id: string; text: string }>;
      correctAnswer: any;
      points?: number;
      explanation?: string;
      order?: number;
    };

    if (!body.question || !body.type || body.correctAnswer === undefined) {
      return reply.status(400).send({ success: false, message: 'question, type, and correctAnswer are required' });
    }

    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const quiz = await server.prisma.quiz.findFirst({ where: { id: quizId, courseId } });
    if (!quiz) {
      return reply.status(404).send({ success: false, message: 'Quiz not found' });
    }

    // Get next order
    const lastQuestion = await server.prisma.quizQuestion.findFirst({
      where: { quizId },
      orderBy: { order: 'desc' },
    });
    const nextOrder = body.order !== undefined ? body.order : (lastQuestion ? lastQuestion.order + 1 : 0);

    const question = await server.prisma.quizQuestion.create({
      data: {
        quizId,
        type: body.type as any,
        question: body.question,
        options: body.options || undefined,
        correctAnswer: body.correctAnswer,
        points: body.points || 1,
        explanation: body.explanation || null,
        order: nextOrder,
      },
    });

    return reply.status(201).send({ success: true, data: question });
  });

  // PUT /questions/:questionId — Update question
  server.put('/questions/:questionId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    const body = request.body as {
      type?: string;
      question?: string;
      options?: Array<{ id: string; text: string }>;
      correctAnswer?: any;
      points?: number;
      explanation?: string;
      order?: number;
    };

    const existing = await server.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { quiz: { select: { courseId: true, teacherId: true } } },
    });

    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Question not found' });
    }

    const updateData: any = {};
    if (body.type !== undefined) updateData.type = body.type;
    if (body.question !== undefined) updateData.question = body.question;
    if (body.options !== undefined) updateData.options = body.options;
    if (body.correctAnswer !== undefined) updateData.correctAnswer = body.correctAnswer;
    if (body.points !== undefined) updateData.points = body.points;
    if (body.explanation !== undefined) updateData.explanation = body.explanation;
    if (body.order !== undefined) updateData.order = body.order;

    const question = await server.prisma.quizQuestion.update({
      where: { id: questionId },
      data: updateData,
    });

    return reply.send({ success: true, data: question });
  });

  // DELETE /questions/:questionId — Delete question
  server.delete('/questions/:questionId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { questionId } = request.params as { questionId: string };

    const existing = await server.prisma.quizQuestion.findUnique({ where: { id: questionId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Question not found' });
    }

    await server.prisma.quizQuestion.delete({ where: { id: questionId } });
    return reply.send({ success: true, message: 'Question deleted' });
  });

  // ==========================================
  // GRADE OPEN-ENDED / CODE ANSWERS (teacher/admin)
  // ==========================================

  // PUT /attempts/:attemptId/answers/:answerId/grade — Grade a single answer
  server.put('/attempts/:attemptId/answers/:answerId/grade', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { attemptId, answerId } = request.params as { attemptId: string; answerId: string };
    const body = request.body as {
      pointsEarned: number;
      isCorrect: boolean;
    };

    const answer = await server.prisma.quizAnswer.findFirst({
      where: { id: answerId, attemptId },
      include: {
        question: { select: { points: true, type: true } },
        attempt: { select: { quizId: true, studentId: true } },
      },
    });

    if (!answer) {
      return reply.status(404).send({ success: false, message: 'Answer not found' });
    }

    // Only allow grading open-ended and code questions
    if (!['OPEN_ENDED', 'CODE'].includes(answer.question.type)) {
      return reply.status(400).send({ success: false, message: 'Only open-ended and code answers can be manually graded' });
    }

    const updatedAnswer = await server.prisma.quizAnswer.update({
      where: { id: answerId },
      data: {
        isCorrect: body.isCorrect,
        pointsEarned: body.pointsEarned,
      },
    });

    // Recalculate attempt score if all answers are graded
    const allAnswers = await server.prisma.quizAnswer.findMany({
      where: { attemptId },
      include: { question: { select: { points: true } } },
    });

    const allGraded = allAnswers.every((a) => a.isCorrect !== null);

    if (allGraded) {
      const totalPoints = allAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const maxPoints = allAnswers.reduce((sum, a) => sum + a.question.points, 0);
      const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100 * 10) / 10 : 0;

      await server.prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          totalPoints,
          maxPoints,
          status: 'GRADED',
        },
      });

      // Notify student
      const attempt = await server.prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: { quiz: { select: { title: true, courseId: true } } },
      });

      if (attempt) {
        await server.prisma.notification.create({
          data: {
            userId: attempt.studentId,
            userType: 'student',
            type: 'QUIZ_GRADED',
            title: 'Quiz Graded',
            message: `Your quiz "${attempt.quiz.title}" has been fully graded. Score: ${score}%`,
            link: `/lms/student/courses/${attempt.quiz.courseId}/quizzes`,
          },
        });
      }
    }

    return reply.send({ success: true, data: updatedAnswer });
  });

  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  // GET /student/my — Get all quizzes for student's enrolled courses
  server.get('/student/my', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.query as { courseId?: string };

    const enrollments = await server.prisma.studentCourse.findMany({
      where: { studentId: id, status: 'ACTIVE' },
      select: { courseId: true },
    });
    const courseIds = courseId ? [courseId] : enrollments.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    const quizzes = await server.prisma.quiz.findMany({
      where: { courseId: { in: courseIds }, isActive: true, isPublished: true },
      include: {
        course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        _count: { select: { questions: true } },
        attempts: {
          where: { studentId: id },
          select: { id: true, score: true, status: true, startedAt: true, completedAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = quizzes.map((q) => {
      const bestAttempt = q.attempts
        .filter((a) => a.status === 'COMPLETED' || a.status === 'GRADED')
        .sort((a, b) => (b.score || 0) - (a.score || 0))[0] || null;
      const lastAttempt = q.attempts[0] || null;
      const attemptsUsed = q.attempts.filter((a) => a.status !== 'IN_PROGRESS').length;
      const canRetake = attemptsUsed < q.maxAttempts;
      const hasInProgress = q.attempts.some((a) => a.status === 'IN_PROGRESS');
      const passed = bestAttempt && q.passingScore ? (bestAttempt.score || 0) >= q.passingScore : null;

      return {
        ...q,
        attempts: undefined,
        bestAttempt,
        lastAttempt,
        attemptsUsed,
        canRetake,
        hasInProgress,
        passed,
      };
    });

    return reply.send({ success: true, data });
  });

  // GET /student/courses/:courseId — Get quizzes for a specific course (student)
  server.get('/student/courses/:courseId', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };

    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    const quizzes = await server.prisma.quiz.findMany({
      where: { courseId, isActive: true, isPublished: true },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        _count: { select: { questions: true } },
        attempts: {
          where: { studentId: id },
          select: { id: true, score: true, status: true, startedAt: true, completedAt: true, timeSpentSec: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = quizzes.map((q) => {
      const bestAttempt = q.attempts
        .filter((a) => a.status === 'COMPLETED' || a.status === 'GRADED')
        .sort((a, b) => (b.score || 0) - (a.score || 0))[0] || null;
      const lastAttempt = q.attempts[0] || null;
      const attemptsUsed = q.attempts.filter((a) => a.status !== 'IN_PROGRESS').length;
      const canRetake = attemptsUsed < q.maxAttempts;
      const hasInProgress = q.attempts.some((a) => a.status === 'IN_PROGRESS');
      const passed = bestAttempt && q.passingScore ? (bestAttempt.score || 0) >= q.passingScore : null;

      return {
        ...q,
        attempts: undefined,
        bestAttempt,
        lastAttempt,
        attemptsUsed,
        canRetake,
        hasInProgress,
        passed,
      };
    });

    return reply.send({ success: true, data });
  });

  // POST /student/courses/:courseId/:quizId/start — Start a quiz attempt
  server.post('/student/courses/:courseId/:quizId/start', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, quizId } = request.params as { courseId: string; quizId: string };

    // Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    // Get quiz
    const quiz = await server.prisma.quiz.findFirst({
      where: { id: quizId, courseId, isActive: true, isPublished: true },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });
    if (!quiz) {
      return reply.status(404).send({ success: false, message: 'Quiz not found or not published' });
    }

    if (quiz.questions.length === 0) {
      return reply.status(400).send({ success: false, message: 'Quiz has no questions' });
    }

    // Check if there's an existing in-progress attempt
    const existingInProgress = await server.prisma.quizAttempt.findFirst({
      where: { quizId, studentId: id, status: 'IN_PROGRESS' },
      include: {
        answers: true,
      },
    });

    if (existingInProgress) {
      // Return existing attempt with questions (no correct answers for student)
      const questions = quiz.shuffleQuestions
        ? [...quiz.questions].sort(() => Math.random() - 0.5)
        : quiz.questions;

      const questionsForStudent = questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        points: q.points,
        order: q.order,
        // Don't send correctAnswer or explanation during quiz
      }));

      return reply.send({
        success: true,
        data: {
          attempt: existingInProgress,
          questions: questionsForStudent,
          timeLimit: quiz.timeLimit,
        },
      });
    }

    // Check max attempts
    const completedAttempts = await server.prisma.quizAttempt.count({
      where: { quizId, studentId: id, status: { in: ['COMPLETED', 'GRADED', 'TIMED_OUT'] } },
    });

    if (completedAttempts >= quiz.maxAttempts) {
      return reply.status(400).send({ success: false, message: `Maximum attempts (${quiz.maxAttempts}) reached` });
    }

    // Create new attempt
    const attempt = await server.prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: id,
        status: 'IN_PROGRESS',
      },
    });

    // Return questions (without correct answers)
    const questions = quiz.shuffleQuestions
      ? [...quiz.questions].sort(() => Math.random() - 0.5)
      : quiz.questions;

    const questionsForStudent = questions.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
      order: q.order,
    }));

    return reply.status(201).send({
      success: true,
      data: {
        attempt,
        questions: questionsForStudent,
        timeLimit: quiz.timeLimit,
      },
    });
  });

  // POST /student/attempts/:attemptId/answer — Submit answer for a question
  server.post('/student/attempts/:attemptId/answer', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { attemptId } = request.params as { attemptId: string };
    const body = request.body as {
      questionId: string;
      answer: any; // ["selectedOptionId"] or ["text answer"]
    };

    if (!body.questionId || body.answer === undefined) {
      return reply.status(400).send({ success: false, message: 'questionId and answer are required' });
    }

    // Verify attempt belongs to student and is in progress
    const attempt = await server.prisma.quizAttempt.findFirst({
      where: { id: attemptId, studentId: id, status: 'IN_PROGRESS' },
      include: { quiz: { select: { timeLimit: true } } },
    });

    if (!attempt) {
      return reply.status(404).send({ success: false, message: 'Attempt not found or already completed' });
    }

    // Check time limit
    if (attempt.quiz.timeLimit) {
      const elapsed = (Date.now() - attempt.startedAt.getTime()) / 1000 / 60; // minutes
      if (elapsed > attempt.quiz.timeLimit) {
        // Auto-complete with timeout
        await server.prisma.quizAttempt.update({
          where: { id: attemptId },
          data: { status: 'TIMED_OUT', completedAt: new Date() },
        });
        return reply.status(400).send({ success: false, message: 'Time limit exceeded' });
      }
    }

    // Get question to check answer
    const question = await server.prisma.quizQuestion.findUnique({
      where: { id: body.questionId },
    });

    if (!question) {
      return reply.status(404).send({ success: false, message: 'Question not found' });
    }

    // Auto-grade for MC, MS, TF
    let isCorrect: boolean | null = null;
    let pointsEarned: number | null = null;

    const studentAnswer = Array.isArray(body.answer) ? body.answer : [body.answer];
    const correctAnswer = question.correctAnswer as any[];

    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      isCorrect = JSON.stringify(studentAnswer.sort()) === JSON.stringify(correctAnswer.sort());
      pointsEarned = isCorrect ? question.points : 0;
    } else if (question.type === 'MULTIPLE_SELECT') {
      isCorrect = JSON.stringify(studentAnswer.sort()) === JSON.stringify(correctAnswer.sort());
      pointsEarned = isCorrect ? question.points : 0;
    }
    // OPEN_ENDED and CODE: isCorrect = null (needs manual grading)

    // Upsert answer (allow changing answer before completion)
    const answer = await server.prisma.quizAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: body.questionId } },
      create: {
        attemptId,
        questionId: body.questionId,
        answer: studentAnswer,
        isCorrect,
        pointsEarned,
      },
      update: {
        answer: studentAnswer,
        isCorrect,
        pointsEarned,
      },
    });

    return reply.send({ success: true, data: answer });
  });

  // POST /student/attempts/:attemptId/complete — Complete quiz attempt
  server.post('/student/attempts/:attemptId/complete', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { attemptId } = request.params as { attemptId: string };

    const attempt = await server.prisma.quizAttempt.findFirst({
      where: { id: attemptId, studentId: id, status: 'IN_PROGRESS' },
      include: {
        quiz: {
          select: { id: true, title: true, courseId: true, showResults: true, passingScore: true, teacherId: true },
        },
      },
    });

    if (!attempt) {
      return reply.status(404).send({ success: false, message: 'Attempt not found or already completed' });
    }

    // Get all answers for this attempt
    const answers = await server.prisma.quizAnswer.findMany({
      where: { attemptId },
      include: { question: { select: { points: true, type: true, correctAnswer: true, explanation: true } } },
    });

    // Calculate score (only for auto-graded questions)
    const totalPoints = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const maxPoints = answers.reduce((sum, a) => sum + a.question.points, 0);
    const hasManualGrading = answers.some((a) => a.isCorrect === null);
    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100 * 10) / 10 : 0;

    const timeSpentSec = Math.round((Date.now() - attempt.startedAt.getTime()) / 1000);

    const updatedAttempt = await server.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: hasManualGrading ? 'COMPLETED' : 'GRADED',
        score: hasManualGrading ? null : score,
        totalPoints,
        maxPoints,
        completedAt: new Date(),
        timeSpentSec,
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                question: true,
                options: true,
                correctAnswer: attempt.quiz.showResults ? true : false,
                explanation: attempt.quiz.showResults ? true : false,
                points: true,
              },
            },
          },
        },
      },
    });

    // Notify teacher if there are open-ended questions to grade
    if (hasManualGrading && attempt.quiz.teacherId) {
      const student = await server.prisma.student.findUnique({
        where: { id },
        select: { name: true },
      });
      await server.prisma.notification.create({
        data: {
          userId: attempt.quiz.teacherId,
          userType: 'teacher',
          type: 'NEW_QUIZ' as const,
          title: 'Quiz Needs Grading',
          message: `${student?.name || 'A student'} completed "${attempt.quiz.title}" — has open-ended answers to grade`,
          link: `/lms/teacher/courses/${attempt.quiz.courseId}/quizzes`,
        },
      });
    }

    // Return results
    const result: any = {
      attempt: updatedAttempt,
      score: hasManualGrading ? null : score,
      totalPoints,
      maxPoints,
      timeSpentSec,
      hasManualGrading,
      passed: attempt.quiz.passingScore ? score >= attempt.quiz.passingScore : null,
    };

    // Include correct answers if showResults is true
    if (attempt.quiz.showResults) {
      result.answers = updatedAttempt.answers;
    }

    return reply.send({ success: true, data: result });
  });

  // GET /student/attempts/:attemptId/results — Get quiz results (after completion)
  server.get('/student/attempts/:attemptId/results', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { attemptId } = request.params as { attemptId: string };

    const attempt = await server.prisma.quizAttempt.findFirst({
      where: { id: attemptId, studentId: id, status: { in: ['COMPLETED', 'GRADED', 'TIMED_OUT'] } },
      include: {
        quiz: {
          select: { title: true, showResults: true, passingScore: true, courseId: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return reply.status(404).send({ success: false, message: 'Completed attempt not found' });
    }

    // Strip correct answers if showResults is false
    const data: any = { ...attempt };
    if (!attempt.quiz.showResults) {
      data.answers = data.answers.map((a: any) => ({
        ...a,
        question: {
          ...a.question,
          correctAnswer: undefined,
          explanation: undefined,
        },
      }));
    }

    return reply.send({
      success: true,
      data: {
        ...data,
        passed: attempt.quiz.passingScore && attempt.score !== null
          ? attempt.score >= attempt.quiz.passingScore
          : null,
      },
    });
  });
}
