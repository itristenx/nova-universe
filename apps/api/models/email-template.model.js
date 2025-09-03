/**
 * Email Template Database Model
 * Provides admin-editable email templates with industry standard placeholder support
 */

import db from '../db.js';
import { logger } from '../logger.js';
import { transformPlaceholders, reverseTransformPlaceholders, validateTemplate } from '../utils/email-placeholders.js';

class EmailTemplateModel {
  /**
   * Get all email templates for an organization
   * @param {string} organizationId - Organization ID
   * @param {Object} options - Query options
   * @returns {Array} Email templates
   */
  static async getAll(organizationId = null, options = {}) {
    try {
      const { category, isActive = true, includeInactive = false } = options;
      
      let query = `
        SELECT 
          id,
          key,
          organization_id,
          name,
          subject,
          body_html,
          body_text,
          category,
          is_active,
          created_at,
          updated_at
        FROM email_templates
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      // Filter by organization (null for global templates)
      if (organizationId !== undefined) {
        query += ` AND (organization_id = $${paramIndex} OR organization_id IS NULL)`;
        params.push(organizationId);
        paramIndex++;
      }

      // Filter by category
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      // Filter by active status
      if (!includeInactive) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(isActive);
        paramIndex++;
      }

      query += ` ORDER BY category, name`;

      const result = await db.query(query, params);
      
      // Transform handlebars syntax back to industry standard placeholders for editing
      return result.rows.map(template => ({
        ...template,
        subject_display: reverseTransformPlaceholders(template.subject),
        body_html_display: reverseTransformPlaceholders(template.body_html),
        body_text_display: reverseTransformPlaceholders(template.body_text),
      }));
    } catch (error) {
      logger.error('Error fetching email templates:', error);
      throw error;
    }
  }

  /**
   * Get a specific email template by key
   * @param {string} key - Template key
   * @param {string} organizationId - Organization ID
   * @returns {Object|null} Email template
   */
  static async getByKey(key, organizationId = null) {
    try {
      const query = `
        SELECT 
          id,
          key,
          organization_id,
          name,
          subject,
          body_html,
          body_text,
          category,
          is_active,
          created_at,
          updated_at
        FROM email_templates
        WHERE key = $1 AND (organization_id = $2 OR organization_id IS NULL)
        ORDER BY organization_id NULLS LAST
        LIMIT 1
      `;

      const result = await db.query(query, [key, organizationId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const template = result.rows[0];
      
      // Transform handlebars syntax back to industry standard placeholders for editing
      return {
        ...template,
        subject_display: reverseTransformPlaceholders(template.subject),
        body_html_display: reverseTransformPlaceholders(template.body_html),
        body_text_display: reverseTransformPlaceholders(template.body_text),
      };
    } catch (error) {
      logger.error('Error fetching email template by key:', error);
      throw error;
    }
  }

  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} Email template
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          id,
          key,
          organization_id,
          name,
          subject,
          body_html,
          body_text,
          category,
          is_active,
          created_at,
          updated_at
        FROM email_templates
        WHERE id = $1
      `;

      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const template = result.rows[0];
      
      // Transform handlebars syntax back to industry standard placeholders for editing
      return {
        ...template,
        subject_display: reverseTransformPlaceholders(template.subject),
        body_html_display: reverseTransformPlaceholders(template.body_html),
        body_text_display: reverseTransformPlaceholders(template.body_text),
      };
    } catch (error) {
      logger.error('Error fetching email template by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new email template
   * @param {Object} templateData - Template data
   * @returns {Object} Created template
   */
  static async create(templateData) {
    try {
      const {
        key,
        organizationId = null,
        name,
        subject,
        bodyHtml,
        bodyText,
        category = 'general',
        isActive = true,
      } = templateData;

      // Validate template content
      const htmlValidation = validateTemplate(bodyHtml);
      const subjectValidation = validateTemplate(subject);
      
      if (!htmlValidation.isValid) {
        throw new Error(`Invalid HTML template: ${htmlValidation.errors.join(', ')}`);
      }
      
      if (!subjectValidation.isValid) {
        throw new Error(`Invalid subject template: ${subjectValidation.errors.join(', ')}`);
      }

      // Transform industry standard placeholders to Handlebars syntax
      const transformedSubject = transformPlaceholders(subject);
      const transformedBodyHtml = transformPlaceholders(bodyHtml);
      const transformedBodyText = transformPlaceholders(bodyText || '');

      const query = `
        INSERT INTO email_templates (
          key,
          organization_id,
          name,
          subject,
          body_html,
          body_text,
          category,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await db.query(query, [
        key,
        organizationId,
        name,
        transformedSubject,
        transformedBodyHtml,
        transformedBodyText,
        category,
        isActive,
      ]);

      const created = result.rows[0];
      logger.info(`Created email template: ${key} for organization: ${organizationId || 'global'}`);

      // Return with display versions for editing
      return {
        ...created,
        subject_display: reverseTransformPlaceholders(created.subject),
        body_html_display: reverseTransformPlaceholders(created.body_html),
        body_text_display: reverseTransformPlaceholders(created.body_text),
      };
    } catch (error) {
      logger.error('Error creating email template:', error);
      throw error;
    }
  }

  /**
   * Update an existing email template
   * @param {string} id - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Object} Updated template
   */
  static async update(id, templateData) {
    try {
      const {
        name,
        subject,
        bodyHtml,
        bodyText,
        category,
        isActive,
      } = templateData;

      // Validate template content
      if (bodyHtml) {
        const htmlValidation = validateTemplate(bodyHtml);
        if (!htmlValidation.isValid) {
          throw new Error(`Invalid HTML template: ${htmlValidation.errors.join(', ')}`);
        }
      }
      
      if (subject) {
        const subjectValidation = validateTemplate(subject);
        if (!subjectValidation.isValid) {
          throw new Error(`Invalid subject template: ${subjectValidation.errors.join(', ')}`);
        }
      }

      // Build dynamic update query
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        params.push(name);
        paramIndex++;
      }

      if (subject !== undefined) {
        updateFields.push(`subject = $${paramIndex}`);
        params.push(transformPlaceholders(subject));
        paramIndex++;
      }

      if (bodyHtml !== undefined) {
        updateFields.push(`body_html = $${paramIndex}`);
        params.push(transformPlaceholders(bodyHtml));
        paramIndex++;
      }

      if (bodyText !== undefined) {
        updateFields.push(`body_text = $${paramIndex}`);
        params.push(transformPlaceholders(bodyText));
        paramIndex++;
      }

      if (category !== undefined) {
        updateFields.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      if (isActive !== undefined) {
        updateFields.push(`is_active = $${paramIndex}`);
        params.push(isActive);
        paramIndex++;
      }

      updateFields.push(`updated_at = NOW()`);

      if (updateFields.length === 1) { // Only the updated_at field
        throw new Error('No fields to update');
      }

      // Add ID parameter
      params.push(id);
      const idParam = paramIndex;

      const query = `
        UPDATE email_templates 
        SET ${updateFields.join(', ')}
        WHERE id = $${idParam}
        RETURNING *
      `;

      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }

      const updated = result.rows[0];
      logger.info(`Updated email template: ${updated.key}`);

      // Return with display versions for editing
      return {
        ...updated,
        subject_display: reverseTransformPlaceholders(updated.subject),
        body_html_display: reverseTransformPlaceholders(updated.body_html),
        body_text_display: reverseTransformPlaceholders(updated.body_text),
      };
    } catch (error) {
      logger.error('Error updating email template:', error);
      throw error;
    }
  }

  /**
   * Delete an email template
   * @param {string} id - Template ID
   * @returns {boolean} Success status
   */
  static async delete(id) {
    try {
      const query = `DELETE FROM email_templates WHERE id = $1 RETURNING key`;
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Template not found');
      }

      logger.info(`Deleted email template: ${result.rows[0].key}`);
      return true;
    } catch (error) {
      logger.error('Error deleting email template:', error);
      throw error;
    }
  }

  /**
   * Get template categories
   * @param {string} organizationId - Organization ID
   * @returns {Array} Categories
   */
  static async getCategories(organizationId = null) {
    try {
      const query = `
        SELECT DISTINCT category
        FROM email_templates
        WHERE (organization_id = $1 OR organization_id IS NULL)
        AND is_active = true
        ORDER BY category
      `;

      const result = await db.query(query, [organizationId]);
      return result.rows.map(row => row.category);
    } catch (error) {
      logger.error('Error fetching email template categories:', error);
      throw error;
    }
  }

  /**
   * Copy a template to create a new one
   * @param {string} sourceId - Source template ID
   * @param {Object} newData - New template data
   * @returns {Object} Created template
   */
  static async copy(sourceId, newData) {
    try {
      const sourceTemplate = await this.getById(sourceId);
      if (!sourceTemplate) {
        throw new Error('Source template not found');
      }

      const templateData = {
        key: newData.key,
        organizationId: newData.organizationId || sourceTemplate.organization_id,
        name: newData.name || `Copy of ${sourceTemplate.name}`,
        subject: newData.subject || sourceTemplate.subject_display,
        bodyHtml: newData.bodyHtml || sourceTemplate.body_html_display,
        bodyText: newData.bodyText || sourceTemplate.body_text_display,
        category: newData.category || sourceTemplate.category,
        isActive: newData.isActive !== undefined ? newData.isActive : sourceTemplate.is_active,
      };

      return await this.create(templateData);
    } catch (error) {
      logger.error('Error copying email template:', error);
      throw error;
    }
  }

  /**
   * Get template usage statistics
   * @param {string} templateKey - Template key
   * @param {Object} options - Query options
   * @returns {Object} Usage statistics
   */
  static async getUsageStats(templateKey, options = {}) {
    try {
      const { days = 30 } = options;
      
      const query = `
        SELECT 
          COUNT(*) as total_uses,
          COUNT(CASE WHEN delivery_success = true THEN 1 END) as successful_deliveries,
          COUNT(CASE WHEN response_received = true THEN 1 END) as responses_received,
          AVG(CASE WHEN open_rate IS NOT NULL THEN open_rate END) as avg_open_rate,
          AVG(CASE WHEN click_rate IS NOT NULL THEN click_rate END) as avg_click_rate,
          AVG(CASE WHEN response_time_hours IS NOT NULL THEN response_time_hours END) as avg_response_time_hours
        FROM email_template_usage
        WHERE template_name = $1
        AND created_at >= NOW() - INTERVAL '${days} days'
      `;

      const result = await db.query(query, [templateKey]);
      return result.rows[0] || {
        total_uses: 0,
        successful_deliveries: 0,
        responses_received: 0,
        avg_open_rate: null,
        avg_click_rate: null,
        avg_response_time_hours: null,
      };
    } catch (error) {
      logger.error('Error fetching template usage stats:', error);
      throw error;
    }
  }

  /**
   * Import default templates from file system
   * @param {Array} defaultTemplates - Array of default template objects
   * @param {string} organizationId - Organization ID
   * @returns {Array} Imported templates
   */
  static async importDefaults(defaultTemplates, organizationId = null) {
    try {
      const imported = [];
      
      for (const template of defaultTemplates) {
        try {
          // Check if template already exists
          const existing = await this.getByKey(template.key, organizationId);
          
          if (!existing) {
            const created = await this.create({
              key: template.key,
              organizationId,
              name: template.name,
              subject: template.subject,
              bodyHtml: template.bodyHtml,
              bodyText: template.bodyText || '',
              category: template.category || 'general',
              isActive: true,
            });
            
            imported.push(created);
            logger.info(`Imported default template: ${template.key}`);
          }
        } catch (error) {
          logger.error(`Error importing template ${template.key}:`, error);
        }
      }
      
      return imported;
    } catch (error) {
      logger.error('Error importing default templates:', error);
      throw error;
    }
  }
}

export default EmailTemplateModel;