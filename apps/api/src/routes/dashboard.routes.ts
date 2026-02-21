import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function dashboardRoutes(server: FastifyInstance) {
  // GET /public-stats - Public stats for the About page (no auth)
  server.get('/public-stats', async (_request, reply) => {
    const [totalCourses, totalStudents, totalTeachers, totalCertificates] = await Promise.all([
      server.prisma.course.count({ where: { isActive: true } }),
      server.prisma.student.count(),
      server.prisma.teacher.count({ where: { isActive: true } }),
      server.prisma.certificate.count(),
    ]);

    return reply.send({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalTeachers,
        totalCertificates,
      },
    });
  });

  // GET / - Get dashboard stats (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const [
      totalCourses,
      totalStudents,
      totalTeachers,
      totalApplications,
      pendingApplications,
      pendingReviews,
      totalCertificates,
      totalNews,
      recentApplications,
      recentReviews,
    ] = await Promise.all([
      server.prisma.course.count(),
      server.prisma.student.count(),
      server.prisma.teacher.count(),
      server.prisma.application.count(),
      server.prisma.application.count({ where: { status: 'NEW' } }),
      server.prisma.review.count({ where: { status: 'PENDING' } }),
      server.prisma.certificate.count(),
      server.prisma.news.count(),
      server.prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          course: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
        },
      }),
      server.prisma.review.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          studentAuthor: {
            select: { id: true, name: true },
          },
          aboutCourse: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
          aboutTeacher: {
            select: { id: true, nameAz: true, nameRu: true, nameEn: true },
          },
        },
      }),
    ]);

    // Map recentApplications to include courseName for frontend
    const mappedApplications = recentApplications.map((app: any) => ({
      ...app,
      courseName: app.course?.titleEn || app.course?.titleAz || null,
    }));

    return reply.send({
      success: true,
      data: {
        stats: {
          totalCourses,
          totalStudents,
          totalTeachers,
          totalApplications,
          pendingApplications,
          pendingReviews,
          totalCertificates,
          totalNews,
        },
        recentApplications: mappedApplications,
        recentReviews,
      },
    });
  });

  // GET /enrollment-stats - New student enrollments per month (last 6 months) (admin auth)
  server.get('/enrollment-stats', { preHandler: [adminAuth] }, async (request, reply) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const enrollments = await server.prisma.studentCourse.findMany({
      where: { startDate: { gte: sixMonthsAgo } },
      select: { startDate: true },
      orderBy: { startDate: 'asc' },
    });

    // Group by month
    const byMonth = new Map<string, number>();
    for (const e of enrollments) {
      if (!e.startDate) continue;
      const month = `${e.startDate.getFullYear()}-${String(e.startDate.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(month, (byMonth.get(month) || 0) + 1);
    }

    const data = Array.from(byMonth.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    return reply.send({ success: true, data });
  });

  // ==========================================
  // ADMIN GRADE MANAGEMENT
  // ==========================================

  // GET /courses/:courseId/grades - Get all grades for a course
  server.get('/courses/:courseId/grades', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { studentId, type } = request.query as { studentId?: string; type?: string };

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

  // POST /courses/:courseId/grades - Create a grade
  server.post('/courses/:courseId/grades', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const body = request.body as {
      studentId: string;
      value: number;
      maxValue?: number;
      type?: string;
      lessonId?: string;
      comment?: string;
      teacherId?: string;
    };

    if (!body.studentId || body.value === undefined) {
      return reply.status(400).send({ success: false, message: 'studentId and value are required' });
    }

    const grade = await server.prisma.grade.create({
      data: {
        studentId: body.studentId,
        courseId,
        teacherId: body.teacherId || null,
        value: body.value,
        maxValue: body.maxValue || 100,
        type: (body.type as any) || 'ASSIGNMENT',
        lessonId: body.lessonId || null,
        comment: body.comment || null,
      } as any,
      include: {
        student: { select: { id: true, name: true, email: true } },
        lesson: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
      },
    });

    return reply.status(201).send({ success: true, data: grade });
  });

  // PUT /grades/:gradeId - Update a grade
  server.put('/grades/:gradeId', { preHandler: [adminAuth] }, async (request, reply) => {
    const { gradeId } = request.params as { gradeId: string };
    const body = request.body as {
      value?: number;
      maxValue?: number;
      type?: string;
      comment?: string;
    };

    const existing = await server.prisma.grade.findUnique({ where: { id: gradeId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Grade not found' });
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

  // DELETE /grades/:gradeId - Delete a grade
  server.delete('/grades/:gradeId', { preHandler: [adminAuth] }, async (request, reply) => {
    const { gradeId } = request.params as { gradeId: string };

    const existing = await server.prisma.grade.findUnique({ where: { id: gradeId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Grade not found' });
    }

    await server.prisma.grade.delete({ where: { id: gradeId } });

    return reply.send({ success: true, data: { id: gradeId } });
  });

  // ==========================================
  // ADMIN ATTENDANCE MANAGEMENT
  // ==========================================

  // GET /courses/:courseId/attendance - Get attendance records
  server.get('/courses/:courseId/attendance', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { date, studentId } = request.query as { date?: string; studentId?: string };

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

  // POST /courses/:courseId/attendance - Bulk upsert attendance for a date
  server.post('/courses/:courseId/attendance', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { date, records } = request.body as {
      date: string;
      records: { studentId: string; status: string; note?: string }[];
    };

    if (!date || !records || !Array.isArray(records)) {
      return reply.status(400).send({ success: false, message: 'date and records[] are required' });
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
            teacherId: null,
          },
          create: {
            studentId: r.studentId,
            courseId,
            teacherId: null,
            date: attendanceDate,
            status: r.status as any,
            note: r.note || null,
          },
        })
      )
    );

    return reply.send({ success: true, data: results, count: results.length });
  });

  // GET /courses/:courseId/students - Get enrolled students for a course
  server.get('/courses/:courseId/students', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };

    const enrollments = await server.prisma.studentCourse.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: {
        student: {
          select: { id: true, name: true, email: true, photo: true },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    const data = enrollments.map((e) => e.student);

    return reply.send({ success: true, data });
  });
}
