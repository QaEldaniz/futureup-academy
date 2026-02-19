import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadRoutes(server: FastifyInstance) {
  // POST /image - Upload image (admin auth)
  server.post('/image', { preHandler: [adminAuth] }, async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ success: false, message: 'No file uploaded' });
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG',
        });
      }

      const buffer = await data.toBuffer();

      // If Cloudinary is configured, upload there
      if (isCloudinaryConfigured()) {
        const result = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'futureup',
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        return reply.send({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            filename: data.filename,
            mimetype: data.mimetype,
          },
        });
      }

      // Fallback: Cloudinary not configured
      const timestamp = Date.now();
      const filename = data.filename || 'image';
      const placeholderUrl = `/uploads/${timestamp}-${filename}`;

      return reply.send({
        success: true,
        data: {
          url: placeholderUrl,
          filename: data.filename,
          mimetype: data.mimetype,
          message: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.',
        },
      });
    } catch (error: any) {
      server.log.error({ err: error }, 'Upload failed');
      return reply.status(500).send({
        success: false,
        message: error.message || 'Failed to process upload',
      });
    }
  });
}
