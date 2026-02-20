import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function parentRoutes(server: FastifyInstance) {
  // All routes require admin authentication
  server.addHook('preHandler', adminAuth);

  // GET / — list all parents
  server.get('/', async (request, reply) => {
    const { search, page = '1', limit = '20' } = request.query as {
      search?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { nameAz: { contains: search, mode: 'insensitive' } },
        { nameRu: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [parents, total] = await Promise.all([
      server.prisma.parent.findMany({
        where,
        include: {
          children: {
            include: {
              student: { select: { id: true, name: true, email: true } },
            },
          },
          _count: { select: { children: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.parent.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: parents,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  });

  // GET /:id — get single parent
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const parent = await server.prisma.parent.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            student: {
              select: {
                id: true, name: true, email: true, photo: true,
                courses: {
                  include: {
                    course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
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

  // POST / — create parent
  server.post('/', async (request, reply) => {
    const body = request.body as {
      nameAz: string;
      nameRu: string;
      nameEn: string;
      email: string;
      password: string;
      phone?: string;
      childrenIds?: { studentId: string; relation?: string }[];
    };

    if (!body.nameAz || !body.email || !body.password) {
      return reply.status(400).send({ success: false, message: 'Name, email and password are required' });
    }

    const emailLower = body.email.toLowerCase().trim();

    // Check uniqueness
    const existing = await server.prisma.parent.findUnique({ where: { email: emailLower } });
    if (existing) {
      return reply.status(409).send({ success: false, message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(body.password, 10);

    const parent = await server.prisma.parent.create({
      data: {
        nameAz: body.nameAz,
        nameRu: body.nameRu || body.nameAz,
        nameEn: body.nameEn || body.nameAz,
        email: emailLower,
        password: hashed,
        phone: body.phone,
        ...(body.childrenIds && body.childrenIds.length > 0
          ? {
              children: {
                create: body.childrenIds.map((c) => ({
                  studentId: c.studentId,
                  relation: (c.relation as any) || 'PARENT',
                })),
              },
            }
          : {}),
      },
      include: {
        children: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return reply.status(201).send({ success: true, data: parent });
  });

  // PUT /:id — update parent
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      nameAz?: string;
      nameRu?: string;
      nameEn?: string;
      email?: string;
      password?: string;
      phone?: string;
      isActive?: boolean;
    };

    const existing = await server.prisma.parent.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Parent not found' });
    }

    const data: any = {};
    if (body.nameAz !== undefined) data.nameAz = body.nameAz;
    if (body.nameRu !== undefined) data.nameRu = body.nameRu;
    if (body.nameEn !== undefined) data.nameEn = body.nameEn;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    if (body.email) {
      const emailLower = body.email.toLowerCase().trim();
      if (emailLower !== existing.email) {
        const emailExists = await server.prisma.parent.findUnique({ where: { email: emailLower } });
        if (emailExists) {
          return reply.status(409).send({ success: false, message: 'Email already exists' });
        }
        data.email = emailLower;
      }
    }

    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10);
    }

    const parent = await server.prisma.parent.update({
      where: { id },
      data,
      include: {
        children: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return reply.send({ success: true, data: parent });
  });

  // DELETE /:id — delete parent
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.parent.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Parent not found' });
    }

    await server.prisma.parent.delete({ where: { id } });

    return reply.send({ success: true, message: 'Parent deleted successfully' });
  });

  // POST /:id/link-child — link a child to parent
  server.post('/:id/link-child', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { studentId, relation } = request.body as { studentId: string; relation?: string };

    if (!studentId) {
      return reply.status(400).send({ success: false, message: 'studentId is required' });
    }

    // Verify parent exists
    const parent = await server.prisma.parent.findUnique({ where: { id } });
    if (!parent) {
      return reply.status(404).send({ success: false, message: 'Parent not found' });
    }

    // Verify student exists
    const student = await server.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    // Check if already linked
    const existingLink = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });
    if (existingLink) {
      return reply.status(409).send({ success: false, message: 'Child already linked to this parent' });
    }

    const link = await server.prisma.studentParent.create({
      data: {
        studentId,
        parentId: id,
        relation: (relation as any) || 'PARENT',
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
      },
    });

    return reply.status(201).send({ success: true, data: link });
  });

  // DELETE /:id/unlink-child/:studentId — unlink a child from parent
  server.delete('/:id/unlink-child/:studentId', async (request, reply) => {
    const { id, studentId } = request.params as { id: string; studentId: string };

    const link = await server.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId: id } },
    });

    if (!link) {
      return reply.status(404).send({ success: false, message: 'Link not found' });
    }

    await server.prisma.studentParent.delete({
      where: { id: link.id },
    });

    return reply.send({ success: true, message: 'Child unlinked successfully' });
  });
}
