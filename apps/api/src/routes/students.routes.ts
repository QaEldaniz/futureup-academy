import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';
import bcrypt from 'bcrypt';

export async function studentRoutes(server: FastifyInstance) {
  // GET /list - Simple list for dropdowns (admin auth)
  server.get('/list', { preHandler: [adminAuth] }, async (request, reply) => {
    const students = await server.prisma.student.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return reply.send({ success: true, data: students });
  });

  // GET / - List students with pagination/search (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      search,
      groupId,
    } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      groupId?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (groupId) {
      where.groupId = groupId;
    }

    const [data, total] = await Promise.all([
      server.prisma.student.findMany({
        where,
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  slug: true,
                  titleAz: true,
                  titleRu: true,
                  titleEn: true,
                },
              },
            },
          },
          group: true,
          _count: {
            select: {
              certificates: true,
              reviewsReceived: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.student.count({ where }),
    ]);

    return reply.send({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  });

  // GET /:id - Get student details (admin auth)
  server.get('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const student = await server.prisma.student.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                slug: true,
                titleAz: true,
                titleRu: true,
                titleEn: true,
                image: true,
              },
            },
          },
        },
        certificates: {
          include: {
            course: {
              select: { id: true, titleAz: true, titleRu: true, titleEn: true },
            },
            teacher: {
              select: { id: true, nameAz: true, nameRu: true, nameEn: true },
            },
          },
        },
        reviewsReceived: {
          include: {
            teacherAuthor: {
              select: { id: true, nameAz: true, nameRu: true, nameEn: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        group: true,
      },
    });

    if (!student) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    return reply.send({ success: true, data: student });
  });

  // POST / - Create student (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
      phone?: string;
      photo?: string;
      groupId?: string;
      courseIds?: string[];
      password?: string;
    };

    const { courseIds, password, ...studentData } = body;

    const student = await server.prisma.student.create({
      data: {
        ...studentData,
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        courses: courseIds?.length
          ? {
              create: courseIds.map((courseId) => ({ courseId })),
            }
          : undefined,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        group: true,
      },
    });

    return reply.status(201).send({ success: true, data: student });
  });

  // PUT /:id - Update student (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      email?: string;
      phone?: string;
      photo?: string;
      groupId?: string;
      courseIds?: string[];
      password?: string;
    };

    const existing = await server.prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    const { courseIds, password, ...studentData } = body;
    if (password) {
      (studentData as any).password = await bcrypt.hash(password, 10);
    }

    // If courseIds are provided, replace course associations
    if (courseIds !== undefined) {
      await server.prisma.studentCourse.deleteMany({ where: { studentId: id } });
      if (courseIds.length > 0) {
        await server.prisma.studentCourse.createMany({
          data: courseIds.map((courseId) => ({ studentId: id, courseId })),
        });
      }
    }

    const student = await server.prisma.student.update({
      where: { id },
      data: studentData,
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        group: true,
      },
    });

    return reply.send({ success: true, data: student });
  });

  // DELETE /:id - Delete student (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    await server.prisma.student.delete({ where: { id } });

    return reply.send({ success: true, message: 'Student deleted successfully' });
  });
}
