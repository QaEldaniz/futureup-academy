import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { adminAuth, studentAuth, adminOrTeacherAuth } from '../middleware/auth.middleware.js';
import {
  getClaudeClient,
  buildTutorSystemPrompt,
  buildQuizGenerationPrompt,
  buildAnalyticsPrompt,
  TutorMaterial,
} from '../utils/claude.js';
import { awardXP, checkAndAwardBadges } from '../utils/gamification.js';

/* ================================================================== */
/* AI Tutor Routes                                                     */
/* ================================================================== */

export async function aiTutorRoutes(server: FastifyInstance) {

  // ============================================================
  // TEACHER/ADMIN: Config & Materials
  // ============================================================

  // GET /config/:courseId — Get AI tutor config
  server.get('/config/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const config = await server.prisma.aiTutorConfig.findUnique({ where: { courseId } });
    return reply.send({ success: true, data: config || { courseId, isEnabled: false, socraticMode: true, locale: 'en' } });
  });

  // PUT /config/:courseId — Create/update AI tutor config
  server.put('/config/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const body = request.body as {
      isEnabled?: boolean;
      socraticMode?: boolean;
      locale?: string;
      systemPromptExtra?: string;
    };

    // Verify course exists
    const course = await server.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return reply.status(404).send({ success: false, message: 'Course not found' });

    // Verify teacher assignment (skip for admin)
    if (request.user.type !== 'admin') {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: request.user.id, courseId } },
      });
      if (!tc) return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
    }

    const config = await server.prisma.aiTutorConfig.upsert({
      where: { courseId },
      create: { courseId, ...body },
      update: body,
    });

    return reply.send({ success: true, data: config });
  });

  // GET /materials/:courseId — List materials
  server.get('/materials/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const materials = await server.prisma.aiTutorMaterial.findMany({
      where: { courseId },
      include: { lesson: { select: { id: true, titleEn: true, titleAz: true, titleRu: true, order: true } } },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return reply.send({ success: true, data: materials });
  });

  // POST /materials/:courseId — Add material
  server.post('/materials/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { title, content, tags, notes, lessonId, order } = request.body as {
      title: string;
      content: string;
      tags?: string[];
      notes?: string;
      lessonId?: string;
      order?: number;
    };

    if (!title || !content) {
      return reply.status(400).send({ success: false, message: 'Title and content are required' });
    }

    const material = await server.prisma.aiTutorMaterial.create({
      data: { courseId, lessonId: lessonId || null, title, content, tags: tags || [], notes, order: order || 0 },
      include: { lesson: { select: { id: true, titleEn: true, titleAz: true, titleRu: true } } },
    });

    return reply.status(201).send({ success: true, data: material });
  });

  // PUT /materials/:id — Update material
  server.put('/materials/:id', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { title?: string; content?: string; tags?: string[]; notes?: string; lessonId?: string; order?: number };

    const material = await server.prisma.aiTutorMaterial.update({
      where: { id },
      data: { ...body, lessonId: body.lessonId || null },
      include: { lesson: { select: { id: true, titleEn: true, titleAz: true, titleRu: true } } },
    });

    return reply.send({ success: true, data: material });
  });

  // DELETE /materials/:id — Delete material
  server.delete('/materials/:id', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await server.prisma.aiTutorMaterial.delete({ where: { id } });
    return reply.send({ success: true });
  });

  // GET /feedback/:courseId — Student feedback summary
  server.get('/feedback/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };

    const sessions = await server.prisma.aiChatSession.findMany({
      where: { courseId },
      include: {
        feedback: true,
        student: { select: { id: true, name: true } },
      },
    });

    const allFeedback = sessions.flatMap(s =>
      s.feedback.map(f => ({
        ...f,
        studentName: s.student.name,
        studentId: s.student.id,
      }))
    );

    const thumbsUp = allFeedback.filter(f => f.rating === 1).length;
    const thumbsDown = allFeedback.filter(f => f.rating === -1).length;

    return reply.send({
      success: true,
      data: {
        totalFeedback: allFeedback.length,
        thumbsUp,
        thumbsDown,
        satisfactionRate: allFeedback.length > 0 ? Math.round((thumbsUp / allFeedback.length) * 100) : 0,
        recentNegative: allFeedback
          .filter(f => f.rating === -1 && f.comment)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10),
        totalSessions: sessions.length,
        totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      },
    });
  });

  // ============================================================
  // STUDENT: Chat, Profile, Feedback
  // ============================================================

  // GET /check/:courseId — Is AI tutor enabled?
  server.get('/check/:courseId', { preHandler: [studentAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const config = await server.prisma.aiTutorConfig.findUnique({ where: { courseId } });
    return reply.send({ success: true, data: { enabled: config?.isEnabled ?? false } });
  });

  // GET /profile — Get student AI profile
  server.get('/profile', { preHandler: [studentAuth] }, async (request, reply) => {
    const profile = await server.prisma.studentAiProfile.findUnique({
      where: { studentId: request.user.id },
    });
    return reply.send({ success: true, data: profile });
  });

  // POST /profile/survey — Save survey answers
  server.post('/profile/survey', { preHandler: [studentAuth] }, async (request, reply) => {
    const body = request.body as {
      interests?: string[];
      learningStyle?: string;
      personality?: string;
      motivation?: string;
      preferredPace?: string;
    };

    const profile = await server.prisma.studentAiProfile.upsert({
      where: { studentId: request.user.id },
      create: {
        studentId: request.user.id,
        ...body,
        surveyCompleted: true,
        lastSurveyAt: new Date(),
      },
      update: {
        ...body,
        surveyCompleted: true,
        lastSurveyAt: new Date(),
      },
    });

    // Award XP for completing survey
    try {
      await awardXP(request.user.id, 3, 'ai_survey_completed', profile.id);
    } catch {}

    return reply.send({ success: true, data: profile });
  });

  // GET /history/:courseId — Chat history
  server.get('/history/:courseId', { preHandler: [studentAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const session = await server.prisma.aiChatSession.findUnique({
      where: { studentId_courseId: { studentId: request.user.id, courseId } },
      include: { feedback: true },
    });
    return reply.send({
      success: true,
      data: session ? { sessionId: session.id, messages: session.messages, feedback: session.feedback } : { messages: [], feedback: [] },
    });
  });

  // DELETE /history/:courseId — Clear chat
  server.delete('/history/:courseId', { preHandler: [studentAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    await server.prisma.aiChatSession.deleteMany({
      where: { studentId: request.user.id, courseId },
    });
    return reply.send({ success: true });
  });

  // POST /feedback — Submit thumbs up/down
  server.post('/feedback', { preHandler: [studentAuth] }, async (request, reply) => {
    const { sessionId, messageIndex, rating, comment } = request.body as {
      sessionId: string;
      messageIndex: number;
      rating: number;
      comment?: string;
    };

    if (![1, -1].includes(rating)) {
      return reply.status(400).send({ success: false, message: 'Rating must be 1 or -1' });
    }

    // Verify session belongs to this student
    const session = await server.prisma.aiChatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.studentId !== request.user.id) {
      return reply.status(403).send({ success: false, message: 'Invalid session' });
    }

    const feedback = await server.prisma.aiFeedback.upsert({
      where: { sessionId_messageIndex: { sessionId, messageIndex } },
      create: { sessionId, studentId: request.user.id, messageIndex, rating, comment },
      update: { rating, comment },
    });

    // Award XP for feedback
    try {
      await awardXP(request.user.id, 2, 'ai_feedback', feedback.id);
    } catch {}

    return reply.send({ success: true, data: feedback });
  });

  // POST /chat/:courseId — Main chat (streaming)
  server.post('/chat/:courseId', {
    preHandler: [studentAuth],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { message, lessonId, assignmentId } = request.body as {
      message: string;
      lessonId?: string;
      assignmentId?: string;
    };

    if (!message || message.trim().length === 0) {
      return reply.status(400).send({ success: false, message: 'Message is required' });
    }
    if (message.length > 4000) {
      return reply.status(400).send({ success: false, message: 'Message too long (max 4000 characters)' });
    }

    // 1. Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: request.user.id, courseId } },
    });
    if (!enrollment) return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });

    // 2. Verify AI tutor is enabled
    const config = await server.prisma.aiTutorConfig.findUnique({ where: { courseId } });
    if (!config?.isEnabled) return reply.status(403).send({ success: false, message: 'AI tutor not enabled for this course' });

    // 3. Load course info
    const course = await server.prisma.course.findUnique({
      where: { id: courseId },
      select: { titleEn: true, titleAz: true, titleRu: true },
    });

    // 4. Load lesson info (if provided)
    let lessonName: string | undefined;
    if (lessonId) {
      const lesson = await server.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { titleEn: true },
      });
      lessonName = lesson?.titleEn;
    }

    // 5. Load assignment (if homework help)
    let assignmentText: string | undefined;
    if (assignmentId) {
      const assignment = await server.prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { title: true, description: true },
      });
      assignmentText = assignment ? `${assignment.title}\n${assignment.description || ''}` : undefined;
    }

    // 6. Load materials (course-level + lesson-specific)
    const rawMaterials = await server.prisma.aiTutorMaterial.findMany({
      where: lessonId
        ? { courseId, OR: [{ lessonId: null }, { lessonId }] }
        : { courseId },
      orderBy: { order: 'asc' },
    });

    const materials: TutorMaterial[] = rawMaterials.map(m => ({
      title: m.title,
      content: m.content,
      tags: (m.tags as string[]) || undefined,
      notes: m.notes || undefined,
    }));

    // 7. Load student profile
    const aiProfile = await server.prisma.studentAiProfile.findUnique({
      where: { studentId: request.user.id },
    });

    // 8. Load or create session
    let session = await server.prisma.aiChatSession.findUnique({
      where: { studentId_courseId: { studentId: request.user.id, courseId } },
    });

    if (!session) {
      session = await server.prisma.aiChatSession.create({
        data: { studentId: request.user.id, courseId, lessonId, messages: [], messageCount: 0 },
      });
    }

    // 9. Build system prompt
    const systemPrompt = buildTutorSystemPrompt({
      courseName: course?.titleEn || 'Course',
      lessonName,
      materials,
      socraticMode: config.socraticMode,
      locale: config.locale,
      studentProfile: aiProfile ? {
        interests: (aiProfile.interests as string[]) || undefined,
        learningStyle: aiProfile.learningStyle || undefined,
        personality: aiProfile.personality || undefined,
        motivation: aiProfile.motivation || undefined,
        preferredPace: aiProfile.preferredPace || undefined,
        strengths: (aiProfile.strengths as string[]) || undefined,
        weaknesses: (aiProfile.weaknesses as string[]) || undefined,
      } : undefined,
      extraInstructions: config.systemPromptExtra || undefined,
      isHomeworkHelp: !!assignmentId,
      assignmentText,
    });

    // 10. Prepare messages history (last 20)
    const existingMessages = (session.messages as any[]) || [];
    const userMsg = { role: 'user', content: message.trim(), timestamp: new Date().toISOString() };
    const allMsgs = [...existingMessages, userMsg];
    const trimmed = allMsgs.slice(-20);

    // 11. Stream response from Claude
    try {
      const anthropic = getClaudeClient();

      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: trimmed.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      // Hijack reply for raw streaming (same pattern as chat.routes.ts)
      reply.hijack();
      const allowedOrigins = [
        'http://localhost:3000',
        'https://futureupacademy.az',
        'https://www.futureupacademy.az',
      ];
      const origin = request.headers.origin || '';
      const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
      reply.raw.writeHead(200, {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Credentials': 'true',
      });

      let fullResponse = '';

      stream.on('text', (text) => {
        fullResponse += text;
        reply.raw.write(JSON.stringify({ token: text }) + '\n');
      });

      stream.on('end', async () => {
        // Save to session
        const assistantMsg = { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() };
        const updatedMessages = [...allMsgs, assistantMsg];

        try {
          await server.prisma.aiChatSession.update({
            where: { id: session!.id },
            data: {
              messages: updatedMessages,
              messageCount: updatedMessages.length,
              lessonId: lessonId || session!.lessonId,
            },
          });

          // Award XP (cap at 50/day/course)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayXP = await server.prisma.xPTransaction.count({
            where: {
              studentId: request.user.id,
              reason: 'ai_tutor_question',
              sourceId: courseId,
              createdAt: { gte: today },
            },
          });
          if (todayXP < 10) { // 10 questions × 5 XP = 50 cap
            await awardXP(request.user.id, 5, 'ai_tutor_question', courseId);
          }
        } catch (saveErr) {
          server.log.error(saveErr, 'Failed to save chat session or award XP');
        }

        reply.raw.end(JSON.stringify({ done: true, sessionId: session!.id }) + '\n');
      });

      stream.on('error', (error) => {
        server.log.error(error, 'AI Tutor streaming error');
        reply.raw.end(JSON.stringify({ error: 'AI service error. Please try again.' }) + '\n');
      });

    } catch (error: any) {
      server.log.error(error, 'AI Tutor error');
      if (reply.raw.headersSent) {
        reply.raw.end(JSON.stringify({ error: 'AI service error' }) + '\n');
      } else {
        return reply.status(500).send({ success: false, message: 'AI service error. Please try again.' });
      }
    }
  });

  // NOTE: /help-homework removed — frontend calls /chat/:courseId with assignmentId directly

  // ============================================================
  // QUIZ GENERATION
  // ============================================================

  // POST /generate-quiz/:courseId/:lessonId — AI generates quiz
  server.post('/generate-quiz/:courseId/:lessonId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId, lessonId } = request.params as { courseId: string; lessonId: string };
    const { questionCount = 5, locale = 'en' } = request.body as { questionCount?: number; locale?: string };

    // Load lesson
    const lesson = await server.prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
    if (!lesson) return reply.status(404).send({ success: false, message: 'Lesson not found' });

    // Load materials
    const rawMaterials = await server.prisma.aiTutorMaterial.findMany({
      where: { courseId, OR: [{ lessonId }, { lessonId: null }] },
      orderBy: { order: 'asc' },
    });

    if (rawMaterials.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'No AI tutor materials found. Please add materials first.',
      });
    }

    const materials: TutorMaterial[] = rawMaterials.map(m => ({
      title: m.title,
      content: m.content,
      tags: (m.tags as string[]) || undefined,
      notes: m.notes || undefined,
    }));

    try {
      const anthropic = getClaudeClient();
      const prompt = buildQuizGenerationPrompt({
        lessonTitle: lesson.titleEn,
        materials,
        questionCount: Math.min(questionCount, 15),
        locale,
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse JSON from response
      let questions: any[];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found');
        questions = JSON.parse(jsonMatch[0]);
      } catch {
        return reply.status(500).send({ success: false, message: 'Failed to parse AI response. Please try again.' });
      }

      // Create quiz using existing pattern
      const quiz = await server.prisma.quiz.create({
        data: {
          courseId,
          teacherId: request.user.type === 'admin' ? null : request.user.id,
          title: `${lesson.titleEn} — AI Quiz`,
          description: `Auto-generated quiz for lesson: ${lesson.titleEn}`,
          maxAttempts: 3,
          passingScore: 60,
          showResults: true,
          shuffleQuestions: true,
          isPublished: false, // Teacher reviews first
          questions: {
            create: questions.map((q: any, idx: number) => {
              const opts = q.options ? q.options.map((opt: string, i: number) => ({ id: String.fromCharCode(97 + i), text: opt })) : [];
              // Map correctAnswer text to option IDs
              const rawAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
              const correctIds = rawAnswers.map((ans: string) => {
                // If already an ID (a, b, c, d...), use as-is
                if (/^[a-z]$/.test(ans)) return ans;
                // Otherwise find matching option by text
                const match = opts.find((o: { id: string; text: string }) =>
                  o.text.toLowerCase().trim() === String(ans).toLowerCase().trim()
                );
                return match ? match.id : ans;
              });
              return {
                type: q.type || 'MULTIPLE_CHOICE',
                question: q.question,
                options: opts,
                correctAnswer: correctIds,
                points: q.points || 10,
                explanation: q.explanation || null,
                order: idx,
              };
            }),
          },
        },
        include: { questions: { orderBy: { order: 'asc' } } },
      });

      return reply.status(201).send({ success: true, data: quiz });
    } catch (error: any) {
      server.log.error(error, 'Quiz generation error');
      return reply.status(500).send({ success: false, message: 'Failed to generate quiz. Please try again.' });
    }
  });

  // ============================================================
  // ANALYTICS — IMPORTANT: literal routes BEFORE parameterized
  // ============================================================

  // GET /analytics/overview — Overall AI stats (admin only)
  // MUST be registered BEFORE /analytics/:courseId to avoid "overview" matching as courseId
  server.get('/analytics/overview', { preHandler: [adminAuth] }, async (request, reply) => {
    const [
      totalSessions,
      totalMessages,
      totalFeedback,
      positiveFeedback,
      totalQuizzesGenerated,
      courseConfigs,
    ] = await Promise.all([
      server.prisma.aiChatSession.count(),
      server.prisma.aiChatSession.aggregate({ _sum: { messageCount: true } }),
      server.prisma.aiFeedback.count(),
      server.prisma.aiFeedback.count({ where: { rating: 1 } }),
      server.prisma.quiz.count({ where: { title: { contains: 'AI Quiz' } } }),
      server.prisma.aiTutorConfig.findMany({
        where: { isEnabled: true },
        include: {
          course: {
            select: {
              id: true, titleEn: true, titleAz: true, titleRu: true,
              _count: { select: { students: true } },
            },
          },
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        totalSessions,
        totalMessages: totalMessages._sum.messageCount || 0,
        totalFeedback,
        satisfactionRate: totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0,
        totalQuizzesGenerated,
        enabledCourses: courseConfigs.map(c => ({
          courseId: c.course.id,
          courseName: c.course.titleEn,
          studentCount: c.course._count.students,
        })),
      },
    });
  });

  // GET /analytics/:courseId/class-overview — Class overview
  // MUST be registered BEFORE /analytics/:courseId/:studentId to avoid "class-overview" matching as studentId
  server.get('/analytics/:courseId/class-overview', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };

    // Get latest snapshots per student
    const snapshots = await server.prisma.aiAnalyticsSnapshot.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, xpTotal: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Deduplicate: keep only the latest per student
    const seen = new Set<string>();
    const latest = snapshots.filter(s => {
      if (seen.has(s.studentId)) return false;
      seen.add(s.studentId);
      return true;
    });

    // Aggregate weaknesses
    const weaknessMap = new Map<string, number>();
    for (const s of latest) {
      for (const w of (s.weaknesses as string[])) {
        weaknessMap.set(w, (weaknessMap.get(w) || 0) + 1);
      }
    }
    const topWeaknesses = [...weaknessMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Students at risk
    const atRisk = latest
      .filter(s => s.engagement === 'struggling' || (s.overallScore !== null && s.overallScore < 40))
      .map(s => ({ studentId: s.studentId, name: s.student.name, score: s.overallScore, engagement: s.engagement }));

    // Excelling students
    const excelling = latest
      .filter(s => s.engagement === 'excelling' || (s.overallScore !== null && s.overallScore >= 85))
      .map(s => ({ studentId: s.studentId, name: s.student.name, score: s.overallScore }));

    return reply.send({
      success: true,
      data: {
        totalStudents: latest.length,
        avgScore: latest.length > 0
          ? Math.round(latest.reduce((sum, s) => sum + (s.overallScore || 0), 0) / latest.length)
          : 0,
        topWeaknesses,
        atRisk,
        excelling,
        engagementDistribution: {
          active: latest.filter(s => s.engagement === 'active').length,
          passive: latest.filter(s => s.engagement === 'passive').length,
          struggling: latest.filter(s => s.engagement === 'struggling').length,
          excelling: latest.filter(s => s.engagement === 'excelling').length,
        },
      },
    });
  });

  // GET /analytics/:courseId — All students analytics
  server.get('/analytics/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { period = 'month' } = request.query as { period?: string };

    const snapshots = await server.prisma.aiAnalyticsSnapshot.findMany({
      where: { courseId, period },
      include: { student: { select: { id: true, name: true, email: true, xpTotal: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ success: true, data: snapshots });
  });

  // POST /analytics/:courseId/generate — Generate analytics for all students
  server.post('/analytics/:courseId/generate', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };
    const { period = 'week', periodRef } = request.body as { period?: string; periodRef?: string };

    const course = await server.prisma.course.findUnique({
      where: { id: courseId },
      select: { titleEn: true },
    });

    // Get enrolled students
    const enrollments = await server.prisma.studentCourse.findMany({
      where: { courseId, status: 'ACTIVE' },
      include: { student: { select: { id: true, name: true } } },
    });

    const config = await server.prisma.aiTutorConfig.findUnique({ where: { courseId } });
    const locale = config?.locale || 'en';
    const anthropic = getClaudeClient();
    const results: any[] = [];

    for (const enrollment of enrollments) {
      const sid = enrollment.student.id;

      // Gather data
      const quizAttempts = await server.prisma.quizAttempt.findMany({
        where: { studentId: sid, quiz: { courseId } },
        select: { score: true, maxPoints: true, totalPoints: true, quizId: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const chatSession = await server.prisma.aiChatSession.findUnique({
        where: { studentId_courseId: { studentId: sid, courseId } },
      });

      const assignments = await server.prisma.assignmentSubmission.findMany({
        where: { studentId: sid, assignment: { courseId } },
        select: { grade: true, status: true, assignmentId: true },
      });

      const prompt = buildAnalyticsPrompt({
        studentName: enrollment.student.name,
        courseName: course?.titleEn || 'Course',
        period,
        quizData: quizAttempts,
        chatSummary: {
          messageCount: chatSession?.messageCount || 0,
          topics: [], // simplified for now
        },
        assignmentData: assignments,
        locale,
      });

      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
        let parsed;
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
          parsed = { strengths: [], weaknesses: [], recommendations: [], overallScore: 0, engagement: 'unknown' };
        }

        const snapshot = await server.prisma.aiAnalyticsSnapshot.create({
          data: {
            studentId: sid,
            courseId,
            period,
            periodRef: periodRef || new Date().toISOString().slice(0, 10),
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            recommendations: parsed.recommendations || [],
            overallScore: parsed.overallScore || null,
            engagement: parsed.engagement || null,
            quizScores: quizAttempts,
            chatActivity: { messageCount: chatSession?.messageCount || 0 },
            assignmentData: assignments,
          },
        });

        // Update student AI profile strengths/weaknesses
        if (parsed.strengths?.length || parsed.weaknesses?.length) {
          await server.prisma.studentAiProfile.upsert({
            where: { studentId: sid },
            create: {
              studentId: sid,
              strengths: parsed.strengths || [],
              weaknesses: parsed.weaknesses || [],
              engagementLevel: parsed.engagement || null,
            },
            update: {
              strengths: parsed.strengths || [],
              weaknesses: parsed.weaknesses || [],
              engagementLevel: parsed.engagement || null,
            },
          });
        }

        results.push({ studentId: sid, studentName: enrollment.student.name, ...parsed });
      } catch (err) {
        server.log.error(err, `Analytics generation failed for student ${sid}`);
        results.push({ studentId: sid, studentName: enrollment.student.name, error: 'Failed to generate' });
      }
    }

    return reply.send({ success: true, data: results });
  });

  // GET /analytics/:courseId/:studentId — Single student analytics
  // MUST be AFTER /analytics/:courseId/class-overview and /analytics/:courseId/generate
  server.get('/analytics/:courseId/:studentId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { courseId, studentId } = request.params as { courseId: string; studentId: string };

    const snapshots = await server.prisma.aiAnalyticsSnapshot.findMany({
      where: { courseId, studentId },
      orderBy: { createdAt: 'desc' },
      take: 12, // Last 12 entries
    });

    const profile = await server.prisma.studentAiProfile.findUnique({ where: { studentId } });

    const chatSession = await server.prisma.aiChatSession.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      select: { messageCount: true, updatedAt: true },
    });

    return reply.send({
      success: true,
      data: { snapshots, profile, chatActivity: chatSession },
    });
  });
}
