import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function testimonialRoutes(server: FastifyInstance) {
  // GET / - List testimonials (public: active only; admin: all)
  server.get('/', async (request, reply) => {
    const isAdmin = !!(request.headers.authorization?.startsWith('Bearer '));
    const where: any = isAdmin ? {} : { isActive: true };

    const testimonials = await server.prisma.testimonial.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return reply.send({ success: true, data: testimonials });
  });

  // GET /:id - Get testimonial by ID (for admin edit page)
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const testimonial = await server.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return reply.status(404).send({ success: false, message: 'Testimonial not found' });
    }
    return reply.send({ success: true, data: testimonial });
  });

  // POST / - Create testimonial (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      name: string;
      photo?: string;
      textAz: string;
      textRu: string;
      textEn: string;
      rating?: number;
      courseAz?: string;
      courseRu?: string;
      courseEn?: string;
      isActive?: boolean;
      order?: number;
    };

    const testimonial = await server.prisma.testimonial.create({
      data: body,
    });

    return reply.status(201).send({ success: true, data: testimonial });
  });

  // PUT /:id - Update testimonial (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      photo?: string;
      textAz?: string;
      textRu?: string;
      textEn?: string;
      rating?: number;
      courseAz?: string;
      courseRu?: string;
      courseEn?: string;
      isActive?: boolean;
      order?: number;
    };

    const existing = await server.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Testimonial not found' });
    }

    const testimonial = await server.prisma.testimonial.update({
      where: { id },
      data: body,
    });

    return reply.send({ success: true, data: testimonial });
  });

  // DELETE /:id - Delete testimonial (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Testimonial not found' });
    }

    await server.prisma.testimonial.delete({ where: { id } });

    return reply.send({ success: true, message: 'Testimonial deleted successfully' });
  });
}
