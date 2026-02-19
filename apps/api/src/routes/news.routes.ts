import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function newsRoutes(server: FastifyInstance) {
  // GET / - List published news (public, with pagination)
  server.get('/', async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      all,
    } = request.query as {
      page?: string;
      limit?: string;
      all?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // By default, only show published. Admin can request all via ?all=true
    // but this is a public route, so we always filter to published
    const where: any = { isPublished: true };

    const [data, total] = await Promise.all([
      server.prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.news.count({ where }),
    ]);

    return reply.send({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  });

  // GET /:slug - Get news article by slug (public)
  server.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const article = await server.prisma.news.findUnique({
      where: { slug },
    });

    if (!article) {
      return reply.status(404).send({ success: false, message: 'Article not found' });
    }

    return reply.send({ success: true, data: article });
  });

  // POST / - Create news article (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      slug: string;
      titleAz: string;
      titleRu: string;
      titleEn: string;
      contentAz: string;
      contentRu: string;
      contentEn: string;
      excerptAz?: string;
      excerptRu?: string;
      excerptEn?: string;
      image?: string;
      isPublished?: boolean;
      publishedAt?: string;
    };

    const article = await server.prisma.news.create({
      data: {
        ...body,
        publishedAt: body.publishedAt
          ? new Date(body.publishedAt)
          : body.isPublished
            ? new Date()
            : null,
      },
    });

    return reply.status(201).send({ success: true, data: article });
  });

  // PUT /:id - Update news article (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      slug?: string;
      titleAz?: string;
      titleRu?: string;
      titleEn?: string;
      contentAz?: string;
      contentRu?: string;
      contentEn?: string;
      excerptAz?: string;
      excerptRu?: string;
      excerptEn?: string;
      image?: string;
      isPublished?: boolean;
      publishedAt?: string;
    };

    const existing = await server.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Article not found' });
    }

    // Auto-set publishedAt when publishing for the first time
    const updateData: any = { ...body };
    if (body.publishedAt) {
      updateData.publishedAt = new Date(body.publishedAt);
    } else if (body.isPublished && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const article = await server.prisma.news.update({
      where: { id },
      data: updateData,
    });

    return reply.send({ success: true, data: article });
  });

  // DELETE /:id - Delete news article (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Article not found' });
    }

    await server.prisma.news.delete({ where: { id } });

    return reply.send({ success: true, message: 'Article deleted successfully' });
  });
}
