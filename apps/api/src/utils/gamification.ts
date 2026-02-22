import { PrismaClient } from '@prisma/client';
import { sendEmail, emailBadgeEarned } from './email.js';

const prisma = new PrismaClient();

// ========== XP System ==========

export async function awardXP(
  studentId: string,
  amount: number,
  reason: string,
  sourceId?: string
): Promise<void> {
  try {
    // Create XP transaction
    await prisma.xPTransaction.create({
      data: { studentId, amount, reason, sourceId },
    });

    // Update total XP
    await prisma.student.update({
      where: { id: studentId },
      data: { xpTotal: { increment: amount } },
    });

    // Check badges after XP change
    await checkAndAwardBadges(studentId);
  } catch (error) {
    console.error(`[XP ERROR] Failed to award ${amount} XP to student ${studentId}:`, error);
  }
}

// ========== Badge System ==========

export async function checkAndAwardBadges(studentId: string): Promise<void> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        studentBadges: { select: { badgeId: true } },
      },
    });
    if (!student) return;

    const existingBadgeIds = new Set(student.studentBadges.map(sb => sb.badgeId));

    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
    });

    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue;

      const condition = badge.condition as { type: string; value: number };
      const met = await isConditionMet(studentId, condition, student.xpTotal);

      if (met) {
        // Award badge
        await prisma.studentBadge.create({
          data: { studentId, badgeId: badge.id },
        });

        // Award bonus XP from badge
        if (badge.xpReward > 0) {
          await prisma.xPTransaction.create({
            data: {
              studentId,
              amount: badge.xpReward,
              reason: 'badge_earned',
              sourceId: badge.id,
            },
          });
          await prisma.student.update({
            where: { id: studentId },
            data: { xpTotal: { increment: badge.xpReward } },
          });
        }

        // Notification
        await prisma.notification.create({
          data: {
            userId: studentId,
            userType: 'student',
            type: 'BADGE_EARNED',
            title: `Badge Earned: ${badge.name}`,
            message: `Congratulations! You earned the "${badge.name}" badge! ${badge.icon}`,
            link: '/lms/student/achievements',
          },
        });

        // Email (async, don't await)
        if (student.emailNotifications) {
          const { subject, html } = emailBadgeEarned(student.name, badge.name, badge.icon, badge.description);
          sendEmail(student.email, subject, html).catch(() => {});
        }

        console.log(`[BADGE] Awarded "${badge.name}" to student ${student.name}`);
      }
    }
  } catch (error) {
    console.error(`[BADGE ERROR] Failed to check badges for student ${studentId}:`, error);
  }
}

async function isConditionMet(
  studentId: string,
  condition: { type: string; value: number },
  xpTotal: number
): Promise<boolean> {
  switch (condition.type) {
    case 'lessons_completed': {
      const count = await prisma.lessonProgress.count({
        where: { studentId, status: 'COMPLETED' },
      });
      return count >= condition.value;
    }

    case 'quizzes_passed': {
      const count = await prisma.quizAttempt.count({
        where: {
          studentId,
          status: { in: ['COMPLETED', 'GRADED'] },
          score: { gte: 60 },
        },
      });
      return count >= condition.value;
    }

    case 'quizzes_high_score': {
      const count = await prisma.quizAttempt.count({
        where: {
          studentId,
          status: { in: ['COMPLETED', 'GRADED'] },
          score: { gte: 90 },
        },
      });
      return count >= condition.value;
    }

    case 'perfect_quiz_score': {
      const count = await prisma.quizAttempt.count({
        where: {
          studentId,
          status: { in: ['COMPLETED', 'GRADED'] },
          score: { gte: 100 },
        },
      });
      return count >= condition.value;
    }

    case 'assignments_submitted': {
      const count = await prisma.assignmentSubmission.count({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'GRADED'] },
        },
      });
      return count >= condition.value;
    }

    case 'assignments_on_time': {
      // Count submissions submitted before due date
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'GRADED'] },
          submittedAt: { not: null },
        },
        include: { assignment: { select: { dueDate: true } } },
      });
      const onTimeCount = submissions.filter(s => {
        if (!s.assignment.dueDate || !s.submittedAt) return false;
        return s.submittedAt <= s.assignment.dueDate;
      }).length;
      return onTimeCount >= condition.value;
    }

    case 'early_submission': {
      // Submitted at least 24h before due date
      const submissions = await prisma.assignmentSubmission.findMany({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'GRADED'] },
          submittedAt: { not: null },
        },
        include: { assignment: { select: { dueDate: true } } },
      });
      const earlyCount = submissions.filter(s => {
        if (!s.assignment.dueDate || !s.submittedAt) return false;
        const diff = s.assignment.dueDate.getTime() - s.submittedAt.getTime();
        return diff >= 24 * 60 * 60 * 1000; // 24 hours in ms
      }).length;
      return earlyCount >= condition.value;
    }

    case 'perfect_attendance_month': {
      // Check attendance for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const totalClasses = await prisma.attendance.count({
        where: { studentId, date: { gte: startOfMonth, lte: endOfMonth } },
      });
      const presentClasses = await prisma.attendance.count({
        where: { studentId, date: { gte: startOfMonth, lte: endOfMonth }, status: 'PRESENT' },
      });
      return totalClasses >= 4 && presentClasses === totalClasses; // At least 4 classes, all present
    }

    case 'certificates_earned': {
      const count = await prisma.certificate.count({
        where: { studentId, status: 'ACTIVE' },
      });
      return count >= condition.value;
    }

    case 'xp_total': {
      return xpTotal >= condition.value;
    }

    default:
      return false;
  }
}
