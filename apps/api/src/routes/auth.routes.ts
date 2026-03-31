import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { adminAuth, teacherAuth, anyAuth } from '../middleware/auth.middleware.js';
import { sendEmail, emailVerificationCode, emailPasswordReset } from '../utils/resend.js';
import { auditLog } from '../utils/audit.js';

// ==========================================
// CONSTANTS & HELPERS
// ==========================================

const IS_PROD = process.env.NODE_ENV === 'production';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Access token cookie — short-lived (15 min)
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' as const : 'lax' as const,
  path: '/',
  maxAge: 15 * 60, // 15 minutes
};

// Refresh token cookie — long-lived (7 days), scoped to /api/auth
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' as const : 'lax' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Set CSRF cookie (readable by JS)
function setCsrfCookie(reply: FastifyReply) {
  const csrfToken = generateCsrfToken();
  reply.setCookie('futureup_csrf', csrfToken, {
    httpOnly: false, // JS must read this
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' as const : 'lax' as const,
    path: '/',
    maxAge: 15 * 60,
  });
}

// Issue access + refresh tokens + CSRF cookie
async function issueTokens(
  server: FastifyInstance,
  reply: FastifyReply,
  payload: { id: string; role: string; type: 'admin' | 'teacher' | 'student' | 'parent' },
) {
  // Access token (15 min JWT)
  const accessToken = server.jwt.sign(payload);
  reply.setCookie('futureup_token', accessToken, ACCESS_COOKIE_OPTIONS);

  // Refresh token (7 days, stored hashed in DB)
  const rawRefresh = generateRefreshToken();
  const family = crypto.randomUUID();
  await server.prisma.refreshToken.create({
    data: {
      token: hashToken(rawRefresh),
      userId: payload.id,
      userType: payload.type,
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  reply.setCookie('futureup_refresh', rawRefresh, REFRESH_COOKIE_OPTIONS);

  // CSRF token
  setCsrfCookie(reply);

  return accessToken;
}

// ==========================================
// LOCKOUT HELPERS
// ==========================================

interface LockableUser {
  id: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

function isLocked(user: LockableUser): { locked: boolean; minutesRemaining?: number } {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { locked: true, minutesRemaining: mins };
  }
  return { locked: false };
}

async function recordFailedLogin(
  server: FastifyInstance,
  model: 'user' | 'teacher' | 'student' | 'parent',
  user: LockableUser,
  request: FastifyRequest,
  email: string,
) {
  const attempts = user.failedLoginAttempts + 1;
  const lockData: any = { failedLoginAttempts: attempts };

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    lockData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    await auditLog(server.prisma, request, {
      event: 'ACCOUNT_LOCKED',
      userId: user.id,
      userType: model,
      email,
      metadata: { attempts },
    });
  }

  await (server.prisma[model] as any).update({
    where: { id: user.id },
    data: lockData,
  });

  await auditLog(server.prisma, request, {
    event: 'LOGIN_FAILED',
    userId: user.id,
    userType: model,
    email,
    metadata: { reason: 'invalid_password', attempts },
  });
}

async function resetFailedAttempts(
  server: FastifyInstance,
  model: 'user' | 'teacher' | 'student' | 'parent',
  userId: string,
) {
  await (server.prisma[model] as any).update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}

// ==========================================
// AUTH ROUTES
// ==========================================

export async function authRoutes(server: FastifyInstance) {
  const authRateLimit = { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } };

  // POST /login - Admin login (legacy, still works)
  server.post('/login', authRateLimit, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await server.prisma.user.findUnique({ where: { email: emailLower } });

    if (!user || !user.isActive) {
      await auditLog(server.prisma, request, { event: 'LOGIN_FAILED', email: emailLower, metadata: { reason: 'user_not_found' } });
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    // Lockout check
    const lockStatus = isLocked(user);
    if (lockStatus.locked) {
      return reply.status(423).send({ success: false, message: `Account locked. Try again in ${lockStatus.minutesRemaining} minutes.` });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await recordFailedLogin(server, 'user', user, request, emailLower);
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    await resetFailedAttempts(server, 'user', user.id);
    const token = await issueTokens(server, reply, { id: user.id, role: user.role, type: 'admin' });

    await auditLog(server.prisma, request, { event: 'LOGIN_SUCCESS', userId: user.id, userType: 'admin', email: emailLower });

    return reply.send({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
      },
    });
  });

  // POST /teacher/login - Teacher login (legacy, still works)
  server.post('/teacher/login', authRateLimit, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const teacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } });

    if (!teacher || !teacher.isActive || !teacher.password) {
      await auditLog(server.prisma, request, { event: 'LOGIN_FAILED', email: emailLower, metadata: { reason: 'user_not_found' } });
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const lockStatus = isLocked(teacher);
    if (lockStatus.locked) {
      return reply.status(423).send({ success: false, message: `Account locked. Try again in ${lockStatus.minutesRemaining} minutes.` });
    }

    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid) {
      await recordFailedLogin(server, 'teacher', teacher, request, emailLower);
      return reply.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    await resetFailedAttempts(server, 'teacher', teacher.id);
    const token = await issueTokens(server, reply, { id: teacher.id, role: 'teacher', type: 'teacher' });

    await auditLog(server.prisma, request, { event: 'LOGIN_SUCCESS', userId: teacher.id, userType: 'teacher', email: emailLower });

    return reply.send({
      success: true,
      data: {
        token,
        user: {
          id: teacher.id, email: teacher.email,
          nameAz: teacher.nameAz, nameRu: teacher.nameRu, nameEn: teacher.nameEn,
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
      const lockStatus = isLocked(admin);
      if (lockStatus.locked) {
        return reply.status(423).send({ success: false, message: `ACCOUNT_LOCKED:${lockStatus.minutesRemaining}` });
      }
      const valid = await bcrypt.compare(password, admin.password);
      if (valid) {
        await resetFailedAttempts(server, 'user', admin.id);
        const token = await issueTokens(server, reply, { id: admin.id, role: admin.role, type: 'admin' });
        await auditLog(server.prisma, request, { event: 'LOGIN_SUCCESS', userId: admin.id, userType: 'admin', email: emailLower });
        return reply.send({
          success: true,
          data: {
            token, type: 'admin', redirect: '/admin',
            user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role, avatar: admin.avatar },
          },
        });
      }
      await recordFailedLogin(server, 'user', admin, request, emailLower);
    }

    // 2. Check Teacher
    const teacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } });
    if (teacher && teacher.isActive && teacher.password) {
      const lockStatus = isLocked(teacher);
      if (lockStatus.locked) {
        return reply.status(423).send({ success: false, message: `ACCOUNT_LOCKED:${lockStatus.minutesRemaining}` });
      }
      const valid = await bcrypt.compare(password, teacher.password);
      if (valid) {
        await resetFailedAttempts(server, 'teacher', teacher.id);
        const token = await issueTokens(server, reply, { id: teacher.id, role: 'teacher', type: 'teacher' });
        await auditLog(server.prisma, request, { event: 'LOGIN_SUCCESS', userId: teacher.id, userType: 'teacher', email: emailLower });
        return reply.send({
          success: true,
          data: {
            token, type: 'teacher', redirect: '/lms/teacher',
            user: { id: teacher.id, email: teacher.email, nameAz: teacher.nameAz, nameRu: teacher.nameRu, nameEn: teacher.nameEn, photo: teacher.photo },
          },
        });
      }
      await recordFailedLogin(server, 'teacher', teacher, request, emailLower);
    }

    // 3. Check Student
    const student = await server.prisma.student.findUnique({ where: { email: emailLower } });
    if (student && student.password) {
      const lockStatus = isLocked(student);
      if (lockStatus.locked) {
        return reply.status(423).send({ success: false, message: `ACCOUNT_LOCKED:${lockStatus.minutesRemaining}` });
      }
      const valid = await bcrypt.compare(password, student.password);
      if (valid) {
        if (!student.isActive) {
          return reply.status(403).send({ success: false, message: 'ACCOUNT_PENDING_APPROVAL' });
        }
        await resetFailedAttempts(server, 'student', student.id);
        await server.prisma.student.update({ where: { id: student.id }, data: { lastLoginAt: new Date() } });
        const token = await issueTokens(server, reply, { id: student.id, role: 'student', type: 'student' });
        await auditLog(server.prisma, request, { event: 'LOGIN_SUCCESS', userId: student.id, userType: 'student', email: emailLower });
        return reply.send({
          success: true,
          data: {
            token, type: 'student', redirect: '/lms/student',
            user: { id: student.id, email: student.email, name: student.name, photo: student.photo },
          },
        });
      }
      await recordFailedLogin(server, 'student', student, request, emailLower);
    }

    // 4. Check Parent
    const parent = await server.prisma.parent.findUnique({ where: { email: emailLower } });
    if (parent && parent.isActive) {
      const lockStatus = isLocked(parent);
      if (lockStatus.locked) {
        return reply.status(423).send({ success: false, message: `ACCOUNT_LOCKED:${lockStatus.minutesRemaining}` });
      }
      const valid = await bcrypt.compare(password, parent.password);
      if (valid) {
        await resetFailedAttempts(server, 'parent', parent.id);
        await server.prisma.parent.update({ where: { id: parent.id }, data: { lastLoginAt: new Date() } });
        const token = await issueTokens(server, reply, { id: parent.id, role: 'parent', type: 'parent' });
        await auditLog(server.prisma, request, { event: 'LOGIN_SUCCESS', userId: parent.id, userType: 'parent', email: emailLower });
        return reply.send({
          success: true,
          data: {
            token, type: 'parent', redirect: '/lms/parent',
            user: { id: parent.id, email: parent.email, nameAz: parent.nameAz, nameRu: parent.nameRu, nameEn: parent.nameEn, avatar: parent.avatar },
          },
        });
      }
      await recordFailedLogin(server, 'parent', parent, request, emailLower);
    }

    await auditLog(server.prisma, request, { event: 'LOGIN_FAILED', email: emailLower, metadata: { reason: 'no_match' } });
    return reply.status(401).send({ success: false, message: 'Invalid credentials' });
  });

  // ==========================================
  // TOKEN REFRESH — exchange refresh token for new access + refresh tokens
  // ==========================================
  server.post('/refresh', async (request, reply) => {
    const rawRefresh = request.cookies.futureup_refresh;

    if (!rawRefresh) {
      return reply.status(401).send({ success: false, message: 'No refresh token' });
    }

    const hashedToken = hashToken(rawRefresh);

    // Find the refresh token
    const storedToken = await server.prisma.refreshToken.findUnique({ where: { token: hashedToken } });

    if (!storedToken) {
      return reply.status(401).send({ success: false, message: 'Invalid refresh token' });
    }

    // If token was already revoked — possible replay attack! Revoke entire family
    if (storedToken.revokedAt) {
      await server.prisma.refreshToken.updateMany({
        where: { family: storedToken.family, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      reply.clearCookie('futureup_token', { path: '/' });
      reply.clearCookie('futureup_refresh', { path: '/api/auth' });
      reply.clearCookie('futureup_csrf', { path: '/' });
      await auditLog(server.prisma, request, {
        event: 'TOKEN_REUSE_DETECTED',
        userId: storedToken.userId,
        userType: storedToken.userType,
        metadata: { family: storedToken.family },
      });
      return reply.status(401).send({ success: false, message: 'Token reuse detected. Please log in again.' });
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      return reply.status(401).send({ success: false, message: 'Refresh token expired' });
    }

    // Revoke current token
    await server.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new tokens in the same family
    const userType = storedToken.userType as 'admin' | 'teacher' | 'student' | 'parent';
    let role: string = userType;

    // Get current role (admin may have SUPER_ADMIN etc.)
    if (userType === 'admin') {
      const user = await server.prisma.user.findUnique({ where: { id: storedToken.userId } });
      if (!user || !user.isActive) return reply.status(401).send({ success: false, message: 'User deactivated' });
      role = user.role;
    }

    // New access token
    const accessToken = server.jwt.sign({ id: storedToken.userId, role, type: userType });
    reply.setCookie('futureup_token', accessToken, ACCESS_COOKIE_OPTIONS);

    // New refresh token (same family)
    const newRawRefresh = generateRefreshToken();
    await server.prisma.refreshToken.create({
      data: {
        token: hashToken(newRawRefresh),
        userId: storedToken.userId,
        userType: storedToken.userType,
        family: storedToken.family,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    reply.setCookie('futureup_refresh', newRawRefresh, REFRESH_COOKIE_OPTIONS);

    // New CSRF
    setCsrfCookie(reply);

    await auditLog(server.prisma, request, {
      event: 'TOKEN_REFRESH',
      userId: storedToken.userId,
      userType: storedToken.userType,
    });

    return reply.send({ success: true });
  });

  // ==========================================
  // STUDENT REGISTRATION
  // ==========================================
  server.post('/student/register', authRateLimit, async (request, reply) => {
    const { name, email, password, phone } = request.body as {
      name: string; email: string; password: string; phone?: string;
    };

    if (!name || !email || !password) {
      return reply.status(400).send({ success: false, message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ success: false, message: 'Password must be at least 6 characters' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email already exists
    const existingStudent = await server.prisma.student.findUnique({ where: { email: emailLower } });
    if (existingStudent) {
      if (existingStudent.password) {
        return reply.status(409).send({ success: false, message: 'Email already registered' });
      }
      // Student created by admin — set password
      const hashed = await bcrypt.hash(password, 10);
      const updated = await server.prisma.student.update({
        where: { id: existingStudent.id },
        data: { password: hashed, name, phone, lastLoginAt: new Date() },
      });
      const token = await issueTokens(server, reply, { id: updated.id, role: 'student', type: 'student' });
      return reply.send({
        success: true,
        data: {
          token, type: 'student', redirect: '/lms/student',
          user: { id: updated.id, email: updated.email, name: updated.name, photo: updated.photo },
        },
      });
    }

    const existingUser = await server.prisma.user.findUnique({ where: { email: emailLower } });
    const existingTeacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } });
    const existingParent = await server.prisma.parent.findUnique({ where: { email: emailLower } });
    if (existingUser || existingTeacher || existingParent) {
      return reply.status(409).send({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = await server.prisma.student.create({
      data: { name, email: emailLower, password: hashed, phone, isActive: false, emailVerified: false },
    });

    // Send verification email
    const code = generateCode();
    await server.prisma.verificationToken.create({
      data: { email: emailLower, code, type: 'EMAIL_VERIFICATION', userType: 'student', expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });
    const emailContent = emailVerificationCode(code, name);
    await sendEmail(emailLower, emailContent.subject, emailContent.html);

    return reply.status(201).send({
      success: true,
      message: 'REGISTRATION_PENDING',
      data: { name: student.name, email: student.email, requiresVerification: true },
    });
  });

  // ==========================================
  // PARENT REGISTRATION
  // ==========================================
  server.post('/parent/register', authRateLimit, async (request, reply) => {
    const { nameAz, nameRu, nameEn, email, password, phone } = request.body as {
      nameAz: string; nameRu: string; nameEn: string; email: string; password: string; phone?: string;
    };

    if (!nameAz || !email || !password) {
      return reply.status(400).send({ success: false, message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ success: false, message: 'Password must be at least 6 characters' });
    }

    const emailLower = email.toLowerCase().trim();

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
        nameAz, nameRu: nameRu || nameAz, nameEn: nameEn || nameAz,
        email: emailLower, password: hashed, phone, emailVerified: false,
      },
    });

    const code = generateCode();
    await server.prisma.verificationToken.create({
      data: { email: emailLower, code, type: 'EMAIL_VERIFICATION', userType: 'parent', expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });
    const emailContent = emailVerificationCode(code, nameAz);
    await sendEmail(emailLower, emailContent.subject, emailContent.html);

    return reply.status(201).send({
      success: true,
      message: 'VERIFICATION_REQUIRED',
      data: { email: parent.email, nameAz: parent.nameAz, requiresVerification: true },
    });
  });

  // ==========================================
  // GET /me
  // ==========================================
  server.get('/me', { preHandler: [anyAuth] }, async (request, reply) => {
    const { id, type } = request.user;

    if (type === 'admin') {
      const user = await server.prisma.user.findUnique({
        where: { id }, select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
      });
      if (!user) return reply.status(404).send({ success: false, message: 'User not found' });
      return reply.send({ success: true, data: { ...user, type: 'admin' } });
    }

    if (type === 'teacher') {
      const teacher = await server.prisma.teacher.findUnique({
        where: { id }, select: { id: true, email: true, nameAz: true, nameRu: true, nameEn: true, photo: true, specialization: true, createdAt: true },
      });
      if (!teacher) return reply.status(404).send({ success: false, message: 'Teacher not found' });
      return reply.send({ success: true, data: { ...teacher, type: 'teacher' } });
    }

    if (type === 'student') {
      const student = await server.prisma.student.findUnique({
        where: { id }, select: { id: true, email: true, name: true, phone: true, photo: true, createdAt: true },
      });
      if (!student) return reply.status(404).send({ success: false, message: 'Student not found' });
      return reply.send({ success: true, data: { ...student, type: 'student' } });
    }

    if (type === 'parent') {
      const parent = await server.prisma.parent.findUnique({
        where: { id }, select: { id: true, email: true, nameAz: true, nameRu: true, nameEn: true, phone: true, avatar: true, createdAt: true },
      });
      if (!parent) return reply.status(404).send({ success: false, message: 'Parent not found' });
      return reply.send({ success: true, data: { ...parent, type: 'parent' } });
    }

    return reply.status(400).send({ success: false, message: 'Invalid user type' });
  });

  // ==========================================
  // VERIFY EMAIL
  // ==========================================
  server.post('/verify-email', authRateLimit, async (request, reply) => {
    const { email, code } = request.body as { email: string; code: string };
    if (!email || !code) return reply.status(400).send({ success: false, message: 'Email and code are required' });

    const emailLower = email.toLowerCase().trim();
    const token = await server.prisma.verificationToken.findFirst({
      where: { email: emailLower, code, type: 'EMAIL_VERIFICATION', used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) return reply.status(400).send({ success: false, message: 'Invalid or expired code' });

    await server.prisma.verificationToken.update({ where: { id: token.id }, data: { used: true } });

    if (token.userType === 'student') {
      const student = await server.prisma.student.update({ where: { email: emailLower }, data: { emailVerified: true } });
      if (student.isActive) {
        const jwt = await issueTokens(server, reply, { id: student.id, role: 'student', type: 'student' });
        return reply.send({
          success: true, message: 'EMAIL_VERIFIED',
          data: { token: jwt, type: 'student', redirect: '/lms/student', user: { id: student.id, email: student.email, name: student.name, photo: student.photo } },
        });
      }
      return reply.send({ success: true, message: 'EMAIL_VERIFIED_PENDING_APPROVAL', data: { email: student.email, name: student.name } });
    }

    if (token.userType === 'parent') {
      const parent = await server.prisma.parent.update({ where: { email: emailLower }, data: { emailVerified: true, isActive: true, lastLoginAt: new Date() } });
      const jwt = await issueTokens(server, reply, { id: parent.id, role: 'parent', type: 'parent' });
      return reply.send({
        success: true, message: 'EMAIL_VERIFIED',
        data: { token: jwt, type: 'parent', redirect: '/lms/parent', user: { id: parent.id, email: parent.email, nameAz: parent.nameAz, nameRu: parent.nameRu, nameEn: parent.nameEn, avatar: parent.avatar } },
      });
    }

    return reply.send({ success: true, message: 'EMAIL_VERIFIED' });
  });

  // ==========================================
  // RESEND VERIFICATION CODE
  // ==========================================
  server.post('/resend-code', authRateLimit, async (request, reply) => {
    const { email, type } = request.body as { email: string; type?: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' };
    if (!email) return reply.status(400).send({ success: false, message: 'Email is required' });

    const emailLower = email.toLowerCase().trim();
    const tokenType = type || 'EMAIL_VERIFICATION';
    let userName = '', userType = '';

    const student = await server.prisma.student.findUnique({ where: { email: emailLower } });
    if (student) { userName = student.name; userType = 'student'; }
    if (!userType) { const parent = await server.prisma.parent.findUnique({ where: { email: emailLower } }); if (parent) { userName = parent.nameAz; userType = 'parent'; } }
    if (!userType) { const teacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } }); if (teacher) { userName = teacher.nameAz; userType = 'teacher'; } }
    if (!userType) { const admin = await server.prisma.user.findUnique({ where: { email: emailLower } }); if (admin) { userName = admin.name; userType = 'admin'; } }

    if (!userType) return reply.send({ success: true, message: 'If the email exists, a code has been sent' });

    await server.prisma.verificationToken.updateMany({ where: { email: emailLower, type: tokenType, used: false }, data: { used: true } });

    const code = generateCode();
    await server.prisma.verificationToken.create({
      data: { email: emailLower, code, type: tokenType, userType, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });

    const emailContent = tokenType === 'PASSWORD_RESET' ? emailPasswordReset(code, userName) : emailVerificationCode(code, userName);
    await sendEmail(emailLower, emailContent.subject, emailContent.html);

    return reply.send({ success: true, message: 'If the email exists, a code has been sent' });
  });

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================
  server.post('/forgot-password', authRateLimit, async (request, reply) => {
    const { email } = request.body as { email: string };
    if (!email) return reply.status(400).send({ success: false, message: 'Email is required' });

    const emailLower = email.toLowerCase().trim();
    let userName = '', userType = '';

    const student = await server.prisma.student.findUnique({ where: { email: emailLower } });
    if (student && student.password) { userName = student.name; userType = 'student'; }
    if (!userType) { const parent = await server.prisma.parent.findUnique({ where: { email: emailLower } }); if (parent) { userName = parent.nameAz; userType = 'parent'; } }
    if (!userType) { const teacher = await server.prisma.teacher.findUnique({ where: { email: emailLower } }); if (teacher && teacher.password) { userName = teacher.nameAz; userType = 'teacher'; } }
    if (!userType) { const admin = await server.prisma.user.findUnique({ where: { email: emailLower } }); if (admin) { userName = admin.name; userType = 'admin'; } }

    if (!userType) return reply.send({ success: true, message: 'If the email exists, a reset code has been sent' });

    await server.prisma.verificationToken.updateMany({ where: { email: emailLower, type: 'PASSWORD_RESET', used: false }, data: { used: true } });

    const code = generateCode();
    await server.prisma.verificationToken.create({
      data: { email: emailLower, code, type: 'PASSWORD_RESET', userType, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });

    const emailContent = emailPasswordReset(code, userName);
    await sendEmail(emailLower, emailContent.subject, emailContent.html);

    return reply.send({ success: true, message: 'If the email exists, a reset code has been sent' });
  });

  // ==========================================
  // RESET PASSWORD
  // ==========================================
  server.post('/reset-password', authRateLimit, async (request, reply) => {
    const { email, code, newPassword } = request.body as { email: string; code: string; newPassword: string };
    if (!email || !code || !newPassword) return reply.status(400).send({ success: false, message: 'Email, code and new password are required' });
    if (newPassword.length < 6) return reply.status(400).send({ success: false, message: 'Password must be at least 6 characters' });

    const emailLower = email.toLowerCase().trim();
    const token = await server.prisma.verificationToken.findFirst({
      where: { email: emailLower, code, type: 'PASSWORD_RESET', used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) return reply.status(400).send({ success: false, message: 'Invalid or expired code' });

    await server.prisma.verificationToken.update({ where: { id: token.id }, data: { used: true } });

    const hashed = await bcrypt.hash(newPassword, 10);

    if (token.userType === 'student') await server.prisma.student.update({ where: { email: emailLower }, data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null } });
    else if (token.userType === 'parent') await server.prisma.parent.update({ where: { email: emailLower }, data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null } });
    else if (token.userType === 'teacher') await server.prisma.teacher.update({ where: { email: emailLower }, data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null } });
    else if (token.userType === 'admin') await server.prisma.user.update({ where: { email: emailLower }, data: { password: hashed, failedLoginAttempts: 0, lockedUntil: null } });

    await auditLog(server.prisma, request, { event: 'PASSWORD_RESET', userType: token.userType, email: emailLower });

    return reply.send({ success: true, message: 'Password reset successfully' });
  });

  // ==========================================
  // LOGOUT — revoke refresh token + clear cookies
  // ==========================================
  server.post('/logout', async (request, reply) => {
    // Revoke refresh token in DB
    const rawRefresh = request.cookies.futureup_refresh;
    if (rawRefresh) {
      const hashedToken = hashToken(rawRefresh);
      await server.prisma.refreshToken.updateMany({
        where: { token: hashedToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Try to get user info for audit
    try {
      await request.jwtVerify();
      await auditLog(server.prisma, request, {
        event: 'LOGOUT',
        userId: (request.user as any).id,
        userType: (request.user as any).type,
      });
    } catch {
      // Token expired or invalid — still clear cookies
    }

    reply.clearCookie('futureup_token', { path: '/' });
    reply.clearCookie('futureup_refresh', { path: '/api/auth' });
    reply.clearCookie('futureup_csrf', { path: '/' });
    return reply.send({ success: true, message: 'Logged out' });
  });
}
