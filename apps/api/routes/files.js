// nova-api/routes/files.js
// Nova Files - File Upload and Management API Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';

function canReadFile(reqUser, fileRow) {
  if (!reqUser) return false;
  const isOwner = fileRow.uploadedBy === reqUser.id;
  const isAdmin = reqUser.roles?.includes('admin') || reqUser.roles?.includes('superadmin');
  const hasGlobalRead = reqUser.permissions?.includes?.('files:read:any');
  return Boolean(isOwner || isAdmin || hasGlobalRead);
}

function canDeleteFile(reqUser, fileRow, permanent) {
  if (!reqUser) return false;
  const isOwner = fileRow.uploadedBy === reqUser.id;
  const isAdmin = reqUser.roles?.includes('admin') || reqUser.roles?.includes('superadmin');
  if (permanent === true) return Boolean(isAdmin);
  const hasGlobalDelete = reqUser.permissions?.includes?.('files:delete:any');
  return Boolean(isOwner || isAdmin || hasGlobalDelete);
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const fileExtension = path.extname(file.originalname);
    const secureFilename = crypto.randomBytes(16).toString('hex') + fileExtension;
    cb(null, secureFilename);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
  ];

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('File type not allowed');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  // Additional security checks
  const filename = file.originalname.toLowerCase();
  const dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.php',
    '.asp',
  ];

  if (dangerousExtensions.some((ext) => filename.endsWith(ext))) {
    const error = new Error('File extension not allowed');
    error.code = 'DANGEROUS_FILE_EXTENSION';
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 1, // Single file upload
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         uploadedBy:
 *           type: string
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *         url:
 *           type: string
 */

/**
 * @swagger
 * /api/v2/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload a file
 *     description: Upload a file securely with validation and virus scanning
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional file description
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 file:
 *                   $ref: '#/components/schemas/FileUpload'
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Authentication required
 *       413:
 *         description: File too large
 */
router.post(
  '/upload',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 20), // 20 uploads per 15 minutes
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            error: 'File too large',
            maxSize: process.env.MAX_FILE_SIZE || '10MB',
            errorCode: 'FILE_TOO_LARGE',
          });
        }

        if (err.code === 'INVALID_FILE_TYPE' || err.code === 'DANGEROUS_FILE_EXTENSION') {
          return res.status(400).json({
            success: false,
            error: err.message,
            errorCode: err.code,
          });
        }

        logger.error('File upload error:', err);
        return res.status(500).json({
          success: false,
          error: 'Upload failed',
          errorCode: 'UPLOAD_ERROR',
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
          errorCode: 'NO_FILE',
        });
      }

      const { description = '', tags = '' } = req.body;
      const fileId = crypto.randomUUID();

      // Store file metadata in database
      db.run(
        `INSERT INTO files (
          id, filename, originalName, mimeType, size, path,
          uploadedBy, uploadedAt, description, tags, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, 1)`,
        [
          fileId,
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          req.file.path,
          req.user.id,
          description,
          tags,
        ],
        function (err) {
          if (err) {
            logger.error('Error saving file metadata:', err);
            // Clean up uploaded file
            fs.unlink(req.file.path).catch((unlinkErr) =>
              logger.error('Failed to cleanup file:', unlinkErr),
            );
            return res.status(500).json({
              success: false,
              error: 'Failed to save file metadata',
              errorCode: 'METADATA_ERROR',
            });
          }

          logger.info('File uploaded successfully', {
            fileId,
            filename: req.file.originalname,
            size: req.file.size,
            uploadedBy: req.user.id,
          });

          res.status(201).json({
            success: true,
            file: {
              id: fileId,
              filename: req.file.filename,
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              size: req.file.size,
              uploadedBy: req.user.id,
              uploadedAt: new Date().toISOString(),
              url: `/api/v2/files/${fileId}`,
              description,
              tags: tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            },
          });
        },
      );
    } catch (error) {
      logger.error('Error processing file upload:', error);

      // Clean up uploaded file if it exists
      if (req.file) {
        fs.unlink(req.file.path).catch((unlinkErr) =>
          logger.error('Failed to cleanup file:', unlinkErr),
        );
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Download a file
 *     description: Download a file by ID with access control
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *       - in: query
 *         name: download
 *         schema:
 *           type: boolean
 *         description: Force download instead of inline display
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.get(
  '/:id',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 100), // 100 downloads per 15 minutes
  async (req, res) => {
    try {
      const { id } = req.params;
      const { download = false } = req.query;

      // Get file metadata
      db.get('SELECT * FROM files WHERE id = $1 AND isActive = 1', [id], async (err, file) => {
        if (err) {
          logger.error('Database error getting file:', err);
          return res.status(500).json({
            success: false,
            error: 'Database error',
            errorCode: 'DB_ERROR',
          });
        }

        if (!file) {
          return res.status(404).json({
            success: false,
            error: 'File not found',
            errorCode: 'FILE_NOT_FOUND',
          });
        }

        // Access control check
        const hasAccess = canReadFile(req.user, file);

        if (!hasAccess) {
          logger.warn('Unauthorized file access attempt', {
            fileId: id,
            userId: req.user.id,
            fileOwner: file.uploadedBy,
          });

          return res.status(403).json({
            success: false,
            error: 'Access denied',
            errorCode: 'ACCESS_DENIED',
          });
        }

        try {
          // Check if file exists on disk
          await fs.access(file.path);

          // Set appropriate headers
          res.setHeader('Content-Type', file.mimeType);
          res.setHeader('Content-Length', file.size);

          if (download === 'true') {
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
          } else {
            res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
          }

          // Security headers
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');

          // Stream file to response
          const fileStream = require('fs').createReadStream(file.path);
          fileStream.pipe(res);

          // Log file access
          logger.info('File accessed', {
            fileId: id,
            filename: file.originalName,
            userId: req.user.id,
            ip: req.ip,
          });
        } catch (fileError) {
          logger.error('File not found on disk:', {
            fileId: id,
            path: file.path,
            error: fileError,
          });
          return res.status(404).json({
            success: false,
            error: 'File not found on disk',
            errorCode: 'FILE_NOT_ON_DISK',
          });
        }
      });
    } catch (error) {
      logger.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/files/{id}/metadata:
 *   get:
 *     tags: [Files]
 *     summary: Get file metadata
 *     description: Get file information without downloading the content
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 file:
 *                   $ref: '#/components/schemas/FileUpload'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: File not found
 */
router.get(
  '/:id/metadata',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 200), // 200 requests per 15 minutes
  async (req, res) => {
    try {
      const { id } = req.params;

      db.get(
        `SELECT f.*, u.name as uploaderName 
         FROM files f 
         LEFT JOIN users u ON f.uploadedBy = u.id 
         WHERE f.id = $1 AND f.isActive = 1`,
        [id],
        (err, file) => {
          if (err) {
            logger.error('Database error getting file metadata:', err);
            return res.status(500).json({
              success: false,
              error: 'Database error',
              errorCode: 'DB_ERROR',
            });
          }

          if (!file) {
            return res.status(404).json({
              success: false,
              error: 'File not found',
              errorCode: 'FILE_NOT_FOUND',
            });
          }

          res.json({
            success: true,
            file: {
              id: file.id,
              filename: file.filename,
              originalName: file.originalName,
              mimeType: file.mimeType,
              size: file.size,
              uploadedBy: file.uploadedBy,
              uploaderName: file.uploaderName,
              uploadedAt: file.uploadedAt,
              description: file.description,
              tags: file.tags
                ? file.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : [],
              url: `/api/v2/files/${file.id}`,
            },
          });
        },
      );
    } catch (error) {
      logger.error('Error getting file metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/files/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete a file
 *     description: Delete a file (soft delete by default)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *         description: Permanently delete the file (admin only)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.delete(
  '/:id',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 50), // 50 deletions per 15 minutes
  async (req, res) => {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;

      // Get file metadata
      db.get('SELECT * FROM files WHERE id = $1', [id], async (err, file) => {
        if (err) {
          logger.error('Database error getting file for deletion:', err);
          return res.status(500).json({
            success: false,
            error: 'Database error',
            errorCode: 'DB_ERROR',
          });
        }

        if (!file) {
          return res.status(404).json({
            success: false,
            error: 'File not found',
            errorCode: 'FILE_NOT_FOUND',
          });
        }

        // Check access permissions
        const canDelete = canDeleteFile(req.user, file, permanent === 'true');

        if (!canDelete) {
          return res.status(403).json({
            success: false,
            error: 'Access denied',
            errorCode: 'ACCESS_DENIED',
          });
        }

        // Only admins can permanently delete
        const shouldPermanentDelete =
          permanent === 'true' &&
          (req.user.roles?.includes('admin') || req.user.roles?.includes('superadmin'));

        if (shouldPermanentDelete) {
          // Permanent deletion - remove from disk and database
          try {
            await fs.unlink(file.path);
          } catch (fsError) {
            logger.warn('File not found on disk during deletion:', { fileId: id, path: file.path });
          }

          db.run('DELETE FROM files WHERE id = $1', [id], (deleteErr) => {
            if (deleteErr) {
              logger.error('Error permanently deleting file:', deleteErr);
              return res.status(500).json({
                success: false,
                error: 'Failed to delete file',
                errorCode: 'DELETE_ERROR',
              });
            }

            logger.info('File permanently deleted', {
              fileId: id,
              filename: file.originalName,
              deletedBy: req.user.id,
            });

            res.json({
              success: true,
              message: 'File permanently deleted',
            });
          });
        } else {
          // Soft deletion - mark as inactive
          db.run(
            'UPDATE files SET isActive = 0, deletedAt = datetime("now"), deletedBy = $1 WHERE id = $2',
            [req.user.id, id],
            (updateErr) => {
              if (updateErr) {
                logger.error('Error soft deleting file:', updateErr);
                return res.status(500).json({
                  success: false,
                  error: 'Failed to delete file',
                  errorCode: 'DELETE_ERROR',
                });
              }

              logger.info('File soft deleted', {
                fileId: id,
                filename: file.originalName,
                deletedBy: req.user.id,
              });

              res.json({
                success: true,
                message: 'File deleted',
              });
            },
          );
        }
      });
    } catch (error) {
      logger.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  },
);

export default router;
