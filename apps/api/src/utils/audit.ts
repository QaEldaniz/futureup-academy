import { PrismaClient, Prisma } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export async function auditLog(
  prisma: PrismaClient,
  request: FastifyRequest,
  params: {
    event: string;
    userId?: string;
    userType?: string;
    email?: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        event: params.event,
        userId: params.userId,
        userType: params.userType,
        email: params.email,
        metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
        ip: request.ip,
        userAgent: request.headers['user-agent'] || null,
      },
    });
  } catch (err) {
    // Fire and forget — never let audit failure break the request
    console.error('[AUDIT ERROR]', err);
  }
}
