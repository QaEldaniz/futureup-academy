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
                level: true,
                _count: { select: { students: true } },
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

  // GET /courses/:courseId - Course detail with students and progress
  server.get('/courses/:courseId', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };

    // Verify teacher has access to this course
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const course = await server.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true, titleAz: true, titleRu: true, titleEn: true,
        image: true, level: true, duration: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: { id: true, titleAz: true, titleRu: true, titleEn: true, order: true },
        },
      },
    });

    // Get enrolled students with progress
    const enrollments = await server.prisma.studentCourse.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true, photo: true } },
      },
    });

    const studentIds = enrollments.map((e) => e.student.id);
    const progressList = await server.prisma.courseProgress.findMany({
      where: { courseId, studentId: { in: studentIds } },
    });
    const progressMap = new Map(progressList.map((p) => [p.studentId, p.percentage]));

    const students = enrollments.map((e) => ({
      student: e.student,
      status: e.status,
      progress: progressMap.get(e.student.id) || 0,
    }));

    return reply.send({ success: true, data: { course, students } });
  });

  // GET /courses/:courseId/students/:studentId - Student detail in course
  server.get('/courses/:courseId/students/:studentId', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, studentId } = request.params as { courseId: string; studentId: string };

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const student = await server.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, photo: true },
    });

    if (!student) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    // Get lessons with progress
    const lessons = await server.prisma.lesson.findMany({
      where: { courseId, isPublished: true },
      orderBy: { order: 'asc' },
      select: { id: true, titleAz: true, titleRu: true, titleEn: true, order: true },
    });

    const lessonIds = lessons.map((l) => l.id);
    const lessonProgress = await server.prisma.lessonProgress.findMany({
      where: { studentId, lessonId: { in: lessonIds } },
    });
    const lpMap = new Map(lessonProgress.map((p) => [p.lessonId, p]));

    const lessonsWithProgress = lessons.map((l) => ({
      ...l,
      progress: lpMap.get(l.id) || null,
    }));

    // Course progress
    const courseProgress = await server.prisma.courseProgress.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    // Teacher comments
    const comments = await server.prisma.teacherComment.findMany({
      where: { studentId, courseId, teacherId: id },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      success: true,
      data: {
        student,
        lessons: lessonsWithProgress,
        progress: courseProgress?.percentage || 0,
        comments,
      },
    });
  });

  // POST /courses/:courseId/students/:studentId/comments - Add teacher comment
  server.post('/courses/:courseId/students/:studentId/comments', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, studentId } = request.params as { courseId: string; studentId: string };
    const { comment, type, lessonId } = request.body as { comment: string; type?: string; lessonId?: string };

    if (!comment) {
      return reply.status(400).send({ success: false, message: 'Comment is required' });
    }

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const newComment = await server.prisma.teacherComment.create({
      data: {
        teacherId: id,
        studentId,
        courseId,
        lessonId: lessonId || null,
        comment,
        type: (type as any) || 'PROGRESS',
      },
    });

    return reply.status(201).send({ success: true, data: newComment });
  });

  // ==========================================
  // ATTENDANCE ENDPOINTS
  // ==========================================

  // POST /courses/:courseId/attendance - Bulk upsert attendance for a date
  server.post('/courses/:courseId/attendance', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };
    const { date, records } = request.body as {
      date: string;
      records: { studentId: string; status: string; note?: string }[];
    };

    if (!date || !records || !Array.isArray(records)) {
      return reply.status(400).send({ success: false, message: 'date and records[] are required' });
    }

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = await Promise.all(
      records.map((r) =>
        server.prisma.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: r.studentId,
              courseId,
              date: attendanceDate,
            },
          },
          update: {
            status: r.status as any,
            note: r.note || null,
            teacherId: id,
          },
          create: {
            studentId: r.studentId,
            courseId,
            teacherId: id,
            date: attendanceDate,
            status: r.status as any,
            note: r.note || null,
          },
        })
      )
    );

    return reply.send({ success: true, data: results, count: results.length });
  });

  // GET /courses/:courseId/attendance - Get attendance records
  server.get('/courses/:courseId/attendance', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };
    const { date, studentId } = request.query as { date?: string; studentId?: string };

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const where: any = { courseId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }
    if (studentId) {
      where.studentId = studentId;
    }

    const data = await server.prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, photo: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { name: 'asc' } }],
    });

    return reply.send({ success: true, data });
  });

  // ==========================================
  // GRADES ENDPOINTS
  // ==========================================

  // POST /courses/:courseId/grades - Create a grade
  server.post('/courses/:courseId/grades', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };
    const body = request.body as {
      studentId: string;
      value: number;
      maxValue?: number;
      type?: string;
      lessonId?: string;
      comment?: string;
    };

    if (!body.studentId || body.value === undefined) {
      return reply.status(400).send({ success: false, message: 'studentId and value are required' });
    }

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const grade = await server.prisma.grade.create({
      data: {
        studentId: body.studentId,
        courseId,
        teacherId: id,
        value: body.value,
        maxValue: body.maxValue || 100,
        type: (body.type as any) || 'ASSIGNMENT',
        lessonId: body.lessonId || null,
        comment: body.comment || null,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        lesson: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
      },
    });

    return reply.status(201).send({ success: true, data: grade });
  });

  // GET /courses/:courseId/grades - Get all grades for a course
  server.get('/courses/:courseId/grades', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };
    const { studentId, type } = request.query as { studentId?: string; type?: string };

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const where: any = { courseId };
    if (studentId) where.studentId = studentId;
    if (type) where.type = type;

    const data = await server.prisma.grade.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, photo: true } },
        lesson: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ success: true, data });
  });

  // PUT /courses/:courseId/grades/:gradeId - Update a grade
  server.put('/courses/:courseId/grades/:gradeId', { preHandler: [teacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, gradeId } = request.params as { courseId: string; gradeId: string };
    const body = request.body as {
      value?: number;
      maxValue?: number;
      type?: string;
      comment?: string;
    };

    // Verify teacher access
    const tc = await server.prisma.teacherCourse.findUnique({
      where: { teacherId_courseId: { teacherId: id, courseId } },
    });
    if (!tc) {
      return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    // Verify grade exists and belongs to this teacher
    const existing = await server.prisma.grade.findUnique({ where: { id: gradeId } });
    if (!existing || existing.courseId !== courseId) {
      return reply.status(404).send({ success: false, message: 'Grade not found' });
    }
    if (existing.teacherId !== id) {
      return reply.status(403).send({ success: false, message: 'You can only update your own grades' });
    }

    const updateData: any = {};
    if (body.value !== undefined) updateData.value = body.value;
    if (body.maxValue !== undefined) updateData.maxValue = body.maxValue;
    if (body.type) updateData.type = body.type;
    if (body.comment !== undefined) updateData.comment = body.comment;

    const grade = await server.prisma.grade.update({
      where: { id: gradeId },
      data: updateData,
      include: {
        student: { select: { id: true, name: true, email: true } },
        lesson: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
      },
    });

    return reply.send({ success: true, data: grade });
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
