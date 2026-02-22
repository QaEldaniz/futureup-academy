import { FastifyInstance } from 'fastify';
import { anyAuth } from '../middleware/auth.middleware.js';

export async function calendarRoutes(server: FastifyInstance) {
  // GET /events — Get all calendar events for the current user
  server.get('/events', { preHandler: [anyAuth] }, async (request, reply) => {
    const { id, type } = request.user;
    const { from, to } = request.query as { from?: string; to?: string };

    if (!from || !to) {
      return reply.status(400).send({
        success: false,
        message: 'Query params "from" and "to" (ISO date) are required',
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid date format. Use ISO date strings (e.g. 2025-01-01)',
      });
    }

    // -------------------------------------------------------
    // 1. Determine the user's course IDs
    // -------------------------------------------------------
    let courseIds: string[] = [];

    if (type === 'student') {
      const enrollments = await server.prisma.studentCourse.findMany({
        where: { studentId: id, status: 'ACTIVE' },
        select: { courseId: true },
      });
      courseIds = enrollments.map((e) => e.courseId);
    } else if (type === 'teacher' || type === 'admin') {
      const teacherCourses = await server.prisma.teacherCourse.findMany({
        where: { teacherId: id },
        select: { courseId: true },
      });
      courseIds = teacherCourses.map((tc) => tc.courseId);
    }

    if (courseIds.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    // -------------------------------------------------------
    // 2. Fetch courses for title lookup
    // -------------------------------------------------------
    const courses = await server.prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, titleEn: true, titleAz: true, titleRu: true },
    });

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    // -------------------------------------------------------
    // 3. Fetch schedules, assignments, quizzes in parallel
    // -------------------------------------------------------
    const [schedules, assignments, quizzes] = await Promise.all([
      server.prisma.schedule.findMany({
        where: { courseId: { in: courseIds }, isActive: true },
      }),
      server.prisma.assignment.findMany({
        where: {
          courseId: { in: courseIds },
          isActive: true,
          dueDate: { gte: fromDate, lte: toDate },
        },
      }),
      server.prisma.quiz.findMany({
        where: {
          courseId: { in: courseIds },
          isActive: true,
          isPublished: true,
          createdAt: { gte: fromDate, lte: toDate },
        },
      }),
    ]);

    // -------------------------------------------------------
    // 4. Build event list
    // -------------------------------------------------------
    interface CalendarEvent {
      id: string;
      title: string;
      date: string;
      time: string | null;
      endTime: string | null;
      type: 'lesson' | 'assignment' | 'quiz';
      courseTitle: string;
      courseId: string;
      color: string;
      room?: string;
    }

    const events: CalendarEvent[] = [];

    // Helper: format Date to "YYYY-MM-DD"
    const formatDate = (d: Date): string => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    // Helper: get course title (prefer English, fallback to Az/Ru)
    const getCourseTitle = (courseId: string): string => {
      const c = courseMap.get(courseId);
      if (!c) return 'Unknown Course';
      return c.titleEn || c.titleAz || c.titleRu;
    };

    // --- a) Schedule → recurring lesson events ---
    for (const schedule of schedules) {
      // Map dayOfWeek (1=Mon..6=Sat, 0=Sun) to JS Date.getDay() (0=Sun..6=Sat)
      const jsDayOfWeek = schedule.dayOfWeek; // 0=Sun already matches JS, 1=Mon..6=Sat also matches

      // Find the first occurrence of this day of week on or after fromDate
      const cursor = new Date(fromDate);
      cursor.setHours(0, 0, 0, 0);

      // Advance cursor to the correct day of week
      const currentDay = cursor.getDay();
      let diff = jsDayOfWeek - currentDay;
      if (diff < 0) diff += 7;
      cursor.setDate(cursor.getDate() + diff);

      // Generate weekly occurrences
      while (cursor <= toDate) {
        const event: CalendarEvent = {
          id: `schedule-${schedule.id}-${formatDate(cursor)}`,
          title: getCourseTitle(schedule.courseId),
          date: formatDate(cursor),
          time: schedule.startTime,
          endTime: schedule.endTime,
          type: 'lesson',
          courseTitle: getCourseTitle(schedule.courseId),
          courseId: schedule.courseId,
          color: '#22c55e',
        };

        if (schedule.room) {
          event.room = schedule.room;
        }

        events.push(event);

        // Move to next week
        cursor.setDate(cursor.getDate() + 7);
      }
    }

    // --- b) Assignments with dueDate ---
    for (const assignment of assignments) {
      if (!assignment.dueDate) continue;

      const dueDate = new Date(assignment.dueDate);
      const timeStr = `${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`;
      const hasTime = dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0;

      events.push({
        id: `assignment-${assignment.id}`,
        title: assignment.title,
        date: formatDate(dueDate),
        time: hasTime ? timeStr : null,
        endTime: null,
        type: 'assignment',
        courseTitle: getCourseTitle(assignment.courseId),
        courseId: assignment.courseId,
        color: '#ef4444',
      });
    }

    // --- c) Published quizzes (use createdAt as date) ---
    for (const quiz of quizzes) {
      const quizDate = new Date(quiz.createdAt);
      const timeStr = `${String(quizDate.getHours()).padStart(2, '0')}:${String(quizDate.getMinutes()).padStart(2, '0')}`;
      const hasTime = quizDate.getHours() !== 0 || quizDate.getMinutes() !== 0;

      events.push({
        id: `quiz-${quiz.id}`,
        title: quiz.title,
        date: formatDate(quizDate),
        time: hasTime ? timeStr : null,
        endTime: null,
        type: 'quiz',
        courseTitle: getCourseTitle(quiz.courseId),
        courseId: quiz.courseId,
        color: '#3b82f6',
      });
    }

    // -------------------------------------------------------
    // 5. Sort by date, then time
    // -------------------------------------------------------
    events.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      // Null times go to the end of the day
      const timeA = a.time ?? '23:59';
      const timeB = b.time ?? '23:59';
      return timeA.localeCompare(timeB);
    });

    return reply.send({ success: true, data: events });
  });
}
