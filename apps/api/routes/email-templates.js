import express from 'express';
import { authenticateJWT as authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import EmailTemplateService from '../services/email-template.service.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * Get all available email templates (both file and database)
 */
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const templates = await EmailTemplateService.getAvailableTemplates(organizationId);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logger.error('Error fetching email templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email templates',
    });
  }
});

/**
 * Get available placeholders
 */
router.get('/placeholders', authenticateToken, async (req, res) => {
  try {
    const placeholders = EmailTemplateService.getAvailablePlaceholders();

    res.json({
      success: true,
      data: placeholders,
    });
  } catch (error) {
    logger.error('Error fetching email placeholders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email placeholders',
    });
  }
});

/**
 * Get specific database template for editing
 */
router.get('/templates/database/:key', 
  authenticateToken,
  [
    param('key').isString().withMessage('Valid template key is required'),
    query('organizationId').optional().isUUID().withMessage('Valid organization ID required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { key } = req.params;
      const { organizationId } = req.query;

      const template = await EmailTemplateService.getDatabaseTemplate(key, organizationId);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Error fetching database template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template',
      });
    }
  }
);

/**
 * Create new database email template
 */
router.post(
  '/templates/database',
  authenticateToken,
  [
    body('key').isString().isLength({ min: 1 }).withMessage('Template key is required'),
    body('name').isString().isLength({ min: 1 }).withMessage('Template name is required'),
    body('subject').isString().isLength({ min: 1 }).withMessage('Subject is required'),
    body('bodyHtml').isString().isLength({ min: 1 }).withMessage('HTML content is required'),
    body('bodyText').optional().isString(),
    body('category').optional().isString(),
    body('organizationId').optional().isUUID().withMessage('Valid organization ID required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const templateData = req.body;

      // Validate template content
      const validation = EmailTemplateService.validateTemplate(templateData.bodyHtml);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template content',
          details: validation.errors,
        });
      }

      const template = await EmailTemplateService.createDatabaseTemplate(templateData);

      res.status(201).json({
        success: true,
        message: 'Email template created successfully',
        data: template,
        validation: validation.warnings.length > 0 ? {
          warnings: validation.warnings,
          suggestions: validation.suggestions,
        } : null,
      });
    } catch (error) {
      logger.error('Error creating database template:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create email template',
      });
    }
  },
);

/**
 * Update database email template
 */
router.put(
  '/templates/database/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid template ID is required'),
    body('name').optional().isString().isLength({ min: 1 }).withMessage('Template name must not be empty'),
    body('subject').optional().isString().isLength({ min: 1 }).withMessage('Subject must not be empty'),
    body('bodyHtml').optional().isString().isLength({ min: 1 }).withMessage('HTML content must not be empty'),
    body('bodyText').optional().isString(),
    body('category').optional().isString(),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const templateData = req.body;

      // Validate template content if provided
      if (templateData.bodyHtml) {
        const validation = EmailTemplateService.validateTemplate(templateData.bodyHtml);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: 'Invalid template content',
            details: validation.errors,
          });
        }
      }

      const template = await EmailTemplateService.updateDatabaseTemplate(id, templateData);

      res.json({
        success: true,
        message: 'Email template updated successfully',
        data: template,
      });
    } catch (error) {
      logger.error('Error updating database template:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update email template',
      });
    }
  },
);

/**
 * Delete database email template
 */
router.delete(
  '/templates/database/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Valid template ID is required')],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      await EmailTemplateService.deleteDatabaseTemplate(id);

      res.json({
        success: true,
        message: 'Email template deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting database template:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete email template',
      });
    }
  },
);

/**
 * Import default templates to database
 */
router.post(
  '/templates/import-defaults',
  authenticateToken,
  [
    body('organizationId').optional().isUUID().withMessage('Valid organization ID required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { organizationId } = req.body;

      const imported = await EmailTemplateService.importDefaultTemplates(organizationId);

      res.json({
        success: true,
        message: `Successfully imported ${imported.length} default templates`,
        data: imported,
      });
    } catch (error) {
      logger.error('Error importing default templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import default templates',
      });
    }
  },
);

/**
 * Validate template content
 */
router.post(
  '/templates/validate',
  authenticateToken,
  [
    body('content').isString().isLength({ min: 1 }).withMessage('Template content is required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { content } = req.body;

      const validation = EmailTemplateService.validateTemplate(content);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      logger.error('Error validating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate template',
      });
    }
  },
);

/**
 * Create new email template (file-based, for backward compatibility)
 */
router.post(
  '/templates',
  authenticateToken,
  [
    body('name').isString().isLength({ min: 1 }).withMessage('Template name is required'),
    body('html').isString().isLength({ min: 1 }).withMessage('HTML content is required'),
    body('subject').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name, html, subject } = req.body;

      await EmailTemplateService.createTemplate(name, html, subject);

      res.status(201).json({
        success: true,
        message: 'Email template created successfully',
        data: { name },
      });
    } catch (error) {
      logger.error('Error creating email template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create email template',
      });
    }
  },
);

/**
 * Update email template (file-based, for backward compatibility)
 */
router.put(
  '/templates/:name',
  authenticateToken,
  [
    param('name').isString().withMessage('Valid template name is required'),
    body('html').isString().isLength({ min: 1 }).withMessage('HTML content is required'),
    body('subject').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name } = req.params;
      const { html, subject } = req.body;

      await EmailTemplateService.updateTemplate(name, html, subject);

      res.json({
        success: true,
        message: 'Email template updated successfully',
        data: { name },
      });
    } catch (error) {
      logger.error('Error updating email template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update email template',
      });
    }
  },
);

/**
 * Delete email template (file-based, for backward compatibility)
 */
router.delete(
  '/templates/:name',
  authenticateToken,
  [param('name').isString().withMessage('Valid template name is required')],
  validateRequest,
  async (req, res) => {
    try {
      const { name } = req.params;

      await EmailTemplateService.deleteTemplate(name);

      res.json({
        success: true,
        message: 'Email template deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting email template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete email template',
      });
    }
  },
);

/**
 * Preview email template
 */
router.post(
  '/templates/:name/preview',
  authenticateToken,
  [
    param('name').isString().withMessage('Valid template name is required'),
    body('data').optional().isObject(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name } = req.params;
      const { data = {} } = req.body;
      const { organizationId } = req.query;

      const preview = await EmailTemplateService.previewTemplate(name, data, organizationId);

      res.json({
        success: true,
        data: preview,
      });
    } catch (error) {
      logger.error('Error previewing email template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to preview email template',
      });
    }
  },
);

export default router;
