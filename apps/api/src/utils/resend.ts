import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'FutureUp Academy <noreply@futureup.az>';
const SITE_URL = process.env.SITE_URL || 'https://futureup.az';

// Brand colors
const NAVY = '#1B2A4A';
const RED = '#CC2030';

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
            <td style="background:${NAVY};padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">FutureUp Academy</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px;color:${NAVY};font-size:20px;">${title}</h2>
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} FutureUp Academy. All rights reserved.<br/>
                <a href="${SITE_URL}" style="color:${RED};text-decoration:none;">futureup.az</a>
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

// ========== Send Email via Resend ==========

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL SKIPPED] No RESEND_API_KEY configured. Would send to ${to}: ${subject}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EMAIL ERROR] To: ${to}, Subject: ${subject}`, error);
      return false;
    }

    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL ERROR] To: ${to}, Subject: ${subject}`, err);
    return false;
  }
}

// ========== Email Verification ==========

export function emailVerificationCode(code: string, name: string): { subject: string; html: string } {
  const subject = 'Email təsdiqləmə kodu — FutureUp Academy';
  const html = baseTemplate('Email Təsdiqləmə', `
    <p style="color:#4b5563;line-height:1.6;">
      Salam <strong>${name}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      FutureUp Academy-də qeydiyyatınızı tamamlamaq üçün aşağıdakı kodu daxil edin:
    </p>
    <div style="text-align:center;margin:30px 0;">
      <div style="display:inline-block;background:${NAVY};color:#ffffff;font-size:36px;font-weight:700;letter-spacing:8px;padding:20px 40px;border-radius:12px;">
        ${code}
      </div>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">
      Bu kod 15 dəqiqə ərzində etibarlıdır.
    </p>
    <p style="color:#9ca3af;font-size:13px;">
      Əgər siz qeydiyyatdan keçməmisinizsə, bu məktubu nəzərə almayın.
    </p>
  `);
  return { subject, html };
}

// ========== Password Reset ==========

export function emailPasswordReset(code: string, name: string): { subject: string; html: string } {
  const subject = 'Şifrə sıfırlama — FutureUp Academy';
  const html = baseTemplate('Şifrə Sıfırlama', `
    <p style="color:#4b5563;line-height:1.6;">
      Salam <strong>${name}</strong>,
    </p>
    <p style="color:#4b5563;line-height:1.6;">
      Şifrənizi sıfırlamaq üçün aşağıdakı kodu istifadə edin:
    </p>
    <div style="text-align:center;margin:30px 0;">
      <div style="display:inline-block;background:${RED};color:#ffffff;font-size:36px;font-weight:700;letter-spacing:8px;padding:20px 40px;border-radius:12px;">
        ${code}
      </div>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;">
      Bu kod 15 dəqiqə ərzində etibarlıdır.
    </p>
    <p style="color:#9ca3af;font-size:13px;">
      Əgər siz şifrə sıfırlama tələb etməmisinizsə, bu məktubu nəzərə almayın və hesabınız təhlükəsizdir.
    </p>
  `);
  return { subject, html };
}
