import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function certificateRoutes(server: FastifyInstance) {
  // GET /verify/:code - PUBLIC - Get certificate by uniqueCode (QR verification)
  server.get('/verify/:code', async (request, reply) => {
    const { code } = request.params as { code: string };

    const certificate = await server.prisma.certificate.findUnique({
      where: { uniqueCode: code },
      include: {
        student: {
          select: { id: true, name: true, photo: true },
        },
        course: {
          select: {
            id: true,
            slug: true,
            titleAz: true,
            titleRu: true,
            titleEn: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nameAz: true,
            nameRu: true,
            nameEn: true,
            photo: true,
          },
        },
      },
    });

    if (!certificate) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    return reply.send({ success: true, data: certificate });
  });

  // GET / - List all certificates (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      search,
      courseId,
      status,
    } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      courseId?: string;
      status?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { uniqueCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.certificate.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          course: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
          teacher: {
            select: { id: true, nameAz: true, nameRu: true, nameEn: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.certificate.count({ where }),
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

  // POST / - Create certificate (admin auth) - stub PDF/QR generation
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      studentId: string;
      courseId: string;
      teacherId: string;
      issueDate?: string;
      teacherReview?: string;
      grade?: string;
    };

    // TODO: Generate PDF and QR code
    const pdfUrl = null;
    const qrCodeUrl = null;

    const certificate = await server.prisma.certificate.create({
      data: {
        studentId: body.studentId,
        courseId: body.courseId,
        teacherId: body.teacherId,
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        teacherReview: body.teacherReview,
        grade: body.grade,
        pdfUrl,
        qrCodeUrl,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: certificate });
  });

  // POST /bulk - Bulk generate certificates for a group (admin auth)
  server.post('/bulk', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      groupId: string;
      courseId: string;
      teacherId: string;
      grade?: string;
      teacherReview?: string;
    };

    // Get all students in the group
    const students = await server.prisma.student.findMany({
      where: { groupId: body.groupId },
    });

    if (students.length === 0) {
      return reply.status(400).send({ success: false, message: 'No students found in this group' });
    }

    // TODO: Generate PDF and QR code for each certificate
    const certificates = await server.prisma.certificate.createMany({
      data: students.map((student) => ({
        studentId: student.id,
        courseId: body.courseId,
        teacherId: body.teacherId,
        grade: body.grade,
        teacherReview: body.teacherReview,
        pdfUrl: null,
        qrCodeUrl: null,
      })),
    });

    return reply.status(201).send({
      success: true,
      data: {
        count: certificates.count,
        message: `${certificates.count} certificates created successfully`,
      },
    });
  });

  // PUT /:id - Update certificate (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      teacherReview?: string;
      grade?: string;
      status?: string;
      pdfUrl?: string;
      qrCodeUrl?: string;
    };

    const existing = await server.prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    const certificate = await server.prisma.certificate.update({
      where: { id },
      data: body,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
    });

    return reply.send({ success: true, data: certificate });
  });

  // DELETE /:id - Delete certificate (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    await server.prisma.certificate.delete({ where: { id } });

    return reply.send({ success: true, message: 'Certificate deleted successfully' });
  });
}
