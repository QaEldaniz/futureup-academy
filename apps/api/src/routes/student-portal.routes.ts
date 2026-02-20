import { FastifyInstance } from 'fastify';
import { studentAuth } from '../middleware/auth.middleware.js';

export async function studentPortalRoutes(server: FastifyInstance) {
  // All routes require student authentication
  server.addHook('preHandler', studentAuth);

  // GET /me — student profile with enrolled courses
  server.get('/me', async (request, reply) => {
    const { id } = request.user;

    const student = await server.prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        createdAt: true,
        lastLoginAt: true,
        courses: {
          select: {
            status: true,
            startDate: true,
            course: {
              select: {
                id: true, slug: true,
                titleAz: true, titleRu: true, titleEn: true,
                image: true, level: true, audience: true,
              },
            },
          },
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!student) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    return reply.send({ success: true, data: student });
  });

  // GET /courses — my courses with progress
  server.get('/courses', async (request, reply) => {
    const { id } = request.user;

    const enrollments = await server.prisma.studentCourse.findMany({
      where: { studentId: id },
      include: {
        course: {
          select: {
            id: true, slug: true,
            titleAz: true, titleRu: true, titleEn: true,
            shortDescAz: true, shortDescRu: true, shortDescEn: true,
            image: true, level: true, duration: true, audience: true,
            category: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
            _count: { select: { lessons: { where: { isPublished: true } } } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    // Get course progress for each enrollment
    const courseIds = enrollments.map((e) => e.courseId);
    const progressList = await server.prisma.courseProgress.findMany({
      where: { studentId: id, courseId: { in: courseIds } },
    });

    const progressMap = new Map(progressList.map((p) => [p.courseId, p]));

    const data = enrollments.map((e) => ({
      ...e,
      progress: progressMap.get(e.courseId) || { percentage: 0, lastAccessedAt: null },
    }));

    return reply.send({ success: true, data });
  });

  // GET /courses/:courseId — course detail with lessons & progress
  server.get('/courses/:courseId', async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };

    // Verify student is enrolled
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });

    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    const course = await server.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        teachers: {
          include: {
            teacher: {
              select: { id: true, nameAz: true, nameRu: true, nameEn: true, photo: true, specialization: true },
            },
          },
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true, titleAz: true, titleRu: true, titleEn: true,
            descAz: true, descRu: true, descEn: true, order: true,
            _count: { select: { materials: true } },
          },
        },
      },
    });

    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    // Get lesson progress
    const lessonIds = course.lessons.map((l) => l.id);
    const lessonProgress = await server.prisma.lessonProgress.findMany({
      where: { studentId: id, lessonId: { in: lessonIds } },
    });
    const lessonProgressMap = new Map(lessonProgress.map((p) => [p.lessonId, p]));

    // Get course progress
    const courseProgress = await server.prisma.courseProgress.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });

    const lessonsWithProgress = course.lessons.map((l) => ({
      ...l,
      progress: lessonProgressMap.get(l.id) || { status: 'NOT_STARTED', completedAt: null, timeSpentSec: 0 },
    }));

    return reply.send({
      success: true,
      data: {
        ...course,
        lessons: lessonsWithProgress,
        enrollment,
        courseProgress: courseProgress || { percentage: 0, lastAccessedAt: null },
      },
    });
  });

  // GET /courses/:courseId/lessons/:lessonId — lesson with materials
  server.get('/courses/:courseId/lessons/:lessonId', async (request, reply) => {
    const { id } = request.user;
    const { courseId, lessonId } = request.params as { courseId: string; lessonId: string };

    // Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    const lesson = await server.prisma.lesson.findFirst({
      where: { id: lessonId, courseId, isPublished: true },
      include: {
        materials: { orderBy: { order: 'asc' } },
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
      },
    });

    if (!lesson) {
      return reply.status(404).send({ success: false, message: 'Lesson not found' });
    }

    // Get progress
    const progress = await server.prisma.lessonProgress.findUnique({
      where: { studentId_lessonId: { studentId: id, lessonId } },
    });

    // Get prev/next lessons for navigation
    const allLessons = await server.prisma.lesson.findMany({
      where: { courseId, isPublished: true },
      orderBy: { order: 'asc' },
      select: { id: true, titleAz: true, titleRu: true, titleEn: true, order: true },
    });

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return reply.send({
      success: true,
      data: {
        ...lesson,
        progress: progress || { status: 'NOT_STARTED', completedAt: null, timeSpentSec: 0 },
        navigation: { prev: prevLesson, next: nextLesson, total: allLessons.length, current: currentIndex + 1 },
      },
    });
  });

  // POST /courses/:courseId/lessons/:lessonId/progress — update lesson progress
  server.post('/courses/:courseId/lessons/:lessonId/progress', async (request, reply) => {
    const { id } = request.user;
    const { courseId, lessonId } = request.params as { courseId: string; lessonId: string };
    const { status, timeSpentSec } = request.body as {
      status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      timeSpentSec?: number;
    };

    // Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    // Upsert lesson progress
    const now = new Date();
    const progress = await server.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: id, lessonId } },
      create: {
        studentId: id,
        lessonId,
        status: status || 'IN_PROGRESS',
        startedAt: now,
        completedAt: status === 'COMPLETED' ? now : null,
        timeSpentSec: timeSpentSec || 0,
      },
      update: {
        ...(status ? { status } : {}),
        ...(status === 'COMPLETED' ? { completedAt: now } : {}),
        ...(timeSpentSec ? { timeSpentSec: { increment: timeSpentSec } } : {}),
      },
    });

    // Recalculate course progress
    const totalLessons = await server.prisma.lesson.count({
      where: { courseId, isPublished: true },
    });
    const completedLessons = await server.prisma.lessonProgress.count({
      where: { studentId: id, lesson: { courseId }, status: 'COMPLETED' },
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await server.prisma.courseProgress.upsert({
      where: { studentId_courseId: { studentId: id, courseId } },
      create: { studentId: id, courseId, percentage, lastAccessedAt: now },
      update: { percentage, lastAccessedAt: now },
    });

    return reply.send({ success: true, data: { progress, coursePercentage: percentage } });
  });

  // GET /certificates — my certificates
  server.get('/certificates', async (request, reply) => {
    const { id } = request.user;

    const certificates = await server.prisma.certificate.findMany({
      where: { studentId: id, status: 'ACTIVE' },
      include: {
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true, image: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true, photo: true },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return reply.send({ success: true, data: certificates });
  });

  // GET /notifications — placeholder for future notifications
  server.get('/notifications', async (request, reply) => {
    // For now return teacher comments as "notifications"
    const { id } = request.user;

    const comments = await server.prisma.teacherComment.findMany({
      where: { studentId: id },
      include: {
        teacher: {
          select: { nameAz: true, nameRu: true, nameEn: true, photo: true },
        },
        course: {
          select: { titleAz: true, titleRu: true, titleEn: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return reply.send({ success: true, data: comments });
  });
}
