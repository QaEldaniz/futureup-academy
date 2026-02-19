import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function dashboardRoutes(server: FastifyInstance) {
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
      recentApplications,
      recentReviews,
    ] = await Promise.all([
      server.prisma.course.count({ where: { isActive: true } }),
      server.prisma.student.count(),
      server.prisma.teacher.count({ where: { isActive: true } }),
      server.prisma.application.count(),
      server.prisma.application.count({ where: { status: 'NEW' } }),
      server.prisma.review.count({ where: { status: 'PENDING' } }),
      server.prisma.certificate.count(),
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
        },
        recentApplications,
        recentReviews,
      },
    });
  });
}
