import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function categoryRoutes(server: FastifyInstance) {
  // GET / - List all categories (public)
  server.get('/', async (request, reply) => {
    const categories = await server.prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: [{ order: 'asc' }, { nameEn: 'asc' }],
    });

    return reply.send({ success: true, data: categories });
  });

  // POST / - Create category (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      nameAz: string;
      nameRu: string;
      nameEn: string;
      slug: string;
      icon?: string;
      order?: number;
    };

    const category = await server.prisma.category.create({
      data: body,
    });

    return reply.status(201).send({ success: true, data: category });
  });

  // PUT /:id - Update category (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      nameAz?: string;
      nameRu?: string;
      nameEn?: string;
      slug?: string;
      icon?: string;
      order?: number;
    };

    const existing = await server.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Category not found' });
    }

    const category = await server.prisma.category.update({
      where: { id },
      data: body,
    });

    return reply.send({ success: true, data: category });
  });

  // DELETE /:id - Delete category (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    });

    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Category not found' });
    }

    if (existing._count.courses > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Cannot delete category with existing courses. Reassign or delete courses first.',
      });
    }

    await server.prisma.category.delete({ where: { id } });

    return reply.send({ success: true, message: 'Category deleted successfully' });
  });
}
