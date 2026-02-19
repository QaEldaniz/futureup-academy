import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function reviewRoutes(server: FastifyInstance) {
  // GET /course/:id - PUBLIC - Get approved reviews for a course
  server.get('/course/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const reviews = await server.prisma.review.findMany({
      where: {
        aboutCourseId: id,
        status: 'APPROVED',
        isPublic: true,
      },
      include: {
        studentAuthor: {
          select: { id: true, name: true, photo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ success: true, data: reviews });
  });

  // GET /teacher/:id - PUBLIC - Get approved reviews for a teacher
  server.get('/teacher/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const reviews = await server.prisma.review.findMany({
      where: {
        aboutTeacherId: id,
        status: 'APPROVED',
        isPublic: true,
      },
      include: {
        studentAuthor: {
          select: { id: true, name: true, photo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ success: true, data: reviews });
  });

  // POST / - PUBLIC - Student submits review (goes to PENDING)
  server.post('/', async (request, reply) => {
    const body = request.body as {
      type: string;
      text: string;
      rating?: number;
      studentAuthorId: string;
      aboutCourseId?: string;
      aboutTeacherId?: string;
    };

    if (!body.text || !body.studentAuthorId || !body.type) {
      return reply.status(400).send({
        success: false,
        message: 'Type, text, and studentAuthorId are required',
      });
    }

    // Validate student exists
    const student = await server.prisma.student.findUnique({
      where: { id: body.studentAuthorId },
    });
    if (!student) {
      return reply.status(400).send({ success: false, message: 'Invalid student ID' });
    }

    const review = await server.prisma.review.create({
      data: {
        type: body.type as any,
        text: body.text,
        rating: body.rating ?? 5,
        studentAuthorId: body.studentAuthorId,
        aboutCourseId: body.aboutCourseId || null,
        aboutTeacherId: body.aboutTeacherId || null,
        status: 'PENDING',
      },
      include: {
        studentAuthor: {
          select: { id: true, name: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: review });
  });

  // GET / - List all reviews with status filter (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      status,
      type,
      search,
    } = request.query as {
      page?: string;
      limit?: string;
      status?: string;
      type?: string;
      search?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { text: { contains: search, mode: 'insensitive' } },
        { studentAuthor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.review.findMany({
        where,
        include: {
          studentAuthor: {
            select: { id: true, name: true, email: true, photo: true },
          },
          teacherAuthor: {
            select: { id: true, nameAz: true, nameRu: true, nameEn: true, photo: true },
          },
          aboutCourse: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
          aboutTeacher: {
            select: { id: true, nameAz: true, nameRu: true, nameEn: true },
          },
          aboutStudent: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.review.count({ where }),
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

  // PUT /:id/approve - Approve review (admin auth)
  server.put('/:id/approve', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Review not found' });
    }

    const review = await server.prisma.review.update({
      where: { id },
      data: {
        status: 'APPROVED',
        moderatedBy: request.user.id,
        moderatedAt: new Date(),
      },
    });

    return reply.send({ success: true, data: review });
  });

  // PUT /:id/reject - Reject review with reason (admin auth)
  server.put('/:id/reject', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { adminNote?: string };

    const existing = await server.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Review not found' });
    }

    const review = await server.prisma.review.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote: body.adminNote || null,
        moderatedBy: request.user.id,
        moderatedAt: new Date(),
      },
    });

    return reply.send({ success: true, data: review });
  });

  // DELETE /:id - Delete review (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Review not found' });
    }

    await server.prisma.review.delete({ where: { id } });

    return reply.send({ success: true, message: 'Review deleted successfully' });
  });
}
