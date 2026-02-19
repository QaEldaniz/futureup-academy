import { FastifyInstance, FastifyRequest } from 'fastify';
import { adminAuth } from '../middleware/auth.middleware.js';

export async function uploadRoutes(server: FastifyInstance) {
  // POST /image - Upload image (admin auth) - stubbed Cloudinary
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

      // Consume the file stream to prevent memory leaks
      await data.toBuffer();

      // TODO: Upload to Cloudinary or other storage service
      // For now, return a placeholder URL
      const timestamp = Date.now();
      const filename = data.filename || 'image';
      const placeholderUrl = `/uploads/${timestamp}-${filename}`;

      return reply.send({
        success: true,
        data: {
          url: placeholderUrl,
          filename: data.filename,
          mimetype: data.mimetype,
          message: 'Image upload stubbed. Integrate Cloudinary for production.',
        },
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: 'Failed to process upload',
      });
    }
  });
}
