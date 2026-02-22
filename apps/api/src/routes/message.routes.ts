import { FastifyInstance } from 'fastify';
import { anyAuth, adminOrTeacherAuth } from '../middleware/auth.middleware.js';

// Helper: look up sender name from Student/Teacher/User tables based on senderType
async function getSenderName(
  prisma: any,
  senderId: string,
  senderType: string
): Promise<string> {
  if (senderType === 'student') {
    const student = await prisma.student.findUnique({
      where: { id: senderId },
      select: { name: true },
    });
    return student?.name || 'Unknown Student';
  }

  if (senderType === 'teacher') {
    const teacher = await prisma.teacher.findUnique({
      where: { id: senderId },
      select: { nameAz: true, nameEn: true },
    });
    return teacher?.nameAz || teacher?.nameEn || 'Unknown Teacher';
  }

  if (senderType === 'admin') {
    const user = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });
    return user?.name || 'Admin';
  }

  return 'Unknown';
}

// Helper: get participant display name
async function getParticipantName(
  prisma: any,
  userId: string,
  userType: string
): Promise<string> {
  return getSenderName(prisma, userId, userType);
}

export async function messageRoutes(server: FastifyInstance) {
  // All routes require authentication
  server.addHook('preHandler', anyAuth);

  // ----------------------------------------------------------------
  // GET / — My conversations with last message and unread count
  // ----------------------------------------------------------------
  server.get('/', async (request, reply) => {
    const { id, type } = request.user;

    // Find all conversations where the current user is a participant
    const participations = await server.prisma.conversationParticipant.findMany({
      where: { userId: id, userType: type },
      select: { conversationId: true, lastReadAt: true },
    });

    if (participations.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    const conversationIds = participations.map((p: any) => p.conversationId);
    const lastReadMap = new Map(
      participations.map((p: any) => [p.conversationId, p.lastReadAt])
    );

    // Fetch conversations with participants and latest message
    const conversations = await server.prisma.conversation.findMany({
      where: { id: { in: conversationIds } },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Build response with participant names and unread counts
    const data = await Promise.all(
      conversations.map(async (conv: any) => {
        const lastReadAt = lastReadMap.get(conv.id);

        // Count unread messages (messages created after lastReadAt, excluding own messages)
        const unreadCount = await server.prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: lastReadAt },
            NOT: { senderId: id, senderType: type },
          },
        });

        // Resolve participant names
        const participantsWithNames = await Promise.all(
          conv.participants.map(async (p: any) => ({
            id: p.id,
            userId: p.userId,
            userType: p.userType,
            name: await getParticipantName(server.prisma, p.userId, p.userType),
          }))
        );

        // Last message preview
        const lastMessage = conv.messages[0] || null;
        let lastMessagePreview = null;
        if (lastMessage) {
          lastMessagePreview = {
            id: lastMessage.id,
            text: lastMessage.text,
            senderId: lastMessage.senderId,
            senderType: lastMessage.senderType,
            senderName: await getSenderName(
              server.prisma,
              lastMessage.senderId,
              lastMessage.senderType
            ),
            createdAt: lastMessage.createdAt,
          };
        }

        return {
          id: conv.id,
          courseId: conv.courseId,
          title: conv.title,
          isGroup: conv.isGroup,
          updatedAt: conv.updatedAt,
          participants: participantsWithNames,
          lastMessage: lastMessagePreview,
          unreadCount,
        };
      })
    );

    return reply.send({ success: true, data });
  });

  // ----------------------------------------------------------------
  // GET /unread-count — Total unread messages count across all conversations
  // ----------------------------------------------------------------
  server.get('/unread-count', async (request, reply) => {
    const { id, type } = request.user;

    const participations = await server.prisma.conversationParticipant.findMany({
      where: { userId: id, userType: type },
      select: { conversationId: true, lastReadAt: true },
    });

    if (participations.length === 0) {
      return reply.send({ success: true, data: { count: 0 } });
    }

    let totalUnread = 0;
    for (const p of participations) {
      const count = await server.prisma.message.count({
        where: {
          conversationId: p.conversationId,
          createdAt: { gt: p.lastReadAt },
          NOT: { senderId: id, senderType: type },
        },
      });
      totalUnread += count;
    }

    return reply.send({ success: true, data: { count: totalUnread } });
  });

  // ----------------------------------------------------------------
  // POST /direct — Create or find direct conversation between two users
  // ----------------------------------------------------------------
  server.post('/direct', async (request, reply) => {
    const { id, type } = request.user;
    const { targetUserId, targetUserType } = request.body as {
      targetUserId: string;
      targetUserType: string;
    };

    if (!targetUserId || !targetUserType) {
      return reply.status(400).send({
        success: false,
        message: 'targetUserId and targetUserType are required',
      });
    }

    if (targetUserId === id && targetUserType === type) {
      return reply.status(400).send({
        success: false,
        message: 'Cannot create a conversation with yourself',
      });
    }

    // Check if a direct (non-group) conversation already exists between these two users
    const existingParticipations = await server.prisma.conversationParticipant.findMany({
      where: { userId: id, userType: type },
      select: { conversationId: true },
    });

    const existingConvIds = existingParticipations.map((p: any) => p.conversationId);

    if (existingConvIds.length > 0) {
      // Find a non-group conversation where the target user is also a participant
      const targetParticipation = await server.prisma.conversationParticipant.findFirst({
        where: {
          conversationId: { in: existingConvIds },
          userId: targetUserId,
          userType: targetUserType,
          conversation: { isGroup: false },
        },
        include: {
          conversation: {
            include: {
              participants: true,
              messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
          },
        },
      });

      if (targetParticipation) {
        return reply.send({ success: true, data: targetParticipation.conversation });
      }
    }

    // Create new direct conversation
    const conversation = await server.prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: id, userType: type },
            { userId: targetUserId, userType: targetUserType },
          ],
        },
      },
      include: {
        participants: true,
      },
    });

    return reply.status(201).send({ success: true, data: conversation });
  });

  // ----------------------------------------------------------------
  // POST /group/:courseId — Create group chat for a course
  // ----------------------------------------------------------------
  server.post(
    '/group/:courseId',
    { preHandler: adminOrTeacherAuth },
    async (request, reply) => {
      const { courseId } = request.params as { courseId: string };

      // Fetch the course with teachers and enrolled students
      const course = await server.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          teachers: { include: { teacher: true } },
          students: {
            where: { status: 'ACTIVE' },
            include: { student: true },
          },
        },
      });

      if (!course) {
        return reply.status(404).send({ success: false, message: 'Course not found' });
      }

      // Check if a group conversation already exists for this course
      const existingGroup = await server.prisma.conversation.findFirst({
        where: { courseId, isGroup: true },
        include: { participants: true },
      });

      if (existingGroup) {
        return reply.status(409).send({
          success: false,
          message: 'Group chat already exists for this course',
          data: existingGroup,
        });
      }

      // Build participant list: teachers + enrolled students
      const participantData: { userId: string; userType: string }[] = [];

      for (const tc of course.teachers) {
        participantData.push({ userId: tc.teacher.id, userType: 'teacher' });
      }

      for (const sc of course.students) {
        participantData.push({ userId: sc.student.id, userType: 'student' });
      }

      // Create the group conversation
      const conversation = await server.prisma.conversation.create({
        data: {
          courseId,
          title: course.titleAz,
          isGroup: true,
          participants: {
            create: participantData,
          },
        },
        include: {
          participants: true,
        },
      });

      return reply.status(201).send({ success: true, data: conversation });
    }
  );

  // ----------------------------------------------------------------
  // GET /:conversationId/messages — Get messages with pagination
  // ----------------------------------------------------------------
  server.get('/:conversationId/messages', async (request, reply) => {
    const { id, type } = request.user;
    const { conversationId } = request.params as { conversationId: string };
    const { page = '1', limit = '50' } = request.query as {
      page?: string;
      limit?: string;
    };

    // Verify user is a participant
    const participant = await server.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: id, userType: type },
    });

    if (!participant) {
      return reply.status(403).send({
        success: false,
        message: 'You are not a participant of this conversation',
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      server.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.message.count({ where: { conversationId } }),
    ]);

    // Enrich messages with sender names
    const data = await Promise.all(
      messages.map(async (msg: any) => ({
        ...msg,
        senderName: await getSenderName(server.prisma, msg.senderId, msg.senderType),
      }))
    );

    return reply.send({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  });

  // ----------------------------------------------------------------
  // POST /:conversationId/messages — Send a message
  // ----------------------------------------------------------------
  server.post('/:conversationId/messages', async (request, reply) => {
    const { id, type } = request.user;
    const { conversationId } = request.params as { conversationId: string };
    const { text, fileUrl, fileName } = request.body as {
      text: string;
      fileUrl?: string;
      fileName?: string;
    };

    if (!text || text.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'Message text is required',
      });
    }

    if (text.length > 10000) {
      return reply.status(400).send({
        success: false,
        message: 'Message text must be under 10000 characters',
      });
    }

    // Verify user is a participant
    const participant = await server.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: id, userType: type },
    });

    if (!participant) {
      return reply.status(403).send({
        success: false,
        message: 'You are not a participant of this conversation',
      });
    }

    // Create the message and update conversation updatedAt
    const [message] = await Promise.all([
      server.prisma.message.create({
        data: {
          conversationId,
          senderId: id,
          senderType: type,
          text: text.trim(),
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        },
      }),
      server.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Get sender name for the notification
    const senderName = await getSenderName(server.prisma, id, type);

    // Get all other participants to create notifications
    const otherParticipants = await server.prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        NOT: { userId: id, userType: type },
      },
    });

    // Create notifications for all other participants
    if (otherParticipants.length > 0) {
      const notificationData = otherParticipants.map((p: any) => ({
        userId: p.userId,
        userType: p.userType,
        type: 'NEW_MESSAGE' as const,
        title: 'New Message',
        message: `${senderName}: ${text.trim().substring(0, 100)}`,
        link: `/messages/${conversationId}`,
      }));

      await server.prisma.notification.createMany({
        data: notificationData,
      });
    }

    return reply.status(201).send({
      success: true,
      data: {
        ...message,
        senderName,
      },
    });
  });

  // ----------------------------------------------------------------
  // PUT /:conversationId/read — Mark conversation as read
  // ----------------------------------------------------------------
  server.put('/:conversationId/read', async (request, reply) => {
    const { id, type } = request.user;
    const { conversationId } = request.params as { conversationId: string };

    // Verify user is a participant
    const participant = await server.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: id, userType: type },
    });

    if (!participant) {
      return reply.status(403).send({
        success: false,
        message: 'You are not a participant of this conversation',
      });
    }

    const updated = await server.prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return reply.send({ success: true, data: updated });
  });
}
