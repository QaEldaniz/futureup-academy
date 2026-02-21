import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { adminAuth, teacherAuth, anyAuth } from '../middleware/auth.middleware.js';

export async function authRoutes(server: FastifyInstance) {
  // Rate limit config for auth endpoints (5 attempts per minute)
  const authRateLimit = { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } };

  // POST /login - Admin login (legacy, still works)
  server.post('/login', authRateLimit, async (request, reply) => {
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

  // POST /teacher/login - Teacher login (legacy, still works)
  server.post('/teacher/login', authRateLimit, async (request, reply) => {
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

  // ==========================================
  // UNIFIED LOGIN — searches all 4 tables
  // ==========================================
  server.post('/unified-login', authRateLimit, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();

    // 1. Check Admin (User table)
    const admin = await server.prisma.user.findUnique({ where: { email: emailLower } });
    if (admin && admin.isActive) {
      const valid = await bcrypt.compare(password, admin.password);
      if (valid) {
        const token = server.jwt.sign({ id: admin.id, role: admin.role, type: 'admin' as const });
        return reply.send({
          success: true,
          data: {
            token,
            type: 'admin',
            redirect: '/admin',
            user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, avatar: admin.avatar },
          },
        });
      }
    }

    // 2. Check Teacher
    const teacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } });
    if (teacher && teacher.isActive && teacher.password) {
      const valid = await bcrypt.compare(password, teacher.password);
      if (valid) {
        await server.prisma.teacher.update({ where: { id: teacher.id }, data: {} }); // touch updatedAt
        const token = server.jwt.sign({ id: teacher.id, role: 'teacher', type: 'teacher' as const });
        return reply.send({
          success: true,
          data: {
            token,
            type: 'teacher',
            redirect: '/lms/teacher',
            user: {
              id: teacher.id, email: teacher.email,
              nameAz: teacher.nameAz, nameRu: teacher.nameRu, nameEn: teacher.nameEn,
              photo: teacher.photo,
            },
          },
        });
      }
    }

    // 3. Check Student
    const student = await server.prisma.student.findUnique({ where: { email: emailLower } });
    if (student && student.isActive && student.password) {
      const valid = await bcrypt.compare(password, student.password);
      if (valid) {
        await server.prisma.student.update({ where: { id: student.id }, data: { lastLoginAt: new Date() } });
        const token = server.jwt.sign({ id: student.id, role: 'student', type: 'student' as const });
        return reply.send({
          success: true,
          data: {
            token,
            type: 'student',
            redirect: '/lms/student',
            user: {
              id: student.id, email: student.email, name: student.name, photo: student.photo,
            },
          },
        });
      }
    }

    // 4. Check Parent
    const parent = await server.prisma.parent.findUnique({ where: { email: emailLower } });
    if (parent && parent.isActive) {
      const valid = await bcrypt.compare(password, parent.password);
      if (valid) {
        await server.prisma.parent.update({ where: { id: parent.id }, data: { lastLoginAt: new Date() } });
        const token = server.jwt.sign({ id: parent.id, role: 'parent', type: 'parent' as const });
        return reply.send({
          success: true,
          data: {
            token,
            type: 'parent',
            redirect: '/lms/parent',
            user: {
              id: parent.id, email: parent.email,
              nameAz: parent.nameAz, nameRu: parent.nameRu, nameEn: parent.nameEn,
              avatar: parent.avatar,
            },
          },
        });
      }
    }

    return reply.status(401).send({ success: false, message: 'Invalid credentials' });
  });

  // ==========================================
  // STUDENT REGISTRATION
  // ==========================================
  server.post('/student/register', authRateLimit, async (request, reply) => {
    const { name, email, password, phone } = request.body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
    };

    if (!name || !email || !password) {
      return reply.status(400).send({ success: false, message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ success: false, message: 'Password must be at least 6 characters' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already exists in any table
    const existingStudent = await server.prisma.student.findUnique({ where: { email: emailLower } });
    if (existingStudent) {
      if (existingStudent.password) {
        return reply.status(409).send({ success: false, message: 'Email already registered' });
      }
      // Student exists but no password (created by admin) — set password
      const hashed = await bcrypt.hash(password, 10);
      const updated = await server.prisma.student.update({
        where: { id: existingStudent.id },
        data: { password: hashed, name, phone, lastLoginAt: new Date() },
      });
      const token = server.jwt.sign({ id: updated.id, role: 'student', type: 'student' as const });
      return reply.send({
        success: true,
        data: {
          token,
          type: 'student',
          redirect: '/lms/student',
          user: { id: updated.id, email: updated.email, name: updated.name, photo: updated.photo },
        },
      });
    }

    // Check other tables
    const existingUser = await server.prisma.user.findUnique({ where: { email: emailLower } });
    const existingTeacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } });
    const existingParent = await server.prisma.parent.findUnique({ where: { email: emailLower } });

    if (existingUser || existingTeacher || existingParent) {
      return reply.status(409).send({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = await server.prisma.student.create({
      data: { name, email: emailLower, password: hashed, phone, lastLoginAt: new Date() },
    });

    const token = server.jwt.sign({ id: student.id, role: 'student', type: 'student' as const });

    return reply.status(201).send({
      success: true,
      data: {
        token,
        type: 'student',
        redirect: '/lms/student',
        user: { id: student.id, email: student.email, name: student.name, photo: student.photo },
      },
    });
  });

  // ==========================================
  // PARENT REGISTRATION
  // ==========================================
  server.post('/parent/register', authRateLimit, async (request, reply) => {
    const { nameAz, nameRu, nameEn, email, password, phone } = request.body as {
      nameAz: string;
      nameRu: string;
      nameEn: string;
      email: string;
      password: string;
      phone?: string;
    };

    if (!nameAz || !email || !password) {
      return reply.status(400).send({ success: false, message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ success: false, message: 'Password must be at least 6 characters' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check all tables for existing email
    const existingParent = await server.prisma.parent.findUnique({ where: { email: emailLower } });
    const existingUser = await server.prisma.user.findUnique({ where: { email: emailLower } });
    const existingTeacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } });
    const existingStudent = await server.prisma.student.findUnique({ where: { email: emailLower } });

    if (existingParent || existingUser || existingTeacher || existingStudent) {
      return reply.status(409).send({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const parent = await server.prisma.parent.create({
      data: {
        nameAz,
        nameRu: nameRu || nameAz,
        nameEn: nameEn || nameAz,
        email: emailLower,
        password: hashed,
        phone,
        lastLoginAt: new Date(),
      },
    });

    const token = server.jwt.sign({ id: parent.id, role: 'parent', type: 'parent' as const });

    return reply.status(201).send({
      success: true,
      data: {
        token,
        type: 'parent',
        redirect: '/lms/parent',
        user: {
          id: parent.id, email: parent.email,
          nameAz: parent.nameAz, nameRu: parent.nameRu, nameEn: parent.nameEn,
          avatar: parent.avatar,
        },
      },
    });
  });

  // GET /me - Get current user (admin, teacher, student, or parent)
  server.get('/me', { preHandler: [anyAuth] }, async (request, reply) => {
    const { id, type } = request.user;

    if (type === 'admin') {
      const user = await server.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
      });
      if (!user) return reply.status(404).send({ success: false, message: 'User not found' });
      return reply.send({ success: true, data: { ...user, type: 'admin' } });
    }

    if (type === 'teacher') {
      const teacher = await server.prisma.teacher.findUnique({
        where: { id },
        select: {
          id: true, email: true, nameAz: true, nameRu: true, nameEn: true,
          photo: true, specialization: true, createdAt: true,
        },
      });
      if (!teacher) return reply.status(404).send({ success: false, message: 'Teacher not found' });
      return reply.send({ success: true, data: { ...teacher, type: 'teacher' } });
    }

    if (type === 'student') {
      const student = await server.prisma.student.findUnique({
        where: { id },
        select: {
          id: true, email: true, name: true, phone: true, photo: true, createdAt: true,
        },
      });
      if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });
      return reply.send({ success: true, data: { ...student, type: 'student' } });
    }

    if (type === 'parent') {
      const parent = await server.prisma.parent.findUnique({
        where: { id },
        select: {
          id: true, email: true, nameAz: true, nameRu: true, nameEn: true,
          phone: true, avatar: true, createdAt: true,
        },
      });
      if (!parent) return reply.status(404).send({ success: false, message: 'Parent not found' });
      return reply.send({ success: true, data: { ...parent, type: 'parent' } });
    }

    return reply.status(400).send({ success: false, message: 'Invalid user type' });
  });
}
