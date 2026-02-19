import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';
import { generateQRCode } from '../utils/qr-generator.js';
import { generateCertificatePDF, CertificateTemplateData } from '../utils/pdf-generator.js';
import fs from 'fs/promises';
import path from 'path';

// Certificates storage directory (apps/api/certificates/)
const CERTIFICATES_DIR = path.resolve(process.cwd(), 'certificates');

export async function certificateRoutes(server: FastifyInstance) {
  // Ensure certificates directory exists
  await fs.mkdir(CERTIFICATES_DIR, { recursive: true });

  // GET /verify/:code - PUBLIC - Get certificate by uniqueCode (QR verification)
  server.get('/verify/:code', async (request, reply) => {
    const { code } = request.params as { code: string };

    const certificate = await server.prisma.certificate.findUnique({
      where: { uniqueCode: code },
      include: {
        student: {
          select: { id: true, name: true, photo: true },
        },
        course: {
          select: {
            id: true,
            slug: true,
            titleAz: true,
            titleRu: true,
            titleEn: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nameAz: true,
            nameRu: true,
            nameEn: true,
            photo: true,
          },
        },
      },
    });

    if (!certificate) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    return reply.send({ success: true, data: certificate });
  });

  // GET /:id/pdf - PUBLIC - Download certificate PDF
  server.get('/:id/pdf', async (request, reply) => {
    const { id } = request.params as { id: string };

    const certificate = await server.prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    const pdfPath = path.join(CERTIFICATES_DIR, `${certificate.uniqueCode}.pdf`);

    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `inline; filename="certificate-${certificate.uniqueCode}.pdf"`)
        .send(pdfBuffer);
    } catch {
      return reply.status(404).send({
        success: false,
        message: 'PDF not found. Try regenerating the certificate.',
      });
    }
  });

  // GET / - List all certificates (admin auth)
  server.get('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const {
      page = '1',
      limit = '10',
      search,
      courseId,
      status,
    } = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      courseId?: string;
      status?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { uniqueCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      server.prisma.certificate.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          course: {
            select: { id: true, titleAz: true, titleRu: true, titleEn: true },
          },
          teacher: {
            select: { id: true, nameAz: true, nameRu: true, nameEn: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      server.prisma.certificate.count({ where }),
    ]);

    return reply.send({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  });

  // POST / - Create certificate with PDF & QR generation (admin auth)
  server.post('/', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      studentId: string;
      courseId: string;
      teacherId: string;
      issueDate?: string;
      teacherReview?: string;
      grade?: string;
    };

    // Create the certificate record first
    const certificate = await server.prisma.certificate.create({
      data: {
        studentId: body.studentId,
        courseId: body.courseId,
        teacherId: body.teacherId,
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        teacherReview: body.teacherReview,
        grade: body.grade,
        pdfUrl: null,
        qrCodeUrl: null,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
    });

    // Generate PDF & QR (non-blocking — cert is created even if this fails)
    try {
      const updatedCert = await generateAndSavePDF(server, certificate);
      return reply.status(201).send({ success: true, data: updatedCert });
    } catch (err) {
      server.log.error({ err }, 'PDF generation failed');
      // Return the certificate without PDF — can be regenerated later
      return reply.status(201).send({ success: true, data: certificate });
    }
  });

  // POST /bulk - Bulk generate certificates for a group (admin auth)
  server.post('/bulk', { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as {
      groupId: string;
      courseId: string;
      teacherId: string;
      grade?: string;
      teacherReview?: string;
    };

    // Get all students in the group
    const students = await server.prisma.student.findMany({
      where: { groupId: body.groupId },
    });

    if (students.length === 0) {
      return reply.status(400).send({ success: false, message: 'No students found in this group' });
    }

    // Create certificates one by one (so we can generate PDFs)
    const results = [];
    for (const student of students) {
      try {
        const certificate = await server.prisma.certificate.create({
          data: {
            studentId: student.id,
            courseId: body.courseId,
            teacherId: body.teacherId,
            grade: body.grade,
            teacherReview: body.teacherReview,
            pdfUrl: null,
            qrCodeUrl: null,
          },
          include: {
            student: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
            teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
          },
        });

        // Try to generate PDF
        try {
          await generateAndSavePDF(server, certificate);
        } catch (err) {
          server.log.error({ err, studentId: student.id }, 'PDF generation failed for student');
        }

        results.push(certificate);
      } catch (err) {
        server.log.error({ err, studentId: student.id }, 'Certificate creation failed for student');
      }
    }

    return reply.status(201).send({
      success: true,
      data: {
        count: results.length,
        message: `${results.length} certificates created successfully`,
      },
    });
  });

  // POST /:id/regenerate - Regenerate PDF for existing certificate (admin auth)
  server.post('/:id/regenerate', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const certificate = await server.prisma.certificate.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
        teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
      },
    });

    if (!certificate) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    try {
      const updatedCert = await generateAndSavePDF(server, certificate);
      return reply.send({ success: true, data: updatedCert, message: 'Certificate PDF regenerated successfully' });
    } catch (err) {
      server.log.error({ err }, 'PDF regeneration failed');
      return reply.status(500).send({ success: false, message: 'PDF generation failed. Please try again.' });
    }
  });

  // PUT /:id - Update certificate (admin auth)
  server.put('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      teacherReview?: string;
      grade?: string;
      status?: string;
      pdfUrl?: string;
      qrCodeUrl?: string;
    };

    const existing = await server.prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    const certificate = await server.prisma.certificate.update({
      where: { id },
      data: {
        ...body,
        status: body.status ? (body.status as 'ACTIVE' | 'REVOKED') : undefined,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, titleAz: true, titleRu: true, titleEn: true },
        },
        teacher: {
          select: { id: true, nameAz: true, nameRu: true, nameEn: true },
        },
      },
    });

    return reply.send({ success: true, data: certificate });
  });

  // DELETE /:id - Delete certificate (admin auth)
  server.delete('/:id', { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await server.prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, message: 'Certificate not found' });
    }

    // Delete PDF file if exists
    try {
      const pdfPath = path.join(CERTIFICATES_DIR, `${existing.uniqueCode}.pdf`);
      await fs.unlink(pdfPath);
    } catch {
      // File might not exist, that's fine
    }

    await server.prisma.certificate.delete({ where: { id } });

    return reply.send({ success: true, message: 'Certificate deleted successfully' });
  });
}

