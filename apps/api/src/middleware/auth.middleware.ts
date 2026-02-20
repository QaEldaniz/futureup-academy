import { FastifyRequest, FastifyReply } from 'fastify';

export async function adminAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.type !== 'admin') {
      return reply.status(403).send({ success: false, message: 'Admin access required' });
    }
  } catch (err) {
    return reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
}

export async function teacherAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.type !== 'teacher') {
      return reply.status(403).send({ success: false, message: 'Teacher access required' });
    }
  } catch (err) {
    return reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
}

export async function studentAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.type !== 'student') {
      return reply.status(403).send({ success: false, message: 'Student access required' });
    }
  } catch (err) {
    return reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
}

export async function parentAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.type !== 'parent') {
      return reply.status(403).send({ success: false, message: 'Parent access required' });
    }
  } catch (err) {
    return reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
}

export async function anyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
}

// Admin or Teacher access
export async function adminOrTeacherAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.type !== 'admin' && request.user.type !== 'teacher') {
      return reply.status(403).send({ success: false, message: 'Admin or Teacher access required' });
    }
  } catch (err) {
    return reply.status(401).send({ success: false, message: 'Unauthorized' });
  }
}
