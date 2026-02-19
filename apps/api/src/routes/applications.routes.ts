import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function applicationRoutes(server: FastifyInstance) {
  // POST / - PUBLIC - Submit application
  server.post('/', async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
      phone: string;
      courseId?: string;
      message?: string;
    };

    if (!body.name || !body.email || !body.phone) {
      return reply.status(400).send({
        success: false,
        message: 'Name, email, and phone are required',
      });
    }

    // Validate course exists if courseId provided
    if (body.courseId) {
      const course = await server.prisma.course.findUnique({
        where: { id: body.courseId },
      });
      if (!course) {
        return reply.status(400).send({ success: false, message: 'Invalid course ID' });
      }
    }

    const application = await server.prisma.application.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        courseId: body.courseId || null,
        message: body.message || null,
      },
      include: {
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: application });
  });

  // GET / - List applications with filter by status, pagination (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      status,
      search,
      courseId,
    } = request.query as {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
      courseId?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.application.findMany({
        where,
        include: {
          course: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.application.count({ where }),
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

  // PUT /:id - Update application status & notes (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: string;
      notes?: string;
    };

    const existing = await server.prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Application not found' });
    }

    const application = await server.prisma.application.update({
      where: { id },
      data: body,
      include: {
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
      },
    });

    return reply.send({ success: true, data: application });
  });
}