/**
 * Helper: Generate QR code + PDF, save to filesystem, update DB record
 */
async function generateAndSavePDF(
  server: FastifyInstance,
  certificate: any
): Promise<any> {
  const siteUrl = process.env.FRONTEND_URL || process.env.SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;
  const verifyUrl = `${siteUrl}/certificate/${certificate.uniqueCode}`;

  // Generate QR code
  const qrCodeDataUrl = await generateQRCode(verifyUrl);

  // Prepare template data
  const templateData: CertificateTemplateData = {
    studentName: certificate.student?.name || 'Student',
    courseName: certificate.course?.titleEn || certificate.course?.titleAz || certificate.course?.titleRu || 'Course',
    teacherName: certificate.teacher?.nameEn || certificate.teacher?.nameAz || certificate.teacher?.nameRu || 'Instructor',
    issueDate: new Date(certificate.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    grade: certificate.grade || null,
    teacherReview: certificate.teacherReview || null,
    uniqueCode: certificate.uniqueCode,
    qrCodeDataUrl,
    verifyUrl,
  };

  // Generate PDF
  const pdfBuffer = await generateCertificatePDF(templateData);

  // Save PDF to filesystem
  const pdfFilename = `${certificate.uniqueCode}.pdf`;
  const pdfPath = path.join(CERTIFICATES_DIR, pdfFilename);
  await fs.writeFile(pdfPath, pdfBuffer);

  // Build the full PDF URL
  const pdfUrl = `${apiUrl}/api/certificates/${certificate.id}/pdf`;

  // Update DB record
  const updated = await server.prisma.certificate.update({
    where: { id: certificate.id },
    data: {
      pdfUrl,
      qrCodeUrl: verifyUrl,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, titleAz: true, titleRu: true, titleEn: true } },
      teacher: { select: { id: true, nameAz: true, nameRu: true, nameEn: true } },
    },
  });

  return updated;
}
