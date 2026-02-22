import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'FutureUp Academy <noreply@futureupacademy.az>';

function baseTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">FutureUp Academy</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px;color:#1f2937;font-size:20px;">${title}</h2>
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} FutureUp Academy. All rights reserved.<br/>
                <a href="https://futureupacademy.az" style="color:#6366f1;text-decoration:none;">futureupacademy.az</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL SKIPPED] No SMTP configured. Would send to ${to}: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] To: ${to}, Subject: ${subject}`, error);
    return false;
  }
}

// ========== Email Templates ==========

export function emailNewGrade(studentName: string, courseName: string, grade: number, maxGrade: number, feedback?: string): { subject: string; html: string } {
  const subject = `New Grade: ${courseName}`;
  const html = baseTemplate('New Grade Received', `
    <p style="color:#4b5563;line-height:1.6;">
      Hello <strong>${studentName}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      Your assignment in <strong>${courseName}</strong> has been graded.
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${grade}/${maxGrade}</p>
    </div>
    ${feedback ? `<p style="color:#4b5563;line-height:1.6;"><strong>Feedback:</strong> ${feedback}</p>` : ''}
    <a href="https://futureupacademy.az/lms/student/grades" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">View Grades</a>
  `);
  return { subject, html };
}

export function emailAbsentNotice(parentName: string, studentName: string, courseName: string, date: string): { subject: string; html: string } {
  const subject = `Attendance Alert: ${studentName}`;
  const html = baseTemplate('Absence Notice', `
    <p style="color:#4b5563;line-height:1.6;">
      Dear <strong>${parentName}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      We'd like to inform you that <strong>${studentName}</strong> was marked <span style="color:#ef4444;font-weight:600;">absent</span> from <strong>${courseName}</strong> on <strong>${date}</strong>.
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      If this was expected, no action is needed. Otherwise, please contact the academy.
    </p>
    <a href="https://futureupacademy.az/lms/parent" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">View Dashboard</a>
  `);
  return { subject, html };
}

export function emailNewAssignment(studentName: string, assignmentTitle: string, courseName: string, dueDate?: string): { subject: string; html: string } {
  const subject = `New Assignment: ${assignmentTitle}`;
  const html = baseTemplate('New Assignment', `
    <p style="color:#4b5563;line-height:1.6;">
      Hello <strong>${studentName}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      A new assignment has been posted in <strong>${courseName}</strong>:
    </p>
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;font-weight:700;color:#1e40af;font-size:16px;">${assignmentTitle}</p>
      ${dueDate ? `<p style="margin:8px 0 0;color:#3b82f6;">Deadline: ${dueDate}</p>` : ''}
    </div>
    <a href="https://futureupacademy.az/lms/student/assignments" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">View Assignment</a>
  `);
  return { subject, html };
}

export function emailAssignmentGraded(studentName: string, assignmentTitle: string, grade: number, maxScore: number, feedback?: string): { subject: string; html: string } {
  const subject = `Assignment Graded: ${assignmentTitle}`;
  const html = baseTemplate('Assignment Graded', `
    <p style="color:#4b5563;line-height:1.6;">
      Hello <strong>${studentName}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      Your assignment <strong>"${assignmentTitle}"</strong> has been graded.
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${grade}/${maxScore}</p>
    </div>
    ${feedback ? `<p style="color:#4b5563;line-height:1.6;"><strong>Feedback:</strong> ${feedback}</p>` : ''}
    <a href="https://futureupacademy.az/lms/student/assignments" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">View Details</a>
  `);
  return { subject, html };
}

export function emailBadgeEarned(studentName: string, badgeName: string, badgeIcon: string, badgeDescription: string): { subject: string; html: string } {
  const subject = `Badge Earned: ${badgeName}!`;
  const html = baseTemplate('Achievement Unlocked!', `
    <p style="color:#4b5563;line-height:1.6;">
      Congratulations <strong>${studentName}</strong>!
    </p>
    <div style="text-align:center;margin:30px 0;">
      <div style="display:inline-block;width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);line-height:80px;font-size:40px;text-align:center;">${badgeIcon}</div>
      <h3 style="margin:12px 0 4px;color:#1f2937;">${badgeName}</h3>
      <p style="margin:0;color:#6b7280;">${badgeDescription}</p>
    </div>
    <a href="https://futureupacademy.az/lms/student/achievements" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">View Achievements</a>
  `);
  return { subject, html };
}

export function emailNewQuiz(studentName: string, quizTitle: string, courseName: string): { subject: string; html: string } {
  const subject = `New Quiz: ${quizTitle}`;
  const html = baseTemplate('New Quiz Available', `
    <p style="color:#4b5563;line-height:1.6;">
      Hello <strong>${studentName}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      A new quiz is available in <strong>${courseName}</strong>:
    </p>
    <div style="background:#faf5ff;border-left:4px solid #a855f7;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
      <p style="margin:0;font-weight:700;color:#7c3aed;font-size:16px;">${quizTitle}</p>
    </div>
    <a href="https://futureupacademy.az/lms/student/quizzes" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">Start Quiz</a>
  `);
  return { subject, html };
}
