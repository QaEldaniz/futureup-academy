import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function partnerRoutes(server: FastifyInstance) {
  // GET / - List partners (public)
  server.get('/', async (request, reply) => {
    const partners = await server.prisma.partner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return reply.send({ success: true, data: partners });
  });

  // POST / - Create partner (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      name: string;
      logoUrl: string;
      website?: string;
      order?: number;
    };

    if (!body.name || !body.logoUrl) {
      return reply.status(400).send({
        success: false,
        message: 'Name and logoUrl are required',
      });
    }

    const partner = await server.prisma.partner.create({
      data: body,
    });

    return reply.status(201).send({ success: true, data: partner });
  });

  // PUT /:id - Update partner (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      logoUrl?: string;
      website?: string;
      order?: number;
    };

    const existing = await server.prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Partner not found' });
    }

    const partner = await server.prisma.partner.update({
      where: { id },
      data: body,
    });

    return reply.send({ success: true, data: partner });
  });

  // DELETE /:id - Delete partner (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Partner not found' });
    }

    await server.prisma.partner.delete({ where: { id } });

    return reply.send({ success: true, message: 'Partner deleted successfully' });
  });
}
