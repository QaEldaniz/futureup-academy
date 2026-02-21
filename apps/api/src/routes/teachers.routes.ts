import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function teacherRoutes(server: FastifyInstance) {
  // GET /list - Simple list for dropdowns (admin auth)
  server.get('/list', { preHandler: [adminAuth] }, async (request, reply) => {
    const teachers = await server.prisma.teacher.findMany({
      select: { id: true, nameAz: true, nameRu: true, nameEn: true },
      orderBy: { nameEn: 'asc' },
    });
    const data = teachers.map((t: any) => ({ id: t.id, name: t.nameEn || t.nameAz }));
    return reply.send({ success: true, data });
  });

  // GET / - List all teachers (used by both admin panel and public pages)
  server.get('/', async (request, reply) => {
    const teachers = await server.prisma.teacher.findMany({
      select: {
        id: true,
        nameAz: true,
        nameRu: true,
        nameEn: true,
        bioAz: true,
        bioRu: true,
        bioEn: true,
        photo: true,
        specialization: true,
        email: true,
        linkedin: true,
        github: true,
        website: true,
        isActive: true,
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
        _count: {
          select: { courses: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return reply.send({ success: true, data: teachers });
  });

  // GET /:id - Get teacher by ID (public)
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const teacher = await server.prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        nameAz: true,
        nameRu: true,
        nameEn: true,
        bioAz: true,
        bioRu: true,
        bioEn: true,
        photo: true,
        specialization: true,
        linkedin: true,
        github: true,
        website: true,
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
      },
    });

    if (!teacher) {
      return reply.status(404).send({ success: false, message: 'Teacher not found' });
    }

    return reply.send({ success: true, data: teacher });
  });

  // POST / - Create teacher (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      nameAz: string;
      nameRu: string;
      nameEn: string;
      bioAz?: string;
      bioRu?: string;
      bioEn?: string;
      photo?: string;
      specialization?: string;
      linkedin?: string;
      github?: string;
      website?: string;
      isActive?: boolean;
      order?: number;
      email?: string;
      password?: string;
      courseIds?: string[];
    };

    const { courseIds, password, ...teacherData } = body;

    // Hash password if provided (for teacher portal access)
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const teacher = await server.prisma.teacher.create({
      data: {
        ...teacherData,
        password: hashedPassword,
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
      },
    });

    // Exclude password from response
    const { password: _, ...teacherWithoutPassword } = teacher as any;

    return reply.status(201).send({ success: true, data: teacherWithoutPassword });
  });

  // PUT /:id - Update teacher (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      nameAz?: string;
      nameRu?: string;
      nameEn?: string;
      bioAz?: string;
      bioRu?: string;
      bioEn?: string;
      photo?: string;
      specialization?: string;
      linkedin?: string;
      github?: string;
      website?: string;
      isActive?: boolean;
      order?: number;
      email?: string;
      password?: string;
      courseIds?: string[];
    };

    const existing = await server.prisma.teacher.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Teacher not found' });
    }

    const { courseIds, password, ...teacherData } = body;

    // Hash password if a new one is provided
    let updateData: any = { ...teacherData };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // If courseIds are provided, replace course associations
    if (courseIds !== undefined) {
      await server.prisma.teacherCourse.deleteMany({ where: { teacherId: id } });
      if (courseIds.length > 0) {
        await server.prisma.teacherCourse.createMany({
          data: courseIds.map((courseId) => ({ teacherId: id, courseId })),
        });
      }
    }

    const teacher = await server.prisma.teacher.update({
      where: { id },
      data: updateData,
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    // Exclude password from response
    const { password: _, ...teacherWithoutPassword } = teacher as any;

    return reply.send({ success: true, data: teacherWithoutPassword });
  });

  // DELETE /:id - Delete teacher (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.teacher.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Teacher not found' });
    }

    await server.prisma.teacher.delete({ where: { id } });

    return reply.send({ success: true, message: 'Teacher deleted successfully' });
  });
}
