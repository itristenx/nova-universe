// Nova TV Digital Signage API Routes
// Handles file uploads, media management, and digital signage capabilities

import express from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Import database client
import { PrismaClient as CorePrismaClient } from '../../../../prisma/generated/core/index.js';
const prisma = new CorePrismaClient();

const router = express.Router();

// Configure multer for file uploads following digital signage industry standards
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'nova-tv', 'media');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename while preserving extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, fileExtension)
      .replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter for digital signage formats based on industry standards
const fileFilter = (req, file, cb) => {
  const allowedFormats = {
    // Video formats - MP4 is the industry standard
    'video/mp4': { type: 'video', format: 'mp4' },
    'video/webm': { type: 'video', format: 'webm' },
    'video/avi': { type: 'video', format: 'avi' },
    'video/mov': { type: 'video', format: 'mov' },
    
    // Image formats - PNG for graphics, JPG for photos
    'image/png': { type: 'image', format: 'png' },
    'image/jpeg': { type: 'image', format: 'jpg' },
    'image/jpg': { type: 'image', format: 'jpg' },
    'image/gif': { type: 'image', format: 'gif' },
    'image/webp': { type: 'image', format: 'webp' },
    
    // Audio formats - MP3 for compression, WAV for quality
    'audio/mp3': { type: 'audio', format: 'mp3' },
    'audio/mpeg': { type: 'audio', format: 'mp3' },
    'audio/wav': { type: 'audio', format: 'wav' },
    'audio/wave': { type: 'audio', format: 'wav' },
    
    // Document formats - HTML for interactive content
    'text/html': { type: 'document', format: 'html' },
    'application/pdf': { type: 'document', format: 'pdf' }
  };

  if (allowedFormats[file.mimetype]) {
    file.fileTypeInfo = allowedFormats[file.mimetype];
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format: ${file.mimetype}. Supported formats: ${Object.keys(allowedFormats).join(', ')}`));
  }
};

// Configure multer with size limits and validation
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
    files: 10 // Maximum 10 files at once
  }
});

// Helper function to get file metadata
async function getFileMetadata(filePath, _mimetype) {
  const stats = await fs.stat(filePath);
  const metadata = {
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };

  // For images and videos, we could add dimension detection here
  // This would require additional libraries like sharp (images) or ffprobe (videos)
  
  return metadata;
}

// Helper function to validate uploaded files
function validateFileForDigitalSignage(file, fileInfo) {
  const validations = [];
  
  // Size validation based on file type
  const maxSizes = {
    video: 500 * 1024 * 1024, // 500MB for videos
    image: 50 * 1024 * 1024,  // 50MB for images
    audio: 100 * 1024 * 1024, // 100MB for audio
    document: 25 * 1024 * 1024 // 25MB for documents
  };
  
  if (file.size > maxSizes[fileInfo.type]) {
    validations.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit for ${fileInfo.type} files`);
  }
  
  // Format-specific validations
  if (fileInfo.type === 'video' && fileInfo.format !== 'mp4') {
    validations.push('MP4 is the recommended format for video content in digital signage');
  }
  
  if (fileInfo.type === 'image' && !['png', 'jpg'].includes(fileInfo.format)) {
    validations.push('PNG (for graphics) and JPG (for photos) are recommended for digital signage');
  }
  
  return {
    isValid: validations.length === 0,
    warnings: validations
  };
}

