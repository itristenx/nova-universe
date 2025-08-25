import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param } from 'express-validator';
import EmailTemplateService from '../services/email-template.service.js';
import logger from '../logger.js';

const router = express.Router();

/**
 * Get all available email templates
 */
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = EmailTemplateService.getAvailableTemplates();

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
 * Create new email template
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
 * Update email template
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
 * Delete email template
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

      // Use sample data if none provided
      const sampleData = {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        ticket: {
          id: 'TKT-001',
          title: 'Sample Ticket Title',
          description: 'This is a sample ticket description for preview purposes.',
          priority: 'medium',
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
          assignee: {
            name: 'Jane Smith',
          },
        },
        ...data,
      };

      const html = EmailTemplateService.render(name, sampleData);
      const subject = EmailTemplateService.renderSubject(name, sampleData);

      res.json({
        success: true,
        data: {
          subject,
          html,
          templateName: name,
        },
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
