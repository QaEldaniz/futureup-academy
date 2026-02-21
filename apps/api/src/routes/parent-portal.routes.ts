import { FastifyInstance } from 'fastify';
import { parentAuth } from '../middleware/auth.middleware.js';

export async function parentPortalRoutes(server: FastifyInstance) {
  // All routes require parent authentication
  server.addHook('preHandler', parentAuth);

  // GET /me — parent profile + children list
  server.get('/me', async (request, reply) => {
    const { id } = request.user;

    const parent = await server.prisma.parent.findUnique({
      where: { id },
      select: {
        id: true, email: true,
        nameAz: true, nameRu: true, nameEn: true,
        phone: true, avatar: true, createdAt: true, lastLoginAt: true,
        children: {
          include: {
            student: {
              select: {
                id: true, name: true, email: true, photo: true,
                courses: {
                  where: { status: 'ACTIVE' },
                  select: {
                    course: {
                      select: { id: true, titleAz: true, titleRu: true, titleEn: true, image: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return reply.status(404).send({ success: false, message: 'Parent not found' });
    }

    return reply.send({ success: true, data: parent });
  });

  // GET /children — children with courses and overall progress
  server.get('/children', async (request, reply) => {
    const { id } = request.user;

    const links = await server.prisma.studentParent.findMany({
      where: { parentId: id },
      include: {
        student: {
          select: {
            id: true, name: true, email: true, photo: true, lastLoginAt: true,
            courses: {
              include: {
                course: {
                  select: { id: true, titleAz: true, titleRu: true, titleEn: true, image: true, level: true },
                },
              },
            },
            courseProgress: true,
          },
        },
      },
    });

    const children = links.map((link) => {
      const student = link.student;
      const activeCourses = student.courses.filter((c) => c.status === 'ACTIVE');
      const progressMap = new Map(student.courseProgress.map((p) => [p.courseId, p.percentage]));

      const overallProgress = activeCourses.length > 0
        ? Math.round(activeCourses.reduce((sum, c) => sum + (progressMap.get(c.courseId) || 0), 0) / activeCourses.length)
        : 0;

      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        photo: student.photo,
        lastLoginAt: student.lastLoginAt,
        relation: link.relation,
        activeCourses: activeCourses.length,
        overallProgress,
        courses: activeCourses.map((c) => ({
          ...c.course,
          status: c.status,
          progress: progressMap.get(c.courseId) || 0,
        })),
      };
    });

    return reply.send({ success: true, data: children });
  });

  // GET /children/:studentId/courses — child's courses with detailed progress
  server.get('/children/:studentId/courses', async (request, reply) => {
    const { id } = request.user;
    const { studentId } = request.params as { studentId: string };

    // Verify parent-child relationship
    const link = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });
    if (!link) {
      return reply.status(403).send({ success: false, message: 'Access denied' });
    }

    const enrollments = await server.prisma.studentCourse.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true, titleAz: true, titleRu: true, titleEn: true,
            image: true, level: true, duration: true,
            category: { select: { nameAz: true, nameRu: true, nameEn: true } },
            _count: { select: { lessons: { where: { isPublished: true } } } },
          },
        },
      },
    });

    const courseIds = enrollments.map((e) => e.courseId);
    const progressList = await server.prisma.courseProgress.findMany({
      where: { studentId, courseId: { in: courseIds } },
    });
    const progressMap = new Map(progressList.map((p) => [p.courseId, p]));

    const data = enrollments.map((e) => ({
      ...e,
      progress: progressMap.get(e.courseId) || { percentage: 0, lastAccessedAt: null },
    }));

    return reply.send({ success: true, data });
  });

  // GET /children/:studentId/courses/:courseId — detailed course progress
  server.get('/children/:studentId/courses/:courseId', async (request, reply) => {
    const { id } = request.user;
    const { studentId, courseId } = request.params as { studentId: string; courseId: string };

    // Verify parent-child relationship
    const link = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });
    if (!link) {
      return reply.status(403).send({ success: false, message: 'Access denied' });
    }

    const course = await server.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true, titleAz: true, titleRu: true, titleEn: true,
        image: true, level: true, duration: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: { id: true, titleAz: true, titleRu: true, titleEn: true, order: true },
        },
      },
    });

    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    // Get lesson progress
    const lessonIds = course.lessons.map((l) => l.id);
    const lessonProgress = await server.prisma.lessonProgress.findMany({
      where: { studentId, lessonId: { in: lessonIds } },
    });
    const progressMap = new Map(lessonProgress.map((p) => [p.lessonId, p]));

    // Course progress
    const courseProgress = await server.prisma.courseProgress.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    const lessonsWithProgress = course.lessons.map((l) => ({
      ...l,
      progress: progressMap.get(l.id) || { status: 'NOT_STARTED', completedAt: null, timeSpentSec: 0 },
    }));

    return reply.send({
      success: true,
      data: {
        ...course,
        lessons: lessonsWithProgress,
        courseProgress: courseProgress || { percentage: 0, lastAccessedAt: null },
      },
    });
  });

  // GET /children/:studentId/comments — teacher comments about the child
  server.get('/children/:studentId/comments', async (request, reply) => {
    const { id } = request.user;
    const { studentId } = request.params as { studentId: string };

    // Verify parent-child relationship
    const link = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });
    if (!link) {
      return reply.status(403).send({ success: false, message: 'Access denied' });
    }

    const comments = await server.prisma.teacherComment.findMany({
      where: { studentId },
      include: {
        teacher: { select: { nameAz: true, nameRu: true, nameEn: true, photo: true } },
        course: { select: { titleAz: true, titleRu: true, titleEn: true } },
        lesson: { select: { titleAz: true, titleRu: true, titleEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ success: true, data: comments });
  });

  // GET /children/:studentId/grades — child's grades
  server.get('/children/:studentId/grades', async (request, reply) => {
    const { id } = request.user;
    const { studentId } = request.params as { studentId: string };

    // Verify parent-child relationship
    const link = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });
    if (!link) {
      return reply.status(403).send({ success: false, message: 'Access denied' });
    }

    const { courseId } = request.query as { courseId?: string };
    const where: any = { studentId };
    if (courseId) where.courseId = courseId;

    const data = await server.prisma.grade.findMany({
      where,
      include: {
        course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
        lesson: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average
    const avg = data.length > 0
      ? Math.round((data.reduce((sum, g) => sum + (g.value / g.maxValue) * 100, 0) / data.length) * 10) / 10
      : 0;

    return reply.send({ success: true, data, average: avg });
  });

  // GET /children/:studentId/attendance — attendance records
  server.get('/children/:studentId/attendance', async (request, reply) => {
    const { id } = request.user;
    const { studentId } = request.params as { studentId: string };

    // Verify parent-child relationship
    const link = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });
    if (!link) {
      return reply.status(403).send({ success: false, message: 'Access denied' });
    }

    const { courseId, from, to } = request.query as { courseId?: string; from?: string; to?: string };

    const where: any = { studentId };
    if (courseId) where.courseId = courseId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const attendance = await server.prisma.attendance.findMany({
      where,
      include: {
        course: { select: { titleAz: true, titleRu: true, titleEn: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Summary
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'PRESENT').length;
    const absent = attendance.filter((a) => a.status === 'ABSENT').length;
    const late = attendance.filter((a) => a.status === 'LATE').length;
    const excused = attendance.filter((a) => a.status === 'EXCUSED').length;

    return reply.send({
      success: true,
      data: {
        records: attendance,
        summary: { total, present, absent, late, excused, rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0 },
      },
    });
  });
}
