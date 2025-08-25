// Static file serving middleware for uploads
import express from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Create middleware to serve uploaded files from local storage
 * This provides a fallback for when files are stored locally
 */
export function createUploadsMiddleware(uploadsPath = './uploads', urlPrefix = '/uploads') {
  const router = express.Router();

  // Ensure uploads directory exists
  const absoluteUploadsPath = path.resolve(uploadsPath);
  if (!fs.existsSync(absoluteUploadsPath)) {
    fs.mkdirSync(absoluteUploadsPath, { recursive: true });
  }

  // Serve static files with proper headers
  router.use(
    urlPrefix,
    express.static(absoluteUploadsPath, {
      // Set proper headers for file downloads
      setHeaders: (res, filePath, stat) => {
        const ext = path.extname(filePath).toLowerCase();

        // Set Content-Type based on file extension
        const contentTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.pdf': 'application/pdf',
          '.txt': 'text/plain',
          '.json': 'application/json',
          '.zip': 'application/zip',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.xls': 'application/vnd.ms-excel',
          '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '.ppt': 'application/vnd.ms-powerpoint',
          '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.set('Content-Type', contentType);

        // Set cache headers for better performance
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
        res.set('Last-Modified', stat.mtime.toUTCString());

        // Add security headers
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
      },

      // Custom error handling
      fallthrough: false,
    }),
  );

  // Handle 404s for missing files
  router.use(urlPrefix, (req, res) => {
    res.status(404).json({
      error: 'File not found',
      errorCode: 'FILE_NOT_FOUND',
      path: req.path,
    });
  });

  return router;
}

export default createUploadsMiddleware;