// POST /api/v1/nova-tv/digital-signage/upload
// Upload media files for digital signage
router.post('/upload', upload.array('mediaFiles', 10), async (req, res) => {
  try {
    const { dashboardId, contentId } = req.body;
    const uploadedBy = req.user?.id || 'system'; // Will be replaced with actual auth
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const uploadResults = [];
    
    for (const file of req.files) {
      try {
        // Get additional file metadata
        const metadata = await getFileMetadata(file.path, file.mimetype);
        
        // Validate file for digital signage use
        const validation = validateFileForDigitalSignage(file, file.fileTypeInfo);
        
        // Create media file record
        const mediaFile = {
          id: uuidv4(),
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          fileType: file.fileTypeInfo.type,
          fileFormat: file.fileTypeInfo.format,
          filePath: file.path,
          url: `/uploads/nova-tv/media/${file.filename}`,
          uploadedBy: uploadedBy,
          contentId: contentId || null,
          dashboardId: dashboardId || null,
          isValidated: validation.isValid,
          validatedAt: validation.isValid ? new Date() : null,
          validatedBy: validation.isValid ? uploadedBy : null,
          metadata: {
            ...metadata,
            validation: validation
          },
          tags: [],
          description: req.body.description || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save to database using Prisma
        try {
          const savedFile = await prisma.novaTVMediaFile.create({ 
            data: {
              id: mediaFile.id,
              filename: mediaFile.filename,
              originalName: mediaFile.originalName,
              mimetype: mediaFile.mimetype,
              size: mediaFile.size,
              fileType: mediaFile.fileType,
              fileFormat: mediaFile.fileFormat,
              filePath: mediaFile.filePath,
              url: mediaFile.url,
              uploadedBy: mediaFile.uploadedBy,
              contentId: mediaFile.contentId,
              dashboardId: mediaFile.dashboardId,
              isValidated: mediaFile.isValidated,
              validatedAt: mediaFile.validatedAt,
              validatedBy: mediaFile.validatedBy,
              metadata: mediaFile.metadata,
              tags: mediaFile.tags,
              description: mediaFile.description,
              isActive: mediaFile.isActive,
              createdAt: mediaFile.createdAt,
              updatedAt: mediaFile.updatedAt
            }
          });
          
          uploadResults.push({
            success: true,
            file: savedFile,
            warnings: validation.warnings
          });
        } catch (dbError) {
          // If database save fails, still return success but log error
          console.error('Database save failed for file:', mediaFile.filename, dbError);
          uploadResults.push({
            success: true,
            file: mediaFile,
            warnings: [...(validation.warnings || []), 'Database save failed - file uploaded but not tracked']
          });
        }
        
      } catch (fileError) {
        uploadResults.push({
          success: false,
          filename: file.originalname,
          error: fileError.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Successfully processed ${uploadResults.filter(r => r.success).length} of ${req.files.length} files`,
      results: uploadResults
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
      details: error.message
    });
  }
});

// GET /api/v1/nova-tv/digital-signage/media
// Get media files for digital signage
router.get('/media', async (req, res) => {
  try {
    const { 
      dashboardId, 
      contentId, 
      fileType, 
      fileFormat, 
      isValidated,
      page = 1,
      limit = 20,
      search
    } = req.query;
    
    // Implement with Prisma
    try {
      // Build filter conditions
      const filters = {};
      
      if (dashboardId) filters.dashboardId = dashboardId;
      if (contentId) filters.contentId = contentId;
      if (fileType) filters.fileType = fileType;
      if (fileFormat) filters.fileFormat = fileFormat;
      if (isValidated !== undefined) filters.isValidated = isValidated === 'true';
      
      // Add search functionality
      if (search) {
        filters.OR = [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Execute query with pagination
      const [files, totalCount] = await Promise.all([
        prisma.novaTVMediaFile.findMany({
          where: filters,
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.novaTVMediaFile.count({ where: filters })
      ]);
      
      res.json({
        success: true,
        data: files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Database query failed:', error);
      // Fallback to mock data if database fails
      res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        warning: 'Database query failed - showing empty results'
      });
    }
    if (isValidated !== undefined) filters.isValidated = isValidated === 'true';
    
    // Add search functionality
    if (search) {
      filters.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }
    
    // Mock response for now
    const mediaFiles = [
      {
        id: 'media-1',
        filename: 'corporate-video.mp4',
        originalName: 'Corporate Overview.mp4',
        mimetype: 'video/mp4',
        size: 45000000,
        fileType: 'video',
        fileFormat: 'mp4',
        url: '/uploads/nova-tv/media/corporate-video.mp4',
        isValidated: true,
        duration: 120,
        thumbnailUrl: '/uploads/nova-tv/thumbnails/corporate-video-thumb.jpg',
        tags: ['corporate', 'overview'],
        description: 'Company overview video for lobby displays'
      }
    ];
    
    res.json({
      success: true,
      data: mediaFiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mediaFiles.length,
        totalPages: Math.ceil(mediaFiles.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Get media files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media files'
    });
  }
});

// POST /api/v1/nova-tv/digital-signage/playlists
// Create a new playlist for digital signage content
router.post('/playlists', async (req, res) => {
  try {
    const {
      name,
      description,
      dashboardId,
      items = [], // Playlist items to create
      _mediaFileIds = [], // Placeholder for future use
      scheduleSettings = {},
      playlistSettings = {}
    } = req.body;
    
    const createdBy = req.user?.id || 'system';
    
    if (!name || !dashboardId) {
      return res.status(400).json({
        success: false,
        error: 'Name and dashboardId are required'
      });
    }
    
    const playlist = {
      id: uuidv4(),
      name,
      description,
      dashboardId,
      isActive: true,
      startTime: scheduleSettings.startTime || null,
      endTime: scheduleSettings.endTime || null,
      repeatType: scheduleSettings.repeatType || 'none',
      repeatConfig: scheduleSettings.repeatConfig || {},
      shuffleMode: playlistSettings.shuffleMode || false,
      loopMode: playlistSettings.loopMode || true,
      duration: playlistSettings.duration || null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save playlist to database
    const savedPlaylist = await prisma.novaTVPlaylist.create({
      data: {
        name: playlist.name,
        description: playlist.description,
        dashboardId: playlist.dashboardId,
        isActive: playlist.isActive,
        startTime: playlist.startTime,
        endTime: playlist.endTime,
        repeatType: playlist.repeatType,
        repeatConfig: playlist.repeatConfig,
        shuffleMode: playlist.shuffleMode,
        loopMode: playlist.loopMode,
        duration: playlist.duration,
        createdBy: playlist.createdBy
      },
      include: {
        items: true,
        dashboard: true
      }
    });

    // Create playlist items if provided
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await prisma.novaTVPlaylistItem.create({
          data: {
            playlistId: savedPlaylist.id,
            mediaFileId: item.mediaFileId || null,
            contentId: item.contentId || null,
            displayOrder: i + 1,
            duration: item.duration || null,
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            isActive: item.isActive !== undefined ? item.isActive : true
          }
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: savedPlaylist,
      message: 'Playlist created successfully'
    });
    
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create playlist'
    });
  }
});

// GET /api/v1/nova-tv/digital-signage/playlists
// Get playlists for digital signage
router.get('/playlists', async (req, res) => {
  try {
    const { dashboardId, _isActive } = req.query; // _isActive for future filtering
    
    // Implement with Prisma
    try {
      const filters = {};
      if (dashboardId) filters.dashboardId = dashboardId;
      if (_isActive !== undefined) filters.isActive = _isActive === 'true';
      
      const playlists = await prisma.novaTVPlaylist.findMany({
        where: filters,
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: playlists
      });
    } catch (error) {
      console.error('Database query failed:', error);
      // Fallback to mock data if database fails
      const playlists = [
        {
          id: 'playlist-1',
          name: 'Corporate Announcements',
          description: 'Daily corporate announcements and updates',
          dashboardId: dashboardId || 'dashboard-1',
          isActive: true,
          itemCount: 5,
          totalDuration: 300,
          lastUpdated: new Date()
        }
      ];
      
      res.json({
        success: true,
        data: playlists,
        warning: 'Database query failed - showing mock data'
      });
    }
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlists'
    });
  }
});

// POST /api/v1/nova-tv/digital-signage/channels
// Create a digital signage channel (specialized dashboard)
router.post('/channels', async (req, res) => {
  try {
    const {
      name,
      description,
      department,
      channelType = 'digital_signage', // 'digital_signage', 'mixed_content'
      displaySettings = {},
      contentSettings = {}
    } = req.body;
    
    const createdBy = req.user?.id || 'system';
    
    if (!name || !department) {
      return res.status(400).json({
        success: false,
        error: 'Name and department are required'
      });
    }
    
    // Create specialized configuration for digital signage channels
    const configuration = {
      channelType,
      displaySettings: {
        autoPlay: true,
        showControls: false,
        loopContent: true,
        transitionType: 'fade',
        transitionDuration: 1000,
        ...displaySettings
      },
      contentSettings: {
        allowedFileTypes: ['video', 'image', 'audio'],
        maxFileSize: 500 * 1024 * 1024, // 500MB
        requireValidation: true,
        autoGenerateThumbnails: true,
        ...contentSettings
      },
      capabilities: [
        'file_upload',
        'media_management',
        'playlist_creation',
        'content_scheduling',
        'remote_management'
      ]
    };
    
    const channel = {
      id: uuidv4(),
      name,
      description,
      department,
      createdBy,
      templateId: null, // Digital signage channels use custom templates
      configuration,
      isActive: true,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database using NovaTVDashboard model
    const savedChannel = await prisma.novaTVDashboard.create({
      data: {
        name: channel.name,
        description: channel.description,
        department: channel.department,
        createdBy: channel.createdBy,
        templateId: channel.templateId,
        configuration: channel.configuration,
        isActive: channel.isActive,
        isPublic: channel.isPublic
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        devices: true,
        playlists: true
      }
    });
    
    res.status(201).json({
      success: true,
      data: savedChannel,
      message: 'Digital signage channel created successfully'
    });
    
  } catch (error) {
    console.error('Create digital signage channel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create digital signage channel'
    });
  }
});

// GET /api/v1/nova-tv/digital-signage/formats
// Get supported file formats and specifications
router.get('/formats', (req, res) => {
  const supportedFormats = {
    video: {
      formats: ['mp4', 'webm', 'avi', 'mov'],
      recommended: 'mp4',
      maxSize: '500MB',
      recommendations: [
        'MP4 with H.264 codec is the industry standard',
        'Recommended resolution: 1920x1080 (Full HD)',
        'Frame rate: 30fps or 60fps',
        'Bitrate: 5-10 Mbps for optimal quality'
      ]
    },
    image: {
      formats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      recommended: ['png', 'jpg'],
      maxSize: '50MB',
      recommendations: [
        'PNG for graphics with transparency and crisp text',
        'JPG for photographs and complex images',
        'Recommended resolution: 1920x1080 or higher',
        'Use high DPI for sharp text and graphics'
      ]
    },
    audio: {
      formats: ['mp3', 'wav'],
      recommended: 'mp3',
      maxSize: '100MB',
      recommendations: [
        'MP3 for efficient compression',
        'WAV for high-quality audio',
        'Bitrate: 128-320 kbps for MP3',
        'Sample rate: 44.1kHz or 48kHz'
      ]
    },
    document: {
      formats: ['html', 'pdf'],
      recommended: 'html',
      maxSize: '25MB',
      recommendations: [
        'HTML5 for interactive and dynamic content',
        'PDF for static document display',
        'HTML can include CSS animations and JavaScript',
        'Ensure responsive design for different screen sizes'
      ]
    }
  };
  
  res.json({
    success: true,
    data: supportedFormats,
    message: 'Supported file formats for digital signage following industry standards'
  });
});

// Error handling middleware
router.use((error, req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large',
        details: 'Maximum file size is 500MB for videos, 50MB for images'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        details: 'Maximum 10 files can be uploaded at once'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'File upload error',
    details: error.message
  });
});

export default router;
