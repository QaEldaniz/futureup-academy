import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { adminAuth, teacherAuth, anyAuth } from '../middleware/auth.middleware.js';

export async function authRoutes(server: FastifyInstance) {
  // POST /login - Admin login
  server.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'Email and password are required' });
    }

    const user = await server.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const token = server.jwt.sign({
      id: user.id,
      role: user.role,
      type: 'admin' as const,
    });

    return reply.send({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  });

  // POST /teacher/login - Teacher login
  server.post('/teacher/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'Email and password are required' });
    }

    const teacher = await server.prisma.teacher.findUnique({ where: { email } });

    if (!teacher || !teacher.isActive || !teacher.password) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid) {
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const token = server.jwt.sign({
      id: teacher.id,
      role: 'teacher',
      type: 'teacher' as const,
    });

    return reply.send({
      success: true,
      data: {
        token,
        user: {
          id: teacher.id,
          email: teacher.email,
          nameAz: teacher.nameAz,
          nameRu: teacher.nameRu,
          nameEn: teacher.nameEn,
          photo: teacher.photo,
        },
      },
    });
  });

  // GET /me - Get current user (admin or teacher)
  server.get('/me', { preHandler: [anyAuth] }, async (request, reply) => {
    const { id, type } = request.user;

    if (type === 'admin') {
      const user = await server.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ success: false, message: 'User not found' });
      }

      return reply.send({ success: true, data: { ...user, type: 'admin' } });
    }

    if (type === 'teacher') {
      const teacher = await server.prisma.teacher.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          nameAz: true,
          nameRu: true,
          nameEn: true,
          photo: true,
          specialization: true,
          createdAt: true,
        },
      });

      if (!teacher) {
        return reply.status(404).send({ success: false, message: 'Teacher not found' });
      }

      return reply.send({ success: true, data: { ...teacher, type: 'teacher' } });
    }

    return reply.status(400).send({ success: false, message: 'Invalid user type' });
  });
}
