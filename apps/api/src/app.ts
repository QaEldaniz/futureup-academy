import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';

// Import routes
import { authRoutes } from './routes/auth.routes.js';
import { courseRoutes } from './routes/courses.routes.js';
import { teacherRoutes } from './routes/teachers.routes.js';
import { categoryRoutes } from './routes/categories.routes.js';
import { studentRoutes } from './routes/students.routes.js';
import { certificateRoutes } from './routes/certificates.routes.js';
import { applicationRoutes } from './routes/applications.routes.js';
import { newsRoutes } from './routes/news.routes.js';
import { testimonialRoutes } from './routes/testimonials.routes.js';
import { partnerRoutes } from './routes/partners.routes.js';
import { reviewRoutes } from './routes/reviews.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { teacherPortalRoutes } from './routes/teacher-portal.routes.js';
import { scholarshipRoutes, scholarshipApplicationRoutes } from './routes/scholarships.routes.js';
import { corporateServiceRoutes, corporateInquiryRoutes } from './routes/corporate.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { lessonRoutes } from './routes/lessons.routes.js';
import { studentPortalRoutes } from './routes/student-portal.routes.js';
import { parentPortalRoutes } from './routes/parent-portal.routes.js';
import { parentRoutes } from './routes/parents.routes.js';
import { scheduleAdminRoutes, schedulePublicRoutes } from './routes/schedule.routes.js';
import { assignmentRoutes } from './routes/assignment.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { quizRoutes } from './routes/quiz.routes.js';
import { messageRoutes } from './routes/message.routes.js';
import { gamificationRoutes } from './routes/gamification.routes.js';
import { calendarRoutes } from './routes/calendar.routes.js';
import { aiTutorRoutes } from './routes/ai-tutor.routes.js';

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; role: string; type: 'admin' | 'teacher' | 'student' | 'parent' };
    user: { id: string; role: string; type: 'admin' | 'teacher' | 'student' | 'parent' };
  }
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Prisma
  const prisma = new PrismaClient();
  app.decorate('prisma', prisma);
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  // CORS — restrict to allowed origins
  const allowedOrigins = (process.env.CORS_ORIGINS || 'https://futureupacademy.az,http://localhost:3000').split(',').map(s => s.trim());
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
  });

  // JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || (() => { console.warn('WARNING: JWT_SECRET not set, using random secret. Set JWT_SECRET in .env for production!'); return require('crypto').randomBytes(32).toString('hex'); })(),
    sign: { expiresIn: '7d' },
  });

  // Rate Limit
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Multipart (file uploads)
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Health check
  app.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Public routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(courseRoutes, { prefix: '/api/courses' });
  await app.register(teacherRoutes, { prefix: '/api/teachers' });
  await app.register(categoryRoutes, { prefix: '/api/categories' });
  await app.register(newsRoutes, { prefix: '/api/news' });
  await app.register(testimonialRoutes, { prefix: '/api/testimonials' });
  await app.register(partnerRoutes, { prefix: '/api/partners' });
  await app.register(certificateRoutes, { prefix: '/api/certificates' });
  await app.register(applicationRoutes, { prefix: '/api/applications' });
  await app.register(reviewRoutes, { prefix: '/api/reviews' });
  await app.register(settingsRoutes, { prefix: '/api/settings' });
  await app.register(uploadRoutes, { prefix: '/api/upload' });
  await app.register(scholarshipRoutes, { prefix: '/api/scholarships' });
  await app.register(scholarshipApplicationRoutes, { prefix: '/api/scholarship-applications' });
  await app.register(corporateServiceRoutes, { prefix: '/api/corporate-services' });
  await app.register(corporateInquiryRoutes, { prefix: '/api/corporate-inquiries' });
  await app.register(chatRoutes, { prefix: '/api/chat' });
  await app.register(lessonRoutes, { prefix: '/api/lessons' });
  await app.register(schedulePublicRoutes, { prefix: '/api/schedule' });
  await app.register(assignmentRoutes, { prefix: '/api/assignments' });
  await app.register(notificationRoutes, { prefix: '/api/notifications' });
  await app.register(quizRoutes, { prefix: '/api/quizzes' });
  await app.register(messageRoutes, { prefix: '/api/messages' });
  await app.register(gamificationRoutes, { prefix: '/api/gamification' });
  await app.register(calendarRoutes, { prefix: '/api/calendar' });
  await app.register(aiTutorRoutes, { prefix: '/api/ai-tutor' });
  await app.register(dashboardRoutes, { prefix: '/api/admin/dashboard' });
  await app.register(teacherPortalRoutes, { prefix: '/api/teacher' });
  await app.register(studentPortalRoutes, { prefix: '/api/student' });
  await app.register(parentPortalRoutes, { prefix: '/api/parent' });

  // Admin routes (same handlers, /api/admin/* prefix for frontend admin panel)
  await app.register(courseRoutes, { prefix: '/api/admin/courses' });
  await app.register(teacherRoutes, { prefix: '/api/admin/teachers' });
  await app.register(categoryRoutes, { prefix: '/api/admin/categories' });
  await app.register(studentRoutes, { prefix: '/api/admin/students' });
  await app.register(certificateRoutes, { prefix: '/api/admin/certificates' });
  await app.register(applicationRoutes, { prefix: '/api/admin/applications' });
  await app.register(newsRoutes, { prefix: '/api/admin/news' });
  await app.register(testimonialRoutes, { prefix: '/api/admin/testimonials' });
  await app.register(partnerRoutes, { prefix: '/api/admin/partners' });
  await app.register(reviewRoutes, { prefix: '/api/admin/reviews' });
  await app.register(settingsRoutes, { prefix: '/api/admin/settings' });
  await app.register(scholarshipRoutes, { prefix: '/api/admin/scholarships' });
  await app.register(scholarshipApplicationRoutes, { prefix: '/api/admin/scholarship-applications' });
  await app.register(corporateServiceRoutes, { prefix: '/api/admin/corporate-services' });
  await app.register(corporateInquiryRoutes, { prefix: '/api/admin/corporate-inquiries' });
  await app.register(lessonRoutes, { prefix: '/api/admin/lessons' });
  await app.register(parentRoutes, { prefix: '/api/admin/parents' });
  await app.register(scheduleAdminRoutes, { prefix: '/api/admin/schedules' });

  // Error handler
  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  });

  return app;
}
