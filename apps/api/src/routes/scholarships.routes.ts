import { FastifyInstance } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function scholarshipRoutes(server: FastifyInstance) {
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  // GET / - List active scholarships (public, with pagination)
  server.get('/', async (request, reply) => {
    const {
      page = '1',
      limit = '10',
    } = request.query as {
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    const [data, total] = await Promise.all([
      server.prisma.scholarship.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      server.prisma.scholarship.count({ where }),
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

  // GET /:slug - Get scholarship by slug (public)
  server.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const scholarship = await server.prisma.scholarship.findUnique({
      where: { slug },
    });

    if (!scholarship) {
      return reply.status(404).send({ success: false, message: 'Scholarship not found' });
    }

    return reply.send({ success: true, data: scholarship });
  });

  // POST / - Create scholarship (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      slug: string;
      titleAz: string;
      titleRu: string;
      titleEn: string;
      descAz: string;
      descRu: string;
      descEn: string;
      coverageAz?: string;
      coverageRu?: string;
      coverageEn?: string;
      eligibilityAz?: string;
      eligibilityRu?: string;
      eligibilityEn?: string;
      amount?: number;
      percentage?: number;
      deadline?: string;
      isActive?: boolean;
      order?: number;
      image?: string;
    };

    const scholarship = await server.prisma.scholarship.create({
      data: {
        ...body,
        amount: body.amount != null ? body.amount : undefined,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    });

    return reply.status(201).send({ success: true, data: scholarship });
  });

  // PUT /:id - Update scholarship (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      slug?: string;
      titleAz?: string;
      titleRu?: string;
      titleEn?: string;
      descAz?: string;
      descRu?: string;
      descEn?: string;
      coverageAz?: string;
      coverageRu?: string;
      coverageEn?: string;
      eligibilityAz?: string;
      eligibilityRu?: string;
      eligibilityEn?: string;
      amount?: number;
      percentage?: number;
      deadline?: string;
      isActive?: boolean;
      order?: number;
      image?: string;
    };

    const existing = await server.prisma.scholarship.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Scholarship not found' });
    }

    const updateData: any = { ...body };
    if (body.deadline) {
      updateData.deadline = new Date(body.deadline);
    }

    const scholarship = await server.prisma.scholarship.update({
      where: { id },
      data: updateData,
    });

    return reply.send({ success: true, data: scholarship });
  });

  // DELETE /:id - Delete scholarship (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.scholarship.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Scholarship not found' });
    }

    await server.prisma.scholarship.delete({ where: { id } });

    return reply.send({ success: true, message: 'Scholarship deleted successfully' });
  });
}

// ==========================================
// SCHOLARSHIP APPLICATIONS
// ==========================================

export async function scholarshipApplicationRoutes(server: FastifyInstance) {
  // POST / - PUBLIC - Submit scholarship application
  server.post('/', async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
      phone: string;
      scholarshipId: string;
      motivation?: string;
      resume?: string;
    };

    if (!body.name || !body.email || !body.phone || !body.scholarshipId) {
      return reply.status(400).send({
        success: false,
        message: 'Name, email, phone, and scholarshipId are required',
      });
    }

    // Validate scholarship exists and is active
    const scholarship = await server.prisma.scholarship.findUnique({
      where: { id: body.scholarshipId },
    });
    if (!scholarship) {
      return reply.status(400).send({ success: false, message: 'Invalid scholarship ID' });
    }
    if (!scholarship.isActive) {
      return reply.status(400).send({ success: false, message: 'This scholarship is no longer accepting applications' });
    }

    // Check deadline
    if (scholarship.deadline && new Date(scholarship.deadline) < new Date()) {
      return reply.status(400).send({ success: false, message: 'The deadline for this scholarship has passed' });
    }

    const application = await server.prisma.scholarshipApplication.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        scholarshipId: body.scholarshipId,
        motivation: body.motivation || null,
        resume: body.resume || null,
      },
      include: {
        scholarship: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: application });
  });

  // GET / - List scholarship applications with filters (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      status,
      search,
      scholarshipId,
    } = request.query as {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
      scholarshipId?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (scholarshipId) {
      where.scholarshipId = scholarshipId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.scholarshipApplication.findMany({
        where,
        include: {
          scholarship: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.scholarshipApplication.count({ where }),
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

  // PUT /:id - Update scholarship application status & notes (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: string;
      notes?: string;
    };

    const existing = await server.prisma.scholarshipApplication.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Scholarship application not found' });
    }

    const application = await server.prisma.scholarshipApplication.update({
      where: { id },
      data: body,
      include: {
        scholarship: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
      },
    });

    return reply.send({ success: true, data: application });
  });
}
