import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export interface CertificateTemplateData {
  studentName: string;
  courseName: string;
  teacherName: string;
  issueDate: string;
  grade: string | null;
  teacherReview: string | null;
  uniqueCode: string;
  qrCodeDataUrl: string;
  verifyUrl: string;
}

/**
 * Generate a certificate PDF from template data
 * @returns PDF as a Buffer
 */
export async function generateCertificatePDF(
  data: CertificateTemplateData
): Promise<Buffer> {
  // Read the Handlebars template
  // In dev (tsx): src/templates/certificate.hbs
  // In prod (node dist/): dist/templates/certificate.hbs
  const templatePath = path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? 'dist/templates/certificate.hbs' : 'src/templates/certificate.hbs'
  );
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);

  // Render HTML with data
  const html = template(data);

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      width: '297mm',
      height: '210mm',
      landscape: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      pageRanges: '1',
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
