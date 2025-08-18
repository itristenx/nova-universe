import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import fileStorage from '../lib/file-storage.js'
import db from '../db.js'

const router = express.Router()

// Configure multer for file uploads (using memory storage for flexibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow more file types for general asset storage
    const allowedTypes = /jpeg|jpg|png|gif|svg|ico|pdf|txt|json|zip|doc|docx|xls|xlsx|ppt|pptx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/x-icon',
      'application/pdf', 'text/plain', 'application/json', 'application/zip',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    const mimetype = allowedMimes.includes(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('File type not supported'))
    }
  },
})

/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Get all uploaded assets
 *     responses:
 *       200:
 *         description: List of assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/', (req, res) => {
  db.all('SELECT * FROM assets ORDER BY uploaded_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/v1/assets:
 *   post:
 *     summary: Upload a new asset
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - name
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: No file uploaded or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', errorCode: 'NO_FILE_UPLOADED' })
  }

  const { name, type } = req.body
  if (!name || !type) {
    return res
      .status(400)
      .json({ error: 'Name and type are required', errorCode: 'NAME_TYPE_REQUIRED' })
  }

  try {
    // Upload file using storage service
    const uploadResult = await fileStorage.upload(req.file, {
      uploadedBy: req.user?.id || 'anonymous',
      assetName: name,
      assetType: type
    })

    // Store asset metadata in database
    db.run(
      'INSERT INTO assets (name, type, filename, url, file_key, storage_type, file_size, content_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        name, 
        type, 
        req.file.originalname, 
        uploadResult.url,
        uploadResult.key,
        fileStorage.getStorageType(),
        uploadResult.size,
        uploadResult.contentType
      ],
      function (err) {
        if (err) {
          console.error('Database error:', err)
          return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' })
        }

        res.json({
          id: this.lastID,
          name,
          type,
          filename: req.file.originalname,
          url: uploadResult.url,
          key: uploadResult.key,
          size: uploadResult.size,
          contentType: uploadResult.contentType,
          storageType: fileStorage.getStorageType(),
          uploaded_at: new Date().toISOString(),
        })
      },
    )
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Upload failed', 
      errorCode: 'UPLOAD_FAILED',
      details: error.message 
    })
  }
})

// Delete asset
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    // Get asset info first
    db.get('SELECT * FROM assets WHERE id = $1', [id], async (err, row) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' })
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Asset not found', errorCode: 'ASSET_NOT_FOUND' })
      }

      try {
        // Delete file from storage
        if (row.file_key) {
          // New format with storage key
          await fileStorage.delete(row.file_key)
        } else if (row.filename) {
          // Legacy format - try to delete local file
          const uploadsDir = path.join(process.cwd(), 'uploads')
          const filePath = path.join(uploadsDir, row.filename)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }

        // Delete from database
        db.run('DELETE FROM assets WHERE id = $1', [id], (deleteErr) => {
          if (deleteErr) {
            console.error('Database delete error:', deleteErr)
            return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' })
          }
          res.json({ message: 'Asset deleted successfully' })
        })
      } catch (storageError) {
        console.error('Storage delete error:', storageError)
        // Still try to delete from database even if storage deletion fails
        db.run('DELETE FROM assets WHERE id = $1', [id], (deleteErr) => {
          if (deleteErr) {
            console.error('Database delete error:', deleteErr)
            return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' })
          }
          res.json({ 
            message: 'Asset deleted from database (storage deletion failed)', 
            warning: storageError.message 
          })
        })
      }
    })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ 
      error: 'Delete failed', 
      errorCode: 'DELETE_FAILED',
      details: error.message 
    })
  }
})

// Download/serve asset file
router.get('/:id/download', async (req, res) => {
  const { id } = req.params

  try {
    // Get asset info
    db.get('SELECT * FROM assets WHERE id = $1', [id], async (err, row) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' })
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Asset not found', errorCode: 'ASSET_NOT_FOUND' })
      }

      try {
        let fileData

        if (row.file_key) {
          // New format with storage key
          fileData = await fileStorage.download(row.file_key)
        } else if (row.filename) {
          // Legacy format - serve from local uploads
          const uploadsDir = path.join(process.cwd(), 'uploads')
          const filePath = path.join(uploadsDir, row.filename)
          
          if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found', errorCode: 'FILE_NOT_FOUND' })
          }

          const buffer = fs.readFileSync(filePath)
          const stats = fs.statSync(filePath)
          fileData = {
            buffer,
            contentType: row.content_type || 'application/octet-stream',
            size: stats.size,
            lastModified: stats.mtime
          }
        } else {
          return res.status(404).json({ error: 'File reference not found', errorCode: 'NO_FILE_REFERENCE' })
        }

        // Set appropriate headers
        res.set({
          'Content-Type': fileData.contentType,
          'Content-Length': fileData.size,
          'Content-Disposition': `attachment; filename="${row.filename}"`,
          'Last-Modified': fileData.lastModified?.toUTCString()
        })

        res.send(fileData.buffer)
      } catch (storageError) {
        console.error('File retrieval error:', storageError)
        res.status(500).json({ 
          error: 'File retrieval failed', 
          errorCode: 'FILE_RETRIEVAL_FAILED',
          details: storageError.message 
        })
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ 
      error: 'Download failed', 
      errorCode: 'DOWNLOAD_FAILED',
      details: error.message 
    })
  }
})

// Get signed URL for asset (useful for S3)
router.get('/:id/url', async (req, res) => {
  const { id } = req.params
  const { expiresIn = 3600 } = req.query

  try {
    // Get asset info
    db.get('SELECT * FROM assets WHERE id = $1', [id], async (err, row) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' })
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Asset not found', errorCode: 'ASSET_NOT_FOUND' })
      }

      try {
        let url

        if (row.file_key) {
          // Get URL from storage service
          url = await fileStorage.getUrl(row.file_key, parseInt(expiresIn))
        } else {
          // Legacy format - return existing URL
          url = row.url
        }

        res.json({
          url,
          expiresIn: parseInt(expiresIn),
          expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString()
        })
      } catch (storageError) {
        console.error('URL generation error:', storageError)
        res.status(500).json({ 
          error: 'URL generation failed', 
          errorCode: 'URL_GENERATION_FAILED',
          details: storageError.message 
        })
      }
    })
  } catch (error) {
    console.error('URL generation error:', error)
    res.status(500).json({ 
      error: 'URL generation failed', 
      errorCode: 'URL_GENERATION_FAILED',
      details: error.message 
    })
  }
})

export default router
