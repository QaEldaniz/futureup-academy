import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function settingsRoutes(server: FastifyInstance) {
  // GET / - Get all site settings (public)
  server.get('/', async (request, reply) => {
    const settings = await server.prisma.siteSetting.findMany();

    // Transform array to key-value object for easier consumption
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return reply.send({ success: true, data: settingsMap });
  });

  // PUT / - Update settings (batch upsert) (admin auth)
  server.put('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as Record<string, string>;

    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        success: false,
        message: 'Request body must be an object of key-value pairs',
      });
    }

    const entries = Object.entries(body);

    if (entries.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'No settings provided',
      });
    }

    // Upsert each setting in a transaction
    await server.prisma.$transaction(
      entries.map(([key, value]) =>
        server.prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    // Return updated settings
    const settings = await server.prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return reply.send({ success: true, data: settingsMap });
  });
}
