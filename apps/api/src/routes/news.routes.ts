import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function newsRoutes(server: FastifyInstance) {
  // GET / - List news (public: published only; admin with auth: all)
  server.get('/', async (request, reply) => {
    const {
      page = '1',
      limit = '10',
    } = request.query as {
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // If admin (has Bearer token), show all articles; otherwise only published
    const isAdmin = !!(request.headers.authorization?.startsWith('Bearer '));
    const where: any = isAdmin ? {} : { isPublished: true };

    const [data, total] = await Promise.all([
      server.prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

  // GET /:slugOrId - Get news article by slug or ID (for admin edit + public)
  server.get('/:slugOrId', async (request, reply) => {
    const { slugOrId } = request.params as { slugOrId: string };

    // Try by slug first
    let article = await server.prisma.news.findUnique({
      where: { slug: slugOrId },
    });

    // Fallback: try by ID (for admin edit pages)
    if (!article) {
      article = await server.prisma.news.findUnique({
        where: { id: slugOrId },
      });
    }

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
