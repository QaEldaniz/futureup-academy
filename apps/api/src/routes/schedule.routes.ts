import { FastifyInstance } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function scheduleAdminRoutes(server: FastifyInstance) {
  // All routes require admin authentication
  server.addHook('preHandler', adminAuth);

  // GET / - List all schedules (with optional courseId filter)
  server.get('/', async (request, reply) => {
    const { courseId } = request.query as { courseId?: string };

    const where: any = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const schedules = await server.prisma.schedule.findMany({
      where,
      include: {
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return reply.send({ success: true, data: schedules });
  });

  // POST / - Create schedule
  server.post('/', async (request, reply) => {
    const body = request.body as {
      courseId: string;
      teacherId?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room?: string;
      isActive?: boolean;
    };

    const schedule = await server.prisma.schedule.create({
      data: body,
      include: {
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: schedule });
  });

  // PUT /:id - Update schedule
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      courseId?: string;
      teacherId?: string | null;
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      room?: string | null;
      isActive?: boolean;
    };

    const existing = await server.prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Schedule not found' });
    }

    const schedule = await server.prisma.schedule.update({
      where: { id },
      data: body,
      include: {
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
    });

    return reply.send({ success: true, data: schedule });
  });

  // DELETE /:id - Delete schedule
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.schedule.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Schedule not found' });
    }

    await server.prisma.schedule.delete({ where: { id } });

    return reply.send({ success: true, message: 'Schedule deleted successfully' });
  });
}

export async function schedulePublicRoutes(server: FastifyInstance) {
  // GET / - Get schedule (supports optional auth for personalized results)
  server.get('/', async (request, reply) => {
    let user: { id: string; type: string } | null = null;

    // Try to extract user from Bearer token (optional auth)
    if (request.headers.authorization?.startsWith('Bearer ')) {
      try {
        await request.jwtVerify();
        user = request.user as { id: string; type: string };
      } catch {
        // Token invalid or expired — treat as unauthenticated
      }
    }

    const include = {
      course: {
        select: { id: true, titleAz: true, titleRu: true, titleEn: true },
      },
      teacher: {
        select: { id: true, nameAz: true, nameRu: true, nameEn: true },
      },
    };

    const orderBy: any = [{ dayOfWeek: 'asc' }, { startTime: 'asc' }];

    // Student: return schedules for enrolled courses
    if (user?.type === 'student') {
      const enrollments = await server.prisma.studentCourse.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        select: { courseId: true },
      });

      const courseIds = enrollments.map((e) => e.courseId);

      const schedules = await server.prisma.schedule.findMany({
        where: { courseId: { in: courseIds }, isActive: true },
        include,
        orderBy,
      });

      return reply.send({ success: true, data: schedules });
    }

    // Teacher: return schedules for teacher's courses
    if (user?.type === 'teacher') {
      const teacherCourses = await server.prisma.teacherCourse.findMany({
        where: { teacherId: user.id },
        select: { courseId: true },
      });

      const courseIds = teacherCourses.map((tc) => tc.courseId);

      const schedules = await server.prisma.schedule.findMany({
        where: {
          OR: [
            { teacherId: user.id },
            { courseId: { in: courseIds } },
          ],
          isActive: true,
        },
        include,
        orderBy,
      });

      return reply.send({ success: true, data: schedules });
    }

    // Unauthenticated or admin: return all active schedules
    const schedules = await server.prisma.schedule.findMany({
      where: { isActive: true },
      include,
      orderBy,
    });

    return reply.send({ success: true, data: schedules });
  });
}
