import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function courseRoutes(server: FastifyInstance) {
  // GET / - List active courses (public, with filters and pagination)
  server.get('/', async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      categoryId,
      level,
      search,
      featured,
    } = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      level?: string;
      search?: string;
      featured?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (level) {
      where.level = level;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { titleAz: { contains: search, mode: 'insensitive' } },
        { titleRu: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.course.findMany({
        where,
        include: {
          category: true,
          teachers: {
            include: {
              teacher: {
                select: {
                  id: true,
                  nameAz: true,
                  nameRu: true,
                  nameEn: true,
                  photo: true,
                  specialization: true,
                },
              },
            },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limitNum,
      }),
      server.prisma.course.count({ where }),
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

  // GET /:slug - Get course by slug
  server.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const course = await server.prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                nameAz: true,
                nameRu: true,
                nameEn: true,
                photo: true,
                specialization: true,
                bioAz: true,
                bioRu: true,
                bioEn: true,
                linkedin: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    return reply.send({ success: true, data: course });
  });

  // POST / - Create course (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      slug: string;
      titleAz: string;
      titleRu: string;
      titleEn: string;
      descAz: string;
      descRu: string;
      descEn: string;
      shortDescAz?: string;
      shortDescRu?: string;
      shortDescEn?: string;
      image?: string;
      duration: string;
      price?: number;
      level?: string;
      categoryId: string;
      isActive?: boolean;
      isFeatured?: boolean;
      order?: number;
      syllabus?: any;
      features?: any;
      teacherIds?: string[];
    };

    const { teacherIds, ...courseData } = body;

    const course = await server.prisma.course.create({
      data: {
        ...courseData,
        price: courseData.price != null ? courseData.price : undefined,
        teachers: teacherIds?.length
          ? {
              create: teacherIds.map((teacherId) => ({ teacherId })),
            }
          : undefined,
      },
      include: {
        category: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });

    return reply.status(201).send({ success: true, data: course });
  });

  // PUT /:id - Update course (admin auth)
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
      shortDescAz?: string;
      shortDescRu?: string;
      shortDescEn?: string;
      image?: string;
      duration?: string;
      price?: number;
      level?: string;
      categoryId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      order?: number;
      syllabus?: any;
      features?: any;
      teacherIds?: string[];
    };

    const existing = await server.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    const { teacherIds, ...courseData } = body;

    // If teacherIds are provided, replace the teacher associations
    if (teacherIds !== undefined) {
      await server.prisma.teacherCourse.deleteMany({ where: { courseId: id } });
      if (teacherIds.length > 0) {
        await server.prisma.teacherCourse.createMany({
          data: teacherIds.map((teacherId) => ({ teacherId, courseId: id })),
        });
      }
    }

    const course = await server.prisma.course.update({
      where: { id },
      data: courseData,
      include: {
        category: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
    });

    return reply.send({ success: true, data: course });
  });

  // DELETE /:id - Delete course (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    await server.prisma.course.delete({ where: { id } });

    return reply.send({ success: true, message: 'Course deleted successfully' });
  });
}
