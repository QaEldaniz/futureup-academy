import { FastifyInstance } from 'fastify';
import { adminAuth, teacherAuth, studentAuth, adminOrTeacherAuth, anyAuth } from '../middleware/auth.middleware.js';
import { awardXP } from '../utils/gamification.js';
import { sendEmail, emailAssignmentGraded, emailNewAssignment } from '../utils/email.js';

export async function assignmentRoutes(server: FastifyInstance) {
  // ==========================================
  // TEACHER/ADMIN ENDPOINTS
  // ==========================================

  // GET /courses/:courseId — Get assignments for a course (teacher/admin)
  server.get('/courses/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };

    // Verify teacher access (admin skips)
    if (request.user.type !== 'admin') {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const assignments = await server.prisma.assignment.findMany({
      where: { courseId },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get submission stats for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (a) => {
        const submitted = await server.prisma.assignmentSubmission.count({
          where: { assignmentId: a.id, status: { in: ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] } },
        });
        const graded = await server.prisma.assignmentSubmission.count({
          where: { assignmentId: a.id, status: 'GRADED' },
        });
        return { ...a, stats: { submitted, graded } };
      })
    );

    return reply.send({ success: true, data: assignmentsWithStats });
  });

  // POST /courses/:courseId — Create assignment (teacher/admin)
  server.post('/courses/:courseId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId } = request.params as { courseId: string };
    const body = request.body as {
      title: string;
      description?: string;
      dueDate?: string;
      maxScore?: number;
    };

    if (!body.title) {
      return reply.status(400).send({ success: false, message: 'Title is required' });
    }

    // Verify teacher access (admin skips)
    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    // Verify course exists
    const course = await server.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return reply.status(404).send({ success: false, message: 'Course not found' });
    }

    const assignment = await server.prisma.assignment.create({
      data: {
        courseId,
        teacherId: isAdmin ? null : id,
        title: body.title,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        maxScore: body.maxScore || 100,
      },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
      },
    });

    // Create notifications for all enrolled students
    const enrollments = await server.prisma.studentCourse.findMany({
      where: { courseId, status: 'ACTIVE' },
      select: { studentId: true },
    });

    if (enrollments.length > 0) {
      await server.prisma.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.studentId,
          userType: 'student',
          type: 'NEW_ASSIGNMENT' as const,
          title: 'New Assignment',
          message: `New assignment "${body.title}" has been posted${body.dueDate ? ` (due: ${new Date(body.dueDate).toLocaleDateString()})` : ''}`,
          link: `/lms/student/courses/${courseId}/assignments`,
        })),
      });

      // Send email to enrolled students (async, don't block)
      const students = await server.prisma.student.findMany({
        where: { id: { in: enrollments.map(e => e.studentId) }, emailNotifications: true },
        select: { name: true, email: true },
      });
      const dueDateStr = body.dueDate ? new Date(body.dueDate).toLocaleDateString() : undefined;
      for (const s of students) {
        const { subject, html } = emailNewAssignment(s.name, body.title, course.titleEn || course.titleAz, dueDateStr);
        sendEmail(s.email, subject, html).catch(() => {});
      }
    }

    return reply.status(201).send({ success: true, data: assignment });
  });

  // GET /courses/:courseId/:assignmentId — Get single assignment with submissions (teacher/admin)
  server.get('/courses/:courseId/:assignmentId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, assignmentId } = request.params as { courseId: string; assignmentId: string };

    // Verify teacher access (admin skips)
    if (request.user.type !== 'admin') {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const assignment = await server.prisma.assignment.findFirst({
      where: { id: assignmentId, courseId },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true, photo: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!assignment) {
      return reply.status(404).send({ success: false, message: 'Assignment not found' });
    }

    return reply.send({ success: true, data: assignment });
  });

  // PUT /courses/:courseId/:assignmentId — Update assignment (teacher/admin)
  server.put('/courses/:courseId/:assignmentId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId, assignmentId } = request.params as { courseId: string; assignmentId: string };
    const body = request.body as {
      title?: string;
      description?: string;
      dueDate?: string | null;
      maxScore?: number;
      isActive?: boolean;
    };

    // Verify teacher access (admin skips)
    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const existing = await server.prisma.assignment.findFirst({ where: { id: assignmentId, courseId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Assignment not found' });
    }

    // Teachers can only edit their own assignments
    if (!isAdmin && existing.teacherId !== id) {
      return reply.status(403).send({ success: false, message: 'You can only edit your own assignments' });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.maxScore !== undefined) updateData.maxScore = body.maxScore;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const assignment = await server.prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
      },
    });

    return reply.send({ success: true, data: assignment });
  });

  // DELETE /courses/:courseId/:assignmentId — Delete assignment (teacher/admin)
  server.delete('/courses/:courseId/:assignmentId', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { courseId, assignmentId } = request.params as { courseId: string; assignmentId: string };

    // Verify teacher access (admin skips)
    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    const existing = await server.prisma.assignment.findFirst({ where: { id: assignmentId, courseId } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Assignment not found' });
    }

    if (!isAdmin && existing.teacherId !== id) {
      return reply.status(403).send({ success: false, message: 'You can only delete your own assignments' });
    }

    await server.prisma.assignment.delete({ where: { id: assignmentId } });
    return reply.send({ success: true, message: 'Assignment deleted' });
  });

  // ==========================================
  // GRADE SUBMISSION (teacher/admin)
  // ==========================================

  // PUT /submissions/:submissionId/grade — Grade a submission
  server.put('/submissions/:submissionId/grade', { preHandler: [adminOrTeacherAuth] }, async (request, reply) => {
    const { id } = request.user;
    const isAdmin = request.user.type === 'admin';
    const { submissionId } = request.params as { submissionId: string };
    const body = request.body as {
      grade: number;
      feedback?: string;
      status?: string;
    };

    if (body.grade === undefined) {
      return reply.status(400).send({ success: false, message: 'Grade is required' });
    }

    const submission = await server.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { id: true, courseId: true, teacherId: true, title: true, maxScore: true } },
      },
    });

    if (!submission) {
      return reply.status(404).send({ success: false, message: 'Submission not found' });
    }

    // Verify teacher access
    if (!isAdmin) {
      const tc = await server.prisma.teacherCourse.findUnique({
        where: { teacherId_courseId: { teacherId: id, courseId: submission.assignment.courseId } },
      });
      if (!tc) {
        return reply.status(403).send({ success: false, message: 'Not assigned to this course' });
      }
    }

    if (body.grade < 0 || body.grade > submission.assignment.maxScore) {
      return reply.status(400).send({ success: false, message: `Grade must be between 0 and ${submission.assignment.maxScore}` });
    }

    const updated = await server.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: body.grade,
        feedback: body.feedback || null,
        status: (body.status as any) || 'GRADED',
        gradedAt: new Date(),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
    });

    // Create notification for the student
    await server.prisma.notification.create({
      data: {
        userId: updated.studentId,
        userType: 'student',
        type: 'ASSIGNMENT_GRADED',
        title: 'Assignment Graded',
        message: `Your submission for "${updated.assignment.title}" has been graded: ${body.grade}/${submission.assignment.maxScore}`,
        link: `/lms/student/courses/${updated.assignment.courseId}/assignments`,
      },
    });

    // Award XP for high grade (≥80%)
    const gradePercentage = (body.grade / submission.assignment.maxScore) * 100;
    if (gradePercentage >= 80) {
      awardXP(updated.studentId, 25, 'assignment_high_grade', submission.assignment.id).catch(() => {});
    }

    // Send email to student
    const studentFull = await server.prisma.student.findUnique({
      where: { id: updated.studentId },
      select: { email: true, name: true, emailNotifications: true },
    });
    if (studentFull?.emailNotifications) {
      const { subject, html } = emailAssignmentGraded(
        studentFull.name,
        updated.assignment.title,
        body.grade,
        submission.assignment.maxScore,
        body.feedback
      );
      sendEmail(studentFull.email, subject, html).catch(() => {});
    }

    // Also notify parent(s) if they exist
    const parentLinks = await server.prisma.studentParent.findMany({
      where: { studentId: updated.studentId },
      select: { parentId: true },
    });

    if (parentLinks.length > 0) {
      await server.prisma.notification.createMany({
        data: parentLinks.map((pl: { parentId: string }) => ({
          userId: pl.parentId,
          userType: 'parent',
          type: 'ASSIGNMENT_GRADED' as const,
          title: 'Assignment Graded',
          message: `${updated.student.name}'s submission for "${updated.assignment.title}" has been graded: ${body.grade}/${submission.assignment.maxScore}`,
          link: `/lms/parent`,
        })),
      });
    }

    return reply.send({ success: true, data: updated });
  });

  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  // GET /student/my — Get all assignments for the student's enrolled courses
  server.get('/student/my', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { status, courseId } = request.query as { status?: string; courseId?: string };

    // Get enrolled course IDs
    const enrollments = await server.prisma.studentCourse.findMany({
      where: { studentId: id, status: 'ACTIVE' },
      select: { courseId: true },
    });
    const courseIds = courseId ? [courseId] : enrollments.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return reply.send({ success: true, data: [] });
    }

    const assignments = await server.prisma.assignment.findMany({
      where: { courseId: { in: courseIds }, isActive: true },
      include: {
        course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        submissions: {
          where: { studentId: id },
          select: { id: true, status: true, grade: true, feedback: true, submittedAt: true, gradedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add computed fields
    const data = assignments.map((a) => {
      const submission = a.submissions[0] || null;
      const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && (!submission || submission.status === 'NOT_SUBMITTED');
      return {
        ...a,
        submission,
        isOverdue,
        submissions: undefined, // remove the array, use singular
      };
    });

    // Filter by status if provided
    let filteredData = data;
    if (status === 'pending') {
      filteredData = data.filter((d) => !d.submission || d.submission.status === 'NOT_SUBMITTED');
    } else if (status === 'submitted') {
      filteredData = data.filter((d) => d.submission && ['SUBMITTED', 'LATE'].includes(d.submission.status));
    } else if (status === 'graded') {
      filteredData = data.filter((d) => d.submission && d.submission.status === 'GRADED');
    }

    return reply.send({ success: true, data: filteredData });
  });

  // GET /student/courses/:courseId — Get assignments for a specific course (student)
  server.get('/student/courses/:courseId', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId } = request.params as { courseId: string };

    // Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    const assignments = await server.prisma.assignment.findMany({
      where: { courseId, isActive: true },
      include: {
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
        submissions: {
          where: { studentId: id },
          select: { id: true, status: true, grade: true, feedback: true, fileUrl: true, linkUrl: true, text: true, submittedAt: true, gradedAt: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    const data = assignments.map((a) => {
      const submission = a.submissions[0] || null;
      const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && (!submission || submission.status === 'NOT_SUBMITTED');
      return { ...a, submission, isOverdue, submissions: undefined };
    });

    return reply.send({ success: true, data });
  });

  // POST /student/courses/:courseId/:assignmentId/submit — Submit assignment
  server.post('/student/courses/:courseId/:assignmentId/submit', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, assignmentId } = request.params as { courseId: string; assignmentId: string };
    const body = request.body as {
      fileUrl?: string;
      linkUrl?: string;
      text?: string;
    };

    if (!body.fileUrl && !body.linkUrl && !body.text) {
      return reply.status(400).send({ success: false, message: 'At least one of fileUrl, linkUrl, or text is required' });
    }

    // Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    // Verify assignment exists and is active
    const assignment = await server.prisma.assignment.findFirst({
      where: { id: assignmentId, courseId, isActive: true },
    });
    if (!assignment) {
      return reply.status(404).send({ success: false, message: 'Assignment not found or inactive' });
    }

    // Determine if late
    const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);
    const submissionStatus = isLate ? 'LATE' : 'SUBMITTED';

    const submission = await server.prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: id } },
      create: {
        assignmentId,
        studentId: id,
        fileUrl: body.fileUrl || null,
        linkUrl: body.linkUrl || null,
        text: body.text || null,
        status: submissionStatus as any,
        submittedAt: new Date(),
      },
      update: {
        fileUrl: body.fileUrl || null,
        linkUrl: body.linkUrl || null,
        text: body.text || null,
        status: submissionStatus as any,
        submittedAt: new Date(),
        grade: null, // reset grade on re-submit
        feedback: null,
        gradedAt: null,
      },
    });

    // Award XP for submitting assignment
    awardXP(id, 15, 'assignment_submitted', assignmentId).catch(() => {});

    // Notify teacher
    if (assignment.teacherId) {
      const student = await server.prisma.student.findUnique({
        where: { id },
        select: { name: true },
      });

      await server.prisma.notification.create({
        data: {
          userId: assignment.teacherId,
          userType: 'teacher',
          type: 'NEW_ASSIGNMENT' as const,
          title: 'New Submission',
          message: `${student?.name || 'A student'} submitted "${assignment.title}"${isLate ? ' (late)' : ''}`,
          link: `/lms/teacher/courses/${courseId}/assignments/${assignmentId}`,
        },
      });
    }

    return reply.status(201).send({ success: true, data: submission });
  });

  // GET /student/courses/:courseId/:assignmentId — Get single assignment detail (student)
  server.get('/student/courses/:courseId/:assignmentId', { preHandler: [studentAuth] }, async (request, reply) => {
    const { id } = request.user;
    const { courseId, assignmentId } = request.params as { courseId: string; assignmentId: string };

    // Verify enrollment
    const enrollment = await server.prisma.studentCourse.findUnique({
      where: { studentId_courseId: { studentId: id, courseId } },
    });
    if (!enrollment) {
      return reply.status(403).send({ success: false, message: 'Not enrolled in this course' });
    }

    const assignment = await server.prisma.assignment.findFirst({
      where: { id: assignmentId, courseId, isActive: true },
      include: {
        course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true, photo: true } },
        submissions: {
          where: { studentId: id },
        },
      },
    });

    if (!assignment) {
      return reply.status(404).send({ success: false, message: 'Assignment not found' });
    }

    const submission = assignment.submissions[0] || null;
    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && (!submission || submission.status === 'NOT_SUBMITTED');

    return reply.send({
      success: true,
      data: { ...assignment, submission, isOverdue, submissions: undefined },
    });
  });
}
