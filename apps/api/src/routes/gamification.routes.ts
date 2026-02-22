import { FastifyInstance } from 'fastify';
import { anyAuth, adminAuth, studentAuth } from '../middleware/auth.middleware.js';
import { awardXP, checkAndAwardBadges } from '../utils/gamification.js';

export async function gamificationRoutes(server: FastifyInstance) {
  // ==========================================
  // PUBLIC / ANY AUTH ENDPOINTS
  // ==========================================

  // GET /badges — All available badges
  server.get('/badges', { preHandler: [anyAuth] }, async (request, reply) => {
    const badges = await server.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return reply.send({ success: true, data: badges });
  });

  // GET /leaderboard/global — Global leaderboard top 20 students
  server.get('/leaderboard/global', { preHandler: [anyAuth] }, async (request, reply) => {
    const students = await server.prisma.student.findMany({
      where: { isActive: true },
      orderBy: { xpTotal: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        photo: true,
        xpTotal: true,
        _count: { select: { studentBadges: true } },
      },
    });

    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      studentId: s.id,
      studentName: s.name,
      photo: s.photo,
      xpTotal: s.xpTotal,
      badgeCount: s._count.studentBadges,
    }));

    return reply.send({ success: true, data: leaderboard });
  });

  // GET /leaderboard/:courseId — Course leaderboard top 20 students
  server.get('/leaderboard/:courseId', { preHandler: [anyAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };

    // Verify course exists
    const course = await server.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, titleEn: true, titleAz: true, titleRu: true },
    });

    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    // Get all students enrolled in this course
    const enrollments = await server.prisma.studentCourse.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            photo: true,
            xpTotal: true,
            isActive: true,
            _count: { select: { studentBadges: true } },
          },
        },
      },
    });

    const students = enrollments
      .filter((e) => e.student.isActive)
      .map((e) => e.student)
      .sort((a, b) => b.xpTotal - a.xpTotal)
      .slice(0, 20);

    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      studentId: s.id,
      studentName: s.name,
      photo: s.photo,
      xpTotal: s.xpTotal,
      badgeCount: s._count.studentBadges,
    }));

    return reply.send({ success: true, data: leaderboard, course });
  });

  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  // GET /my/badges — My earned badges
  server.get('/my/badges', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;

    const studentBadges = await server.prisma.studentBadge.findMany({
      where: { studentId: id },
      include: {
        badge: true,
      },
      orderBy: { awardedAt: 'desc' },
    });

    // Group by category
    const grouped: Record<string, Array<{ id: string; badgeId: string; awardedAt: Date; badge: any }>> = {};
    for (const sb of studentBadges) {
      const category = sb.badge.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(sb);
    }

    return reply.send({ success: true, data: { badges: studentBadges, byCategory: grouped } });
  });

  // GET /my/xp — My XP info
  server.get('/my/xp', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;

    const student = await server.prisma.student.findUnique({
      where: { id },
      select: { xpTotal: true },
    });

    if (!student) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    // Recent transactions (last 20)
    const recentTransactions = await server.prisma.xPTransaction.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Rank among all students
    const rank = await server.prisma.student.count({
      where: {
        isActive: true,
        xpTotal: { gt: student.xpTotal },
      },
    });

    return reply.send({
      success: true,
      data: {
        xpTotal: student.xpTotal,
        recentTransactions,
        rank: rank + 1,
      },
    });
  });

  // GET /my/summary — Full gamification summary
  server.get('/my/summary', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;

    const student = await server.prisma.student.findUnique({
      where: { id },
      select: { xpTotal: true },
    });

    if (!student) {
      return reply.status(404).send({ success: false, message: 'Student not found' });
    }

    // Rank
    const higherCount = await server.prisma.student.count({
      where: {
        isActive: true,
        xpTotal: { gt: student.xpTotal },
      },
    });
    const rank = higherCount + 1;

    // Total available badges
    const totalBadges = await server.prisma.badge.count({
      where: { isActive: true },
    });

    // Earned badges
    const earnedBadges = await server.prisma.studentBadge.findMany({
      where: { studentId: id },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });

    // Recent badges (last 5)
    const recentBadges = earnedBadges.slice(0, 5);

    // Next badges: closest unearned badges
    const earnedBadgeIds = new Set(earnedBadges.map((sb) => sb.badgeId));
    const allActiveBadges = await server.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const nextBadges = allActiveBadges
      .filter((b) => !earnedBadgeIds.has(b.id))
      .slice(0, 5);

    return reply.send({
      success: true,
      data: {
        xpTotal: student.xpTotal,
        rank,
        totalBadges,
        earnedBadges: earnedBadges.length,
        recentBadges,
        nextBadges,
      },
    });
  });

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  // POST /admin/badges — Create a badge
  server.post('/admin/badges', { preHandler: [adminAuth] }, async (request, reply) => {
    const { code, name, description, icon, category, condition, xpReward } = request.body as {
      code: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      condition: Record<string, any>;
      xpReward: number;
    };

    if (!code || !name || !description || !icon || !category || !condition) {
      return reply.status(400).send({ success: false, message: 'Missing required fields' });
    }

    // Check for duplicate code
    const existing = await server.prisma.badge.findUnique({
      where: { code },
    });

    if (existing) {
      return reply.status(409).send({ success: false, message: `Badge with code "${code}" already exists` });
    }

    // Get the next order value
    const maxOrder = await server.prisma.badge.aggregate({
      _max: { order: true },
    });

    const badge = await server.prisma.badge.create({
      data: {
        code,
        name,
        description,
        icon,
        category,
        condition,
        xpReward: xpReward || 0,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    return reply.status(201).send({ success: true, data: badge });
  });

  // PUT /admin/badges/:badgeId — Update a badge
  server.put('/admin/badges/:badgeId', { preHandler: [adminAuth] }, async (request, reply) => {
    const { badgeId } = request.params as { badgeId: string };
    const updates = request.body as {
      code?: string;
      name?: string;
      description?: string;
      icon?: string;
      category?: string;
      condition?: Record<string, any>;
      xpReward?: number;
      isActive?: boolean;
      order?: number;
    };

    const existing = await server.prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Badge not found' });
    }

    // If updating code, check for uniqueness
    if (updates.code && updates.code !== existing.code) {
      const duplicate = await server.prisma.badge.findUnique({
        where: { code: updates.code },
      });
      if (duplicate) {
        return reply.status(409).send({ success: false, message: `Badge with code "${updates.code}" already exists` });
      }
    }

    const badge = await server.prisma.badge.update({
      where: { id: badgeId },
      data: updates,
    });

    return reply.send({ success: true, data: badge });
  });

  // POST /admin/seed-badges — Seed all default badges
  server.post('/admin/seed-badges', { preHandler: [adminAuth] }, async (request, reply) => {
    const defaultBadges = [
      {
        code: 'FIRST_LESSON',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'learning',
        condition: { type: 'lessons_completed', value: 1 },
        xpReward: 50,
      },
      {
        code: 'LESSON_MASTER',
        name: 'Lesson Master',
        description: 'Complete 10 lessons',
        icon: '📚',
        category: 'learning',
        condition: { type: 'lessons_completed', value: 10 },
        xpReward: 200,
      },
      {
        code: 'FIRST_QUIZ',
        name: 'Quiz Taker',
        description: 'Pass your first quiz',
        icon: '✏️',
        category: 'quiz',
        condition: { type: 'quizzes_passed', value: 1 },
        xpReward: 50,
      },
      {
        code: 'QUIZ_MASTER',
        name: 'Quiz Master',
        description: 'Score 90%+ on 5 quizzes',
        icon: '🏆',
        category: 'quiz',
        condition: { type: 'quizzes_high_score', value: 5 },
        xpReward: 300,
      },
      {
        code: 'PERFECT_SCORE',
        name: 'Perfect Score',
        description: 'Score 100% on a quiz',
        icon: '💯',
        category: 'quiz',
        condition: { type: 'perfect_quiz_score', value: 1 },
        xpReward: 100,
      },
      {
        code: 'FIRST_ASSIGNMENT',
        name: 'Homework Hero',
        description: 'Submit your first assignment',
        icon: '📝',
        category: 'learning',
        condition: { type: 'assignments_submitted', value: 1 },
        xpReward: 50,
      },
      {
        code: 'ASSIGNMENT_STREAK',
        name: 'Streak Master',
        description: 'Submit 5 assignments on time',
        icon: '🔥',
        category: 'learning',
        condition: { type: 'assignments_on_time', value: 5 },
        xpReward: 200,
      },
      {
        code: 'PERFECT_ATTENDANCE',
        name: 'Always Present',
        description: 'Perfect attendance for a month',
        icon: '⭐',
        category: 'attendance',
        condition: { type: 'perfect_attendance_month', value: 1 },
        xpReward: 150,
      },
      {
        code: 'EARLY_BIRD',
        name: 'Early Bird',
        description: 'Submit an assignment 24 hours early',
        icon: '🐦',
        category: 'learning',
        condition: { type: 'early_submission', value: 1 },
        xpReward: 75,
      },
      {
        code: 'FIRST_CERT',
        name: 'Certified',
        description: 'Earn your first certificate',
        icon: '🎓',
        category: 'learning',
        condition: { type: 'certificates_earned', value: 1 },
        xpReward: 250,
      },
      {
        code: 'TOP_STUDENT',
        name: 'Top Student',
        description: 'Reach 500 XP',
        icon: '👑',
        category: 'social',
        condition: { type: 'xp_total', value: 500 },
        xpReward: 0,
      },
      {
        code: 'XP_1000',
        name: 'Legend',
        description: 'Reach 1000 XP',
        icon: '🌟',
        category: 'social',
        condition: { type: 'xp_total', value: 1000 },
        xpReward: 0,
      },
    ];

    const results = { created: [] as string[], skipped: [] as string[] };

    for (let i = 0; i < defaultBadges.length; i++) {
      const badge = defaultBadges[i];

      const existing = await server.prisma.badge.findUnique({
        where: { code: badge.code },
      });

      if (existing) {
        results.skipped.push(badge.code);
        continue;
      }

      await server.prisma.badge.create({
        data: {
          ...badge,
          order: i + 1,
        },
      });

      results.created.push(badge.code);
    }

    return reply.send({
      success: true,
      message: `Seeded ${results.created.length} badges, skipped ${results.skipped.length} existing`,
      data: results,
    });
  });
}
