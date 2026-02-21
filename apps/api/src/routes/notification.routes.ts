import { FastifyInstance } from 'fastify';
import { anyAuth, adminAuth } from '../middleware/auth.middleware.js';

export async function notificationRoutes(server: FastifyInstance) {
  // All routes require authentication
  server.addHook('preHandler', anyAuth);

  // GET / — Get my notifications (any user type)
  server.get('/', async (request, reply) => {
    const { id, type } = request.user;
    const { page = '1', limit = '20', unreadOnly } = request.query as {
      page?: string;
      limit?: string;
      unreadOnly?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId: id, userType: type };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [data, total, unreadCount] = await Promise.all([
      server.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.notification.count({ where }),
      server.prisma.notification.count({ where: { userId: id, userType: type, isRead: false } }),
    ]);

    return reply.send({
      success: true,
      data,
      total,
      unreadCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  });

  // GET /unread-count — Quick endpoint to get unread count (for badge)
  server.get('/unread-count', async (request, reply) => {
    const { id, type } = request.user;

    const count = await server.prisma.notification.count({
      where: { userId: id, userType: type, isRead: false },
    });

    return reply.send({ success: true, data: { count } });
  });

  // PUT /:notificationId/read — Mark single notification as read
  server.put('/:notificationId/read', async (request, reply) => {
    const { id, type } = request.user;
    const { notificationId } = request.params as { notificationId: string };

    const notification = await server.prisma.notification.findFirst({
      where: { id: notificationId, userId: id, userType: type },
    });

    if (!notification) {
      return reply.status(404).send({ success: false, message: 'Notification not found' });
    }

    const updated = await server.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return reply.send({ success: true, data: updated });
  });

  // PUT /read-all — Mark all notifications as read
  server.put('/read-all', async (request, reply) => {
    const { id, type } = request.user;

    const result = await server.prisma.notification.updateMany({
      where: { userId: id, userType: type, isRead: false },
      data: { isRead: true },
    });

    return reply.send({ success: true, data: { updated: result.count } });
  });

  // DELETE /:notificationId — Delete a notification
  server.delete('/:notificationId', async (request, reply) => {
    const { id, type } = request.user;
    const { notificationId } = request.params as { notificationId: string };

    const notification = await server.prisma.notification.findFirst({
      where: { id: notificationId, userId: id, userType: type },
    });

    if (!notification) {
      return reply.status(404).send({ success: false, message: 'Notification not found' });
    }

    await server.prisma.notification.delete({ where: { id: notificationId } });
    return reply.send({ success: true, message: 'Notification deleted' });
  });

  // DELETE /clear-all — Delete all read notifications
  server.delete('/clear-all', async (request, reply) => {
    const { id, type } = request.user;

    const result = await server.prisma.notification.deleteMany({
      where: { userId: id, userType: type, isRead: true },
    });

    return reply.send({ success: true, data: { deleted: result.count } });
  });
}
