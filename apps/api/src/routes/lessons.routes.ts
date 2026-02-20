import { FastifyInstance } from 'fastify';
import { MaterialType } from '@prisma/client';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function lessonRoutes(server: FastifyInstance) {
  // ═══════════════════════════════════════
  // LESSONS
  // ═══════════════════════════════════════

  // GET /courses/:courseId/lessons — List lessons for a course (with materials)
  server.get('/courses/:courseId/lessons', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };

    const course = await server.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    const lessons = await server.prisma.lesson.findMany({
      where: { courseId },
      include: {
        materials: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return reply.send({ success: true, data: lessons });
  });

  // POST /courses/:courseId/lessons — Create a lesson
  server.post('/courses/:courseId/lessons', { preHandler: [adminAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const body = request.body as {
      titleAz: string;
      titleRu: string;
      titleEn: string;
      descAz?: string;
      descRu?: string;
      descEn?: string;
      order?: number;
      isPublished?: boolean;
    };

    const course = await server.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    // Auto-set order to max+1 if not provided
    let order = body.order;
    if (order === undefined) {
      const maxOrder = await server.prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const lesson = await server.prisma.lesson.create({
      data: {
        courseId,
        titleAz: body.titleAz,
        titleRu: body.titleRu,
        titleEn: body.titleEn,
        descAz: body.descAz,
        descRu: body.descRu,
        descEn: body.descEn,
        order,
        isPublished: body.isPublished ?? false,
      },
      include: {
        materials: true,
      },
    });

    return reply.status(201).send({ success: true, data: lesson });
  });

  // PUT /lessons/:id — Update a lesson
  server.put('/lessons/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      titleAz?: string;
      titleRu?: string;
      titleEn?: string;
      descAz?: string;
      descRu?: string;
      descEn?: string;
      order?: number;
      isPublished?: boolean;
    };

    const existing = await server.prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Lesson not found' });
    }

    const lesson = await server.prisma.lesson.update({
      where: { id },
      data: body,
      include: {
        materials: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return reply.send({ success: true, data: lesson });
  });

  // DELETE /lessons/:id — Delete a lesson (cascades materials)
  server.delete('/lessons/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Lesson not found' });
    }

    await server.prisma.lesson.delete({ where: { id } });
    return reply.send({ success: true, message: 'Lesson deleted' });
  });

  // PUT /lessons/reorder — Reorder lessons within a course
  server.put('/lessons/reorder', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as { lessonIds: string[] };

    if (!body.lessonIds || !Array.isArray(body.lessonIds)) {
      return reply.status(400).send({ success: false, message: 'lessonIds array required' });
    }

    await server.prisma.$transaction(
      body.lessonIds.map((id, index) =>
        server.prisma.lesson.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return reply.send({ success: true, message: 'Lessons reordered' });
  });

  // ═══════════════════════════════════════
  // MATERIALS
  // ═══════════════════════════════════════

  // POST /lessons/:lessonId/materials — Add material to a lesson
  server.post('/lessons/:lessonId/materials', { preHandler: [adminAuth] }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const body = request.body as {
      title: string;
      type: string;
      url: string;
      order?: number;
    };

    const lesson = await server.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return reply.status(404).send({ success: false, message: 'Lesson not found' });
    }

    // Validate type
    const validTypes = ['SLIDES', 'DOCUMENT', 'VIDEO', 'SPREADSHEET', 'LINK', 'FILE'];
    if (!validTypes.includes(body.type)) {
      return reply.status(400).send({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Auto-set order
    let order = body.order;
    if (order === undefined) {
      const maxOrder = await server.prisma.lessonMaterial.findFirst({
        where: { lessonId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = (maxOrder?.order ?? -1) + 1;
    }

    const material = await server.prisma.lessonMaterial.create({
      data: {
        lessonId,
        title: body.title,
        type: body.type as MaterialType,
        url: body.url,
        order,
      },
    });

    return reply.status(201).send({ success: true, data: material });
  });

  // PUT /materials/:id — Update a material
  server.put('/materials/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      type?: string;
      url?: string;
      order?: number;
    };

    const existing = await server.prisma.lessonMaterial.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Material not found' });
    }

    const validTypes = ['SLIDES', 'DOCUMENT', 'VIDEO', 'SPREADSHEET', 'LINK', 'FILE'];
    if (body.type && !validTypes.includes(body.type)) {
      return reply.status(400).send({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const material = await server.prisma.lessonMaterial.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type ? (body.type as MaterialType) : undefined,
        url: body.url,
        order: body.order,
      },
    });

    return reply.send({ success: true, data: material });
  });

  // DELETE /materials/:id — Delete a material
  server.delete('/materials/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.lessonMaterial.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Material not found' });
    }

    await server.prisma.lessonMaterial.delete({ where: { id } });
    return reply.send({ success: true, message: 'Material deleted' });
  });

  // PUT /materials/reorder — Reorder materials within a lesson
  server.put('/materials/reorder', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as { materialIds: string[] };

    if (!body.materialIds || !Array.isArray(body.materialIds)) {
      return reply.status(400).send({ success: false, message: 'materialIds array required' });
    }

    await server.prisma.$transaction(
      body.materialIds.map((id, index) =>
        server.prisma.lessonMaterial.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return reply.send({ success: true, message: 'Materials reordered' });
  });
}
