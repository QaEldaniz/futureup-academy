import { FastifyInstance } from 'fastify';
import { CorporateServiceType, CorporateInqStatus } from '@prisma/client';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function corporateServiceRoutes(server: FastifyInstance) {
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  // GET / - List active corporate services (public, with pagination and type filter)
  server.get('/', async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      type,
    } = request.query as {
      page?: string;
      limit?: string;
      type?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      server.prisma.corporateService.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      server.prisma.corporateService.count({ where }),
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

  // GET /:slug - Get corporate service by slug (public)
  server.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const service = await server.prisma.corporateService.findUnique({
      where: { slug },
    });

    if (!service) {
      return reply.status(404).send({ success: false, message: 'Corporate service not found' });
    }

    return reply.send({ success: true, data: service });
  });

  // POST / - Create corporate service (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      slug: string;
      type: string;
      titleAz: string;
      titleRu: string;
      titleEn: string;
      descAz: string;
      descRu: string;
      descEn: string;
      shortDescAz?: string;
      shortDescRu?: string;
      shortDescEn?: string;
      icon?: string;
      image?: string;
      features?: any;
      isActive?: boolean;
      order?: number;
    };

    const service = await server.prisma.corporateService.create({
      data: {
        ...body,
        type: body.type as CorporateServiceType,
      },
    });

    return reply.status(201).send({ success: true, data: service });
  });

  // PUT /:id - Update corporate service (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      slug?: string;
      type?: string;
      titleAz?: string;
      titleRu?: string;
      titleEn?: string;
      descAz?: string;
      descRu?: string;
      descEn?: string;
      shortDescAz?: string;
      shortDescRu?: string;
      shortDescEn?: string;
      icon?: string;
      image?: string;
      features?: any;
      isActive?: boolean;
      order?: number;
    };

    const existing = await server.prisma.corporateService.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Corporate service not found' });
    }

    const service = await server.prisma.corporateService.update({
      where: { id },
      data: {
        ...body,
        type: body.type ? (body.type as CorporateServiceType) : undefined,
      },
    });

    return reply.send({ success: true, data: service });
  });

  // DELETE /:id - Delete corporate service (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.corporateService.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Corporate service not found' });
    }

    await server.prisma.corporateService.delete({ where: { id } });

    return reply.send({ success: true, message: 'Corporate service deleted successfully' });
  });
}

// ==========================================
// CORPORATE INQUIRIES
// ==========================================

export async function corporateInquiryRoutes(server: FastifyInstance) {
  // POST / - PUBLIC - Submit corporate inquiry
  server.post('/', async (request, reply) => {
    const body = request.body as {
      companyName: string;
      contactName: string;
      email: string;
      phone: string;
      message?: string;
      serviceId?: string;
      employeeCount?: string;
      budget?: string;
    };

    if (!body.companyName || !body.contactName || !body.email || !body.phone) {
      return reply.status(400).send({
        success: false,
        message: 'Company name, contact name, email, and phone are required',
      });
    }

    // Validate service exists if serviceId provided
    if (body.serviceId) {
      const service = await server.prisma.corporateService.findUnique({
        where: { id: body.serviceId },
      });
      if (!service) {
        return reply.status(400).send({ success: false, message: 'Invalid service ID' });
      }
    }

    const inquiry = await server.prisma.corporateInquiry.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        message: body.message || null,
        serviceId: body.serviceId || null,
        employeeCount: body.employeeCount || null,
        budget: body.budget || null,
      },
      include: {
        service: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true, type: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: inquiry });
  });

  // GET / - List corporate inquiries with filters (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      status,
      search,
      serviceId,
    } = request.query as {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
      serviceId?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.corporateInquiry.findMany({
        where,
        include: {
          service: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true, type: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.corporateInquiry.count({ where }),
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

  // PUT /:id - Update corporate inquiry status & notes (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: string;
      notes?: string;
    };

    const existing = await server.prisma.corporateInquiry.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Corporate inquiry not found' });
    }

    const inquiry = await server.prisma.corporateInquiry.update({
      where: { id },
      data: {
        ...body,
        status: body.status ? (body.status as CorporateInqStatus) : undefined,
      },
      include: {
        service: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true, type: true },
        },
      },
    });

    return reply.send({ success: true, data: inquiry });
  });
}
