import { FastifyInstance, FastifyRequest } from 'fastify';
import { Level, Audience, AgeGroup } from '@prisma/client';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function courseRoutes(server: FastifyInstance) {
  // GET /list - Simple list for dropdowns (admin auth)
  server.get('/list', { preHandler: [adminAuth] }, async (request, reply) => {
    const courses = await server.prisma.course.findMany({
      select: { id: true, titleAz: true, titleRu: true, titleEn: true },
      orderBy: { titleEn: 'asc' },
    });
    const data = courses.map((c: any) => ({ id: c.id, name: c.titleEn || c.titleAz }));
    return reply.send({ success: true, data });
  });

  // GET / - List courses (public: active only; admin with auth: all)
  server.get('/', async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      categoryId,
      level,
      search,
      featured,
      audience,
      ageGroup,
    } = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      level?: string;
      search?: string;
      featured?: string;
      audience?: string;
      ageGroup?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // If authenticated admin, show all courses; otherwise only active
    let isAdmin = false;
    try {
      if (request.headers.authorization?.startsWith('Bearer ')) {
        await request.jwtVerify();
        isAdmin = request.user?.role === 'ADMIN' || request.user?.type === 'admin';
      }
    } catch { /* not authenticated or invalid token — show only active */ }
    const where: any = isAdmin ? {} : { isActive: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (level) {
      where.level = level;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (audience && (audience === 'KIDS' || audience === 'ADULTS')) {
      where.audience = audience;
    }

    if (ageGroup && ['AGE_6_8', 'AGE_9_11', 'AGE_12_14', 'AGE_15_17'].includes(ageGroup)) {
      where.ageGroup = ageGroup;
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

  // GET /:slugOrId - Get course by slug OR by id (for admin edit page)
  server.get('/:slugOrId', async (request, reply) => {
    const { slugOrId } = request.params as { slugOrId: string };
    const isAdmin = !!(request.headers.authorization?.startsWith('Bearer '));

    const courseInclude: any = {
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
    };

    // Only include students data for admin requests (security)
    if (isAdmin) {
      courseInclude.students = {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      };
    }

    // Try by slug first, then by id
    let course = await server.prisma.course.findUnique({
      where: { slug: slugOrId },
      include: courseInclude,
    });

    if (!course) {
      // Fallback: try by id (for admin edit pages that use course.id)
      course = await server.prisma.course.findUnique({
        where: { id: slugOrId },
        include: courseInclude,
      });
    }

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
      audience?: string;
      ageGroup?: string;
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
        level: courseData.level ? (courseData.level as Level) : undefined,
        audience: courseData.audience ? (courseData.audience as Audience) : undefined,
        ageGroup: courseData.ageGroup ? (courseData.ageGroup as AgeGroup) : undefined,
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
      audience?: string;
      ageGroup?: string | null;
      categoryId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      order?: number;
      syllabus?: any;
      features?: any;
      teacherIds?: string[];
      studentIds?: string[];
    };

    const existing = await server.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    const { teacherIds, studentIds, ...courseData } = body;

    // If teacherIds are provided, replace the teacher associations
    if (teacherIds !== undefined) {
      await server.prisma.teacherCourse.deleteMany({ where: { courseId: id } });
      if (teacherIds.length > 0) {
        await server.prisma.teacherCourse.createMany({
          data: teacherIds.map((teacherId) => ({ teacherId, courseId: id })),
        });
      }
    }

    // If studentIds are provided, replace the student enrollments
    if (studentIds !== undefined) {
      await server.prisma.studentCourse.deleteMany({ where: { courseId: id } });
      if (studentIds.length > 0) {
        await server.prisma.studentCourse.createMany({
          data: studentIds.map((studentId) => ({ studentId, courseId: id, status: 'ACTIVE' as const })),
        });
      }
    }

    const course = await server.prisma.course.update({
      where: { id },
      data: {
        ...courseData,
        level: courseData.level ? (courseData.level as Level) : undefined,
        audience: courseData.audience ? (courseData.audience as Audience) : undefined,
        ageGroup: courseData.ageGroup === null ? null : courseData.ageGroup ? (courseData.ageGroup as AgeGroup) : undefined,
      },
      include: {
        category: true,
        teachers: {
          include: {
            teacher: true,
          },
        },
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
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
