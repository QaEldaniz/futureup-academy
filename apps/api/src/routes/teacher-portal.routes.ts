import { FastifyInstance, FastifyRequest } from 'fastify';
import { teacherAuth } from '../middleware/auth.middleware.js';

export async function teacherPortalRoutes(server: FastifyInstance) {
  // GET /me - Get teacher profile (teacher auth)
  server.get('/me', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;

    const teacher = await server.prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
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

  // GET /students - Get teacher's students (from their courses) (teacher auth)
  server.get('/students', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const {
      page = '1',
      limit = '10',
      search,
      courseId,
    } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      courseId?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Get courses this teacher teaches
    const teacherCourses = await server.prisma.teacherCourse.findMany({
      where: { teacherId: id },
      select: { courseId: true },
    });

    const teacherCourseIds = teacherCourses.map((tc) => tc.courseId);

    if (teacherCourseIds.length === 0) {
      return reply.send({
        success: true,
        data: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
      });
    }

    const where: any = {
      courses: {
        some: {
          courseId: courseId
            ? { in: teacherCourseIds.includes(courseId) ? [courseId] : [] }
            : { in: teacherCourseIds },
        },
      },
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.student.findMany({
        where,
        include: {
          courses: {
            where: { courseId: { in: teacherCourseIds } },
            include: {
              course: {
                select: {
                  id: true,
                  titleAz: true,
                  titleRu: true,
                  titleEn: true,
                },
              },
            },
          },
          group: true,
        },
        orderBy: { name: 'asc' },
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

  // GET /courses - Get teacher's courses (teacher auth)
  server.get('/courses', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;

    const teacherCourses = await server.prisma.teacherCourse.findMany({
      where: { teacherId: id },
      include: {
        course: {
          include: {
            category: true,
            _count: {
              select: {
                students: true,
                certificates: true,
              },
            },
          },
        },
      },
    });

    const courses = teacherCourses.map((tc) => tc.course);

    return reply.send({ success: true, data: courses });
  });

  // GET /reviews - Get teacher's reviews about students (teacher auth)
  server.get('/reviews', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const {
      page = '1',
      limit = '10',
      status,
    } = request.query as {
      page?: string;
      limit?: string;
      status?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      teacherAuthorId: id,
      type: 'TEACHER_ABOUT_STUDENT',
    };

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      server.prisma.review.findMany({
        where,
        include: {
          aboutStudent: {
            select: { id: true, name: true, email: true, photo: true },
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

  // POST /reviews - Write review about student (teacher auth) - goes to PENDING
  server.post('/reviews', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const body = request.body as {
      aboutStudentId: string;
      text: string;
      rating?: number;
    };

    if (!body.aboutStudentId || !body.text) {
      return reply.status(400).send({
        success: false,
        message: 'aboutStudentId and text are required',
      });
    }

    // Validate student exists
    const student = await server.prisma.student.findUnique({
      where: { id: body.aboutStudentId },
    });
    if (!student) {
      return reply.status(400).send({ success: false, message: 'Invalid student ID' });
    }

    // Verify the teacher teaches a course that the student is enrolled in
    const teacherCourses = await server.prisma.teacherCourse.findMany({
      where: { teacherId: id },
      select: { courseId: true },
    });
    const teacherCourseIds = teacherCourses.map((tc) => tc.courseId);

    const studentCourse = await server.prisma.studentCourse.findFirst({
      where: {
        studentId: body.aboutStudentId,
        courseId: { in: teacherCourseIds },
      },
    });

    if (!studentCourse) {
      return reply.status(403).send({
        success: false,
        message: 'You can only review students enrolled in your courses',
      });
    }

    const review = await server.prisma.review.create({
      data: {
        type: 'TEACHER_ABOUT_STUDENT',
        text: body.text,
        rating: body.rating ?? 5,
        teacherAuthorId: id,
        aboutStudentId: body.aboutStudentId,
        status: 'PENDING',
        isPublic: false,
      },
      include: {
        aboutStudent: {
          select: { id: true, name: true },
        },
      },
    });

    return reply.status(201).send({ success: true, data: review });
  });
}
