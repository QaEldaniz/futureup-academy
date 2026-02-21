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
}
