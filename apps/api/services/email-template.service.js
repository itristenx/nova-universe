import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';
import ConfigurationService from './configuration.service.js';
import EmailTemplateModel from '../models/email-template.model.js';
import { 
  transformPlaceholders, 
  processTemplateData, 
  registerPlaceholderHelpers,
  getAvailablePlaceholders,
  validateTemplate
} from '../utils/email-placeholders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailTemplateService {
  constructor() {
    this.templates = new Map();
    this.dbTemplates = new Map();
    this.templatesPath = path.join(__dirname, '../templates/email');
    this.loadTemplates();
  }

  /**
   * Load all email templates from both files and database
   */
  loadTemplates() {
    try {
      // Load file-based templates first
      this.loadFileTemplates();
      
      // Register enhanced helpers for placeholders
      this.registerHelpers();
      registerPlaceholderHelpers(Handlebars);

      logger.info(`Loaded ${this.templates.size} file-based email templates`);
    } catch (error) {
      logger.error('Error loading email templates:', error);
    }
  }

  /**
   * Load database templates for a specific organization
   */
  async loadDatabaseTemplates(organizationId = null) {
    try {
      const dbTemplates = await EmailTemplateModel.getAll(organizationId, { includeInactive: false });
      
      // Clear existing database templates for this organization
      const orgKey = organizationId || 'global';
      this.dbTemplates.set(orgKey, new Map());
      
      for (const template of dbTemplates) {
        try {
          // Templates from database are already transformed
          const compiledTemplate = Handlebars.compile(template.body_html);
          const compiledSubject = Handlebars.compile(template.subject);
          
          this.dbTemplates.get(orgKey).set(template.key, {
            template: compiledTemplate,
            subject: compiledSubject,
            metadata: {
              id: template.id,
              name: template.name,
              category: template.category,
              source: 'database',
              organizationId: template.organization_id,
              isActive: template.is_active,
              createdAt: template.created_at,
              updatedAt: template.updated_at,
            }
          });
          
          logger.debug(`Loaded database template: ${template.key}`);
        } catch (error) {
          logger.error(`Error compiling database template ${template.key}:`, error);
        }
      }
      
      logger.info(`Loaded ${dbTemplates.length} database templates for organization: ${organizationId || 'global'}`);
    } catch (error) {
      logger.error('Error loading database templates:', error);
    }
  }

  /**
   * Load file-based templates (existing functionality)
   */
  loadFileTemplates() {
    // Default templates directory
    const templatesDir = this.templatesPath;

    // Create templates directory if it doesn't exist
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      this.createDefaultTemplates();
    }

    const templateFiles = fs.readdirSync(templatesDir);

    for (const file of templateFiles) {
      if (file.endsWith('.hbs')) {
        const templateName = path.basename(file, '.hbs');
        const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf8');

        try {
          // Transform industry standard placeholders to Handlebars syntax
          const transformedContent = transformPlaceholders(templateContent);
          this.templates.set(templateName, Handlebars.compile(transformedContent));
          logger.debug(`Loaded file template: ${templateName}`);
        } catch (error) {
          logger.error(`Error compiling template ${templateName}:`, error);
        }
      }
    }
  }

  /**
   * Register Handlebars helpers with enhanced placeholder support
   */
  registerHelpers() {
    Handlebars.registerHelper('formatDate', (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    });

    Handlebars.registerHelper('formatDateTime', (date) => {
      if (!date) return '';
      return new Date(date).toLocaleString();
    });

    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('ne', (a, b) => a !== b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('lt', (a, b) => a < b);

    Handlebars.registerHelper('upperCase', (str) => {
      if (!str) return '';
      return str.toString().toUpperCase();
    });

    Handlebars.registerHelper('lowerCase', (str) => {
      if (!str) return '';
      return str.toString().toLowerCase();
    });

    Handlebars.registerHelper('truncate', (str, length) => {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    });

    Handlebars.registerHelper('substring', (str, start, end) => {
      if (!str) return '';
      return str.substring(start, end).toUpperCase();
    });

    Handlebars.registerHelper('capitalize', (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Enhanced helpers for name formatting
    Handlebars.registerHelper('firstName', (name) => {
      if (!name) return '';
      return name.trim().split(/\s+/)[0] || '';
    });

    Handlebars.registerHelper('lastName', (name) => {
      if (!name) return '';
      const parts = name.trim().split(/\s+/);
      return parts.length > 1 ? parts[parts.length - 1] : '';
    });

    Handlebars.registerHelper('initials', (name) => {
      if (!name) return '';
      return name.trim().split(/\s+/).map(part => part.charAt(0).toUpperCase()).join('');
    });
  }

  /**
   * Create default email templates with rich, professional designs
   */
  createDefaultTemplates() {
    const baseStyles = `
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .content { 
            padding: 32px 24px; 
        }
        .ticket-id { 
            color: white; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: 600; 
            display: inline-block; 
            margin-bottom: 16px; 
        }
        .btn-primary { 
            display: inline-block; 
            color: white; 
            text-decoration: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            font-weight: 600; 
            margin: 16px 8px 16px 0; 
        }
        .footer { 
            background: #f8fafc; 
            text-align: center; 
            padding: 24px; 
            color: #64748b; 
            font-size: 12px; 
            border-top: 1px solid #e2e8f0; 
        }
        .footer a { 
            color: #3b82f6; 
            text-decoration: none; 
        }
    `;

    const defaultTemplates = {
      // Customer Notification Templates
      'ticket-created-customer': {
        subject: '[{{companyName}}] Ticket #{{ticket.id}} Created - {{ticket.title}}',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Created</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .ticket-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 24px; 
            margin: 24px 0; 
        }
        .ticket-id { 
            background: #3b82f6; 
        }
        .detail-row { 
            display: flex; 
            margin-bottom: 12px; 
            border-bottom: 1px solid #e2e8f0; 
            padding-bottom: 8px; 
        }
        .detail-label { 
            font-weight: 600; 
            width: 120px; 
            color: #64748b; 
        }
        .detail-value { 
            flex: 1; 
        }
        .expectation-box { 
            background: #eff6ff; 
            border-left: 4px solid #3b82f6; 
            padding: 16px; 
            margin: 24px 0; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Support Ticket Created</h1>
        </div>
        <div class="content">
            <p>Hello {{customer.name}},</p>
            <p>Thank you for contacting our support team. We've received your request and created a support ticket for you.</p>
            
            <div class="ticket-card">
                <div class="ticket-id">Ticket #{{ticket.id}}</div>
                
                <div class="detail-row">
                    <div class="detail-label">Subject:</div>
                    <div class="detail-value">{{ticket.title}}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Priority:</div>
                    <div class="detail-value">{{upperCase ticket.priority}}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">{{upperCase ticket.status}}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">{{formatDateTime ticket.createdAt}}</div>
                </div>
            </div>

            <div class="expectation-box">
                <strong>📅 What to expect:</strong><br>
                Based on your ticket priority, you can expect a response within <strong>{{responseTime}}</strong>. 
                We'll keep you updated via email as our team works on your request.
            </div>

            <a href="{{baseUrl}}/tickets/{{ticket.id}}" class="btn-primary">View Ticket Details</a>

            <p><strong>🔗 Tracking your ticket:</strong><br>
            Save this email for your records. You can always check your ticket status using ticket #{{ticket.id}}.</p>
        </div>
        <div class="footer">
            <p>This message was sent from {{companyName}} Support</p>
            <p>To reply to this ticket, please email <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`,
      },

      'ticket-updated-customer': {
        subject: '[{{companyName}}] Ticket #{{ticket.id}} Updated - {{ticket.title}}',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Updated</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .ticket-id { 
            background: #10b981; 
        }
        .update-card { 
            background: #f0fdf4; 
            border: 1px solid #bbf7d0; 
            border-radius: 8px; 
            padding: 24px; 
            margin: 24px 0; 
        }
        .update-header { 
            display: flex; 
            align-items: center; 
            margin-bottom: 16px; 
        }
        .update-avatar { 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            background: #10b981; 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 600; 
            margin-right: 12px; 
        }
        .update-comment { 
            background: white; 
            border: 1px solid #d1d5db; 
            border-radius: 6px; 
            padding: 16px; 
            margin-top: 16px; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 Ticket Updated</h1>
        </div>
        <div class="content">
            <p>Hello {{customer.name}},</p>
            <p>Great news! There's been an update to your support ticket.</p>
            
            <div class="ticket-id">Ticket #{{ticket.id}}</div>

            <div class="update-card">
                <div class="update-header">
                    <div class="update-avatar">{{substring update.user.name 0 1}}</div>
                    <div class="update-info">
                        <h3>{{update.user.name}}</h3>
                        <div class="update-time">{{formatDateTime update.createdAt}}</div>
                    </div>
                </div>
                
                {{#if update.comment}}
                <div class="update-comment">
                    {{update.comment}}
                </div>
                {{/if}}
            </div>

            <a href="{{baseUrl}}/tickets/{{ticket.id}}" class="btn-primary">View Full Conversation</a>

            <p><strong>📬 Stay in the loop:</strong><br>
            You'll receive email notifications for all updates to your ticket.</p>
        </div>
        <div class="footer">
            <p>This message was sent from {{companyName}} Support</p>
            <p>Ticket #{{ticket.id}} • <a href="{{baseUrl}}/tickets/{{ticket.id}}">View Online</a></p>
        </div>
    </div>
</body>
</html>`,
      },

      'ticket-resolved-customer': {
        subject: '[{{companyName}}] Ticket #{{ticket.id}} Resolved - {{ticket.title}}',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Resolved</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .success-banner { 
            background: #f0fdf4; 
            border: 2px solid #16a34a; 
            border-radius: 8px; 
            padding: 24px; 
            text-align: center; 
            margin: 24px 0; 
        }
        .success-icon { 
            font-size: 48px; 
            color: #16a34a; 
            margin-bottom: 16px; 
        }
        .feedback-section { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 24px; 
            margin: 24px 0; 
            text-align: center; 
        }
        .rating-buttons { 
            margin: 16px 0; 
        }
        .rating-btn { 
            display: inline-block; 
            margin: 0 4px; 
            padding: 8px 16px; 
            border: 2px solid #f59e0b; 
            border-radius: 6px; 
            text-decoration: none; 
            color: #92400e; 
            font-weight: 600; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Ticket Resolved</h1>
        </div>
        <div class="content">
            <div class="success-banner">
                <div class="success-icon">🎉</div>
                <h2>Your issue has been resolved!</h2>
                <p>Ticket #{{ticket.id}} has been successfully closed by our support team.</p>
            </div>

            <div class="feedback-section">
                <h3>⭐ How was your experience?</h3>
                <p>Your feedback helps us improve our support quality.</p>
                <div class="rating-buttons">
                    <a href="{{baseUrl}}/feedback/{{ticket.id}}?rating=5" class="rating-btn">😊 Excellent</a>
                    <a href="{{baseUrl}}/feedback/{{ticket.id}}?rating=4" class="rating-btn">👍 Good</a>
                    <a href="{{baseUrl}}/feedback/{{ticket.id}}?rating=3" class="rating-btn">😐 Okay</a>
                    <a href="{{baseUrl}}/feedback/{{ticket.id}}?rating=2" class="rating-btn">👎 Poor</a>
                </div>
            </div>

            <a href="{{baseUrl}}/tickets/{{ticket.id}}" class="btn-primary">View Ticket Details</a>

            <p><strong>❓ Need help with something else?</strong><br>
            If you have a new issue, please <a href="{{baseUrl}}/tickets/new">submit a new ticket</a>.</p>
        </div>
        <div class="footer">
            <p>Thank you for using {{companyName}} Support!</p>
            <p>Ticket #{{ticket.id}} • <a href="{{baseUrl}}/feedback/{{ticket.id}}">Rate Your Experience</a></p>
        </div>
    </div>
</body>
</html>`,
      },

      // Agent Notification Templates
      'ticket-assigned-agent': {
        subject: '[{{companyName}}] Ticket #{{ticket.id}} Assigned to You - {{ticket.title}}',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Assigned</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .ticket-id { 
            background: #f59e0b; 
        }
        .priority-critical { color: #dc2626; font-weight: 600; }
        .priority-high { color: #ea580c; font-weight: 600; }
        .priority-medium { color: #ca8a04; font-weight: 600; }
        .priority-low { color: #16a34a; font-weight: 600; }
        .customer-info { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 16px 0; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 New Ticket Assigned</h1>
        </div>
        <div class="content">
            <p>Hello {{assignee.name}},</p>
            <p>A new support ticket has been assigned to you. Please review and take action.</p>
            
            <div class="ticket-id">Ticket #{{ticket.id}}</div>
            
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {{ticket.customer.name}}</p>
                <p><strong>Email:</strong> {{ticket.customer.email}}</p>
                <p><strong>Priority:</strong> <span class="priority-{{lowerCase ticket.priority}}">{{upperCase ticket.priority}}</span></p>
                <p><strong>Subject:</strong> {{ticket.title}}</p>
            </div>

            {{#if ticket.description}}
            <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
                <strong>Customer Message:</strong><br>
                {{ticket.description}}
            </div>
            {{/if}}

            <a href="{{baseUrl}}/tickets/{{ticket.id}}" class="btn-primary">Start Working on Ticket</a>

            <p><strong>⏰ SLA Reminder:</strong><br>
            Please respond within {{responseTime}} based on the ticket priority.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} Agent Dashboard</p>
            <p>Ticket #{{ticket.id}} • <a href="{{baseUrl}}/tickets/{{ticket.id}}">View in Dashboard</a></p>
        </div>
    </div>
</body>
</html>`,
      },

      'ticket-escalated-agent': {
        subject: '[{{companyName}}] ESCALATED: Ticket #{{ticket.id}} - {{ticket.title}}',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Escalated</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .ticket-id { 
            background: #dc2626; 
        }
        .escalation-alert { 
            background: #fef2f2; 
            border: 2px solid #dc2626; 
            border-radius: 8px; 
            padding: 24px; 
            margin: 24px 0; 
            text-align: center; 
        }
        .escalation-reason { 
            background: #fff1f2; 
            border-left: 4px solid #dc2626; 
            padding: 16px; 
            margin: 16px 0; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Ticket Escalated</h1>
        </div>
        <div class="content">
            <div class="escalation-alert">
                <h2>⚠️ URGENT ATTENTION REQUIRED</h2>
                <p>This ticket has been escalated and requires immediate attention.</p>
            </div>
            
            <div class="ticket-id">Ticket #{{ticket.id}}</div>
            
            <div class="escalation-reason">
                <h3>Escalation Details</h3>
                <p><strong>Escalated by:</strong> {{escalation.escalatedBy.name}}</p>
                <p><strong>Escalation time:</strong> {{formatDateTime escalation.escalatedAt}}</p>
                <p><strong>Reason:</strong> {{escalation.reason}}</p>
            </div>

            <p><strong>Customer:</strong> {{ticket.customer.name}} ({{ticket.customer.email}})</p>
            <p><strong>Original assignment:</strong> {{ticket.assignee.name}}</p>
            <p><strong>Time since creation:</strong> {{ticket.age}}</p>

            <a href="{{baseUrl}}/tickets/{{ticket.id}}" class="btn-primary">Take Immediate Action</a>

            <p><strong>🎯 Required Action:</strong><br>
            Please review this ticket immediately and provide an update within 1 hour.</p>
        </div>
        <div class="footer">
            <p>{{companyName}} Escalation Management</p>
            <p>Escalated Ticket #{{ticket.id}}</p>
        </div>
    </div>
</body>
</html>`,
      },

      // Auto-Reply Templates
      'auto-reply-received': {
        subject: 'Re: {{originalSubject}} [Ticket #{{ticket.id}}]',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Reply - Message Received</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .ticket-id { 
            background: #6366f1; 
        }
        .auto-reply-banner { 
            background: #eef2ff; 
            border: 1px solid #c7d2fe; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            text-align: center; 
        }
        .response-time { 
            background: #f0f9ff; 
            border-left: 4px solid #0ea5e9; 
            padding: 16px; 
            margin: 16px 0; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Message Received</h1>
        </div>
        <div class="content">
            <div class="auto-reply-banner">
                <h2>✅ Thank you for contacting us!</h2>
                <p>We've received your message and created a support ticket.</p>
            </div>
            
            <div class="ticket-id">Ticket #{{ticket.id}}</div>
            
            <p>Hello {{customer.name}},</p>
            <p>This is an automated confirmation that we've received your support request. Our team will review your message and respond as soon as possible.</p>

            <div class="response-time">
                <strong>📅 Expected Response Time:</strong><br>
                Based on your ticket priority (<strong>{{upperCase ticket.priority}}</strong>), 
                you can expect a response within <strong>{{responseTime}}</strong>.
            </div>

            <p><strong>Your Message:</strong></p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0;">
                {{ticket.description}}
            </div>

            <a href="{{baseUrl}}/tickets/{{ticket.id}}" class="btn-primary">View Your Ticket</a>

            <p><strong>💡 Helpful Tips:</strong></p>
            <ul>
                <li>Keep this ticket number (#{{ticket.id}}) for reference</li>
                <li>You can add more information by replying to this email</li>
                <li>Check our <a href="{{baseUrl}}/help">Help Center</a> for instant answers</li>
            </ul>
        </div>
        <div class="footer">
            <p>This is an automated message from {{companyName}} Support</p>
            <p>Ticket #{{ticket.id}} • Created {{formatDateTime ticket.createdAt}}</p>
        </div>
    </div>
</body>
</html>`,
      },

      // System Notification Templates
      'password-reset': {
        subject: '[{{companyName}}] Password Reset Request',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .security-notice { 
            background: #fef7cd; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
        }
        .reset-button { 
            text-align: center; 
            margin: 32px 0; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
            font-size: 16px;
            padding: 16px 32px;
        }
        .expiry-notice { 
            background: #fef2f2; 
            border-left: 4px solid #ef4444; 
            padding: 16px; 
            margin: 16px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello {{user.name}},</p>
            <p>We received a request to reset your password for your {{companyName}} account.</p>

            <div class="security-notice">
                <strong>🛡️ Security Notice:</strong><br>
                If you didn't request this password reset, please ignore this email. 
                Your account security has not been compromised.
            </div>

            <div class="reset-button">
                <a href="{{resetUrl}}" class="btn-primary">Reset Your Password</a>
            </div>

            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This reset link will expire in 1 hour for security reasons.
            </div>

            <p><strong>Can't click the button?</strong><br>
            Copy and paste this link into your browser: {{resetUrl}}</p>

            <p><strong>Need help?</strong><br>
            If you're having trouble resetting your password, contact our support team at 
            <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
        <div class="footer">
            <p>{{companyName}} Security Team</p>
            <p>This password reset was requested from IP: {{requestIp}}</p>
        </div>
    </div>
</body>
</html>`,
      },

      'welcome-new-user': {
        subject: 'Welcome to {{companyName}} Support Portal!',
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{companyName}}</title>
    <style>
        ${baseStyles}
        .header { 
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); 
            color: white; 
            padding: 32px 24px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 600; 
        }
        .welcome-banner { 
            background: #f0fdfa; 
            border: 2px solid #14b8a6; 
            border-radius: 8px; 
            padding: 24px; 
            text-align: center; 
            margin: 24px 0; 
        }
        .feature-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px; 
            margin: 24px 0; 
        }
        .feature-item { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            padding: 16px; 
            text-align: center; 
        }
        .btn-primary { 
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); 
        }
        @media (max-width: 600px) {
            .feature-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to {{companyName}}!</h1>
        </div>
        <div class="content">
            <div class="welcome-banner">
                <h2>Welcome aboard, {{user.name}}!</h2>
                <p>Your support portal account has been created successfully.</p>
            </div>
            
            <p>We're excited to have you join our community! Your support portal gives you access to:</p>

            <div class="feature-grid">
                <div class="feature-item">
                    <h4>🎫 Submit Tickets</h4>
                    <p>Get help quickly by submitting support requests</p>
                </div>
                <div class="feature-item">
                    <h4>📊 Track Progress</h4>
                    <p>Monitor your tickets and see real-time updates</p>
                </div>
                <div class="feature-item">
                    <h4>💬 Live Chat</h4>
                    <p>Connect with our support team instantly</p>
                </div>
                <div class="feature-item">
                    <h4>📚 Knowledge Base</h4>
                    <p>Find answers in our comprehensive help center</p>
                </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="{{baseUrl}}/portal" class="btn-primary">Access Your Portal</a>
            </div>

            <p><strong>📋 Your Account Details:</strong></p>
            <ul>
                <li><strong>Email:</strong> {{user.email}}</li>
                <li><strong>Portal URL:</strong> <a href="{{baseUrl}}/portal">{{baseUrl}}/portal</a></li>
                <li><strong>Support Email:</strong> <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></li>
            </ul>

            <p><strong>🚀 Getting Started:</strong></p>
            <ol>
                <li>Log in to your portal using the link above</li>
                <li>Complete your profile information</li>
                <li>Explore our help center for quick answers</li>
                <li>Submit your first ticket if you need assistance</li>
            </ol>
        </div>
        <div class="footer">
            <p>Welcome to {{companyName}}!</p>
            <p>Need help getting started? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
    </div>
</body>
</html>`,
      },
    };

    // Write default templates to files
    for (const [name, template] of Object.entries(defaultTemplates)) {
      const templatePath = path.join(this.templatesPath, `${name}.hbs`);
      fs.writeFileSync(templatePath, template.html, 'utf8');

      // Also save subject template
      const subjectPath = path.join(this.templatesPath, `${name}-subject.hbs`);
      fs.writeFileSync(subjectPath, template.subject, 'utf8');
    }

    logger.info('Created comprehensive default email templates');
  }

  /**
   * Render email template with enhanced placeholder support
   */
  async render(templateName, data, organizationId = null) {
    try {
      let template = null;
      let source = 'file';

      // First try to get from database templates
      if (organizationId !== undefined) {
        await this.loadDatabaseTemplates(organizationId);
        const orgKey = organizationId || 'global';
        const orgTemplates = this.dbTemplates.get(orgKey);
        
        if (orgTemplates && orgTemplates.has(templateName)) {
          template = orgTemplates.get(templateName).template;
          source = 'database';
        }
      }

      // Fallback to file-based templates
      if (!template) {
        template = this.templates.get(templateName);
        source = 'file';
      }

      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }

      // Get configuration from database/environment with proper fallbacks
      const emailConfig = await ConfigurationService.getEmailConfig();

      // Process template data with proper name parsing and enhanced data
      const processedData = processTemplateData(data);

      // Add default data with dynamic configuration
      const templateData = {
        ...processedData,
        baseUrl: emailConfig.baseUrl,
        companyName: emailConfig.companyName,
        supportEmail: emailConfig.support_email || 'support@example.com',
        responseTime: this.getResponseTime(data.ticket?.priority),
        // Add current timestamp for %CURRENTDATE% and %CURRENTTIME%
        now: new Date(),
      };

      logger.debug(`Rendering template ${templateName} from ${source}`);
      return template(templateData);
    } catch (error) {
      logger.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Render email subject with enhanced placeholder support
   */
  async renderSubject(templateName, data, organizationId = null) {
    try {
      let subjectTemplate = null;
      let source = 'file';

      // First try to get from database templates
      if (organizationId !== undefined) {
        await this.loadDatabaseTemplates(organizationId);
        const orgKey = organizationId || 'global';
        const orgTemplates = this.dbTemplates.get(orgKey);
        
        if (orgTemplates && orgTemplates.has(templateName)) {
          subjectTemplate = orgTemplates.get(templateName).subject;
          source = 'database';
        }
      }

      // Fallback to file-based subject template
      if (!subjectTemplate) {
        subjectTemplate = this.templates.get(`${templateName}-subject`);
        source = 'file';
      }

      if (!subjectTemplate) {
        // Fallback to generic subject
        return `Nova ITSM - ${templateName.replace('-', ' ')}`;
      }

      // Get configuration from database/environment with proper fallbacks
      const emailConfig = await ConfigurationService.getEmailConfig();

      // Process template data with proper name parsing
      const processedData = processTemplateData(data);

      const templateData = {
        ...processedData,
        companyName: emailConfig.companyName,
        now: new Date(),
      };

      logger.debug(`Rendering subject for ${templateName} from ${source}`);
      return subjectTemplate(templateData);
    } catch (error) {
      logger.error(`Error rendering subject for ${templateName}:`, error);
      return `Nova ITSM Notification`;
    }
  }

  /**
   * Get expected response time based on priority
   */
  getResponseTime(priority) {
    const responseTimeMap = {
      critical: '1 hour',
      high: '4 hours',
      medium: '24 hours',
      low: '72 hours',
    };

    return responseTimeMap[priority?.toLowerCase()] || '24 hours';
  }

  /**
   * Get available templates (both file and database)
   */
  async getAvailableTemplates(organizationId = null) {
    const templates = [];

    // Add file-based templates
    Array.from(this.templates.keys())
      .filter((name) => !name.endsWith('-subject'))
      .forEach((name) => {
        templates.push({
          name,
          key: name,
          hasSubject: this.templates.has(`${name}-subject`),
          category: this.getTemplateCategory(name),
          source: 'file',
          isEditable: false,
        });
      });

    // Add database templates
    try {
      const dbTemplates = await EmailTemplateModel.getAll(organizationId);
      dbTemplates.forEach((template) => {
        templates.push({
          id: template.id,
          name: template.name,
          key: template.key,
          hasSubject: true,
          category: template.category,
          source: 'database',
          isEditable: true,
          isActive: template.is_active,
          organizationId: template.organization_id,
          createdAt: template.created_at,
          updatedAt: template.updated_at,
        });
      });
    } catch (error) {
      logger.error('Error fetching database templates:', error);
    }

    return templates;
  }

  /**
   * Get database template by key for editing
   */
  async getDatabaseTemplate(key, organizationId = null) {
    try {
      return await EmailTemplateModel.getByKey(key, organizationId);
    } catch (error) {
      logger.error(`Error fetching database template ${key}:`, error);
      throw error;
    }
  }

  /**
   * Create database template
   */
  async createDatabaseTemplate(templateData) {
    try {
      const created = await EmailTemplateModel.create(templateData);
      
      // Reload database templates for this organization
      await this.loadDatabaseTemplates(templateData.organizationId);
      
      return created;
    } catch (error) {
      logger.error('Error creating database template:', error);
      throw error;
    }
  }

  /**
   * Update database template
   */
  async updateDatabaseTemplate(id, templateData) {
    try {
      const updated = await EmailTemplateModel.update(id, templateData);
      
      // Reload database templates for this organization
      const template = await EmailTemplateModel.getById(id);
      if (template) {
        await this.loadDatabaseTemplates(template.organization_id);
      }
      
      return updated;
    } catch (error) {
      logger.error('Error updating database template:', error);
      throw error;
    }
  }

  /**
   * Delete database template
   */
  async deleteDatabaseTemplate(id) {
    try {
      const template = await EmailTemplateModel.getById(id);
      const organizationId = template?.organization_id;
      
      const result = await EmailTemplateModel.delete(id);
      
      // Reload database templates for this organization
      if (organizationId !== undefined) {
        await this.loadDatabaseTemplates(organizationId);
      }
      
      return result;
    } catch (error) {
      logger.error('Error deleting database template:', error);
      throw error;
    }
  }

  /**
   * Get available placeholders
   */
  getAvailablePlaceholders() {
    return getAvailablePlaceholders();
  }

  /**
   * Validate template content
   */
  validateTemplate(template) {
    return validateTemplate(template);
  }

  /**
   * Import default templates to database
   */
  async importDefaultTemplates(organizationId = null) {
    try {
      const defaultTemplates = this.getDefaultTemplatesForImport();
      return await EmailTemplateModel.importDefaults(defaultTemplates, organizationId);
    } catch (error) {
      logger.error('Error importing default templates:', error);
      throw error;
    }
  }

  /**
   * Get template category for organization
   */
  getTemplateCategory(templateName) {
    if (templateName.includes('customer')) return 'Customer Notifications';
    if (templateName.includes('agent')) return 'Agent Notifications';
    if (templateName.includes('auto-reply')) return 'Auto-Reply';
    if (templateName.includes('escalat')) return 'Escalation';
    if (templateName.includes('password') || templateName.includes('welcome')) return 'System';
    return 'General';
  }

  /**
   * Create custom template (file-based, for backward compatibility)
   */
  createTemplate(name, html, subject) {
    try {
      // Transform industry standard placeholders to Handlebars syntax
      const transformedHtml = transformPlaceholders(html);
      const transformedSubject = subject ? transformPlaceholders(subject) : '';

      // Save HTML template
      const htmlPath = path.join(this.templatesPath, `${name}.hbs`);
      fs.writeFileSync(htmlPath, transformedHtml, 'utf8');

      // Save subject template if provided
      if (transformedSubject) {
        const subjectPath = path.join(this.templatesPath, `${name}-subject.hbs`);
        fs.writeFileSync(subjectPath, transformedSubject, 'utf8');
      }

      // Reload templates
      this.loadTemplates();

      logger.info(`Created custom file template: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error creating template ${name}:`, error);
      throw error;
    }
  }

  /**
   * Update existing template (file-based, for backward compatibility)
   */
  updateTemplate(name, html, subject) {
    try {
      if (!this.templates.has(name)) {
        throw new Error(`Template '${name}' does not exist`);
      }

      return this.createTemplate(name, html, subject);
    } catch (error) {
      logger.error(`Error updating template ${name}:`, error);
      throw error;
    }
  }

  /**
   * Delete template (file-based, for backward compatibility)
   */
  deleteTemplate(name) {
    try {
      const htmlPath = path.join(this.templatesPath, `${name}.hbs`);
      const subjectPath = path.join(this.templatesPath, `${name}-subject.hbs`);

      if (fs.existsSync(htmlPath)) {
        fs.unlinkSync(htmlPath);
      }

      if (fs.existsSync(subjectPath)) {
        fs.unlinkSync(subjectPath);
      }

      // Reload templates
      this.loadTemplates();

      logger.info(`Deleted file template: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting template ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get default templates for database import
   */
  getDefaultTemplatesForImport() {
    return [
      {
        key: 'welcome-new-user',
        name: 'Welcome New User',
        category: 'System',
        subject: 'Welcome to %COMPANYNAME% Support Portal!',
        bodyHtml: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to %COMPANYNAME%</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .welcome-banner { background: #f0fdfa; border: 2px solid #14b8a6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
        .btn-primary { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 16px 8px 16px 0; }
        .footer { background: #f8fafc; text-align: center; padding: 24px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to %COMPANYNAME%!</h1>
        </div>
        <div class="content">
            <div class="welcome-banner">
                <h2>Welcome aboard, %USERFIRST%!</h2>
                <p>Your support portal account has been created successfully.</p>
            </div>
            
            <p>Hello %USERNAME%,</p>
            <p>We're excited to have you join our community! Your support portal gives you access to comprehensive help and support.</p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="%PORTALURL%" class="btn-primary">Access Your Portal</a>
            </div>

            <p><strong>📋 Your Account Details:</strong></p>
            <ul>
                <li><strong>Email:</strong> %USEREMAIL%</li>
                <li><strong>Portal URL:</strong> <a href="%PORTALURL%">%PORTALURL%</a></li>
                <li><strong>Support Email:</strong> <a href="mailto:%SUPPORTEMAIL%">%SUPPORTEMAIL%</a></li>
            </ul>

            <p><strong>🚀 Getting Started:</strong></p>
            <ol>
                <li>Log in to your portal using the link above</li>
                <li>Complete your profile information</li>
                <li>Explore our help center for quick answers</li>
                <li>Submit your first ticket if you need assistance</li>
            </ol>
        </div>
        <div class="footer">
            <p>Welcome to %COMPANYNAME%!</p>
            <p>Need help getting started? Contact us at <a href="mailto:%SUPPORTEMAIL%">%SUPPORTEMAIL%</a></p>
        </div>
    </div>
</body>
</html>`
      },
      {
        key: 'ticket-created-customer',
        name: 'Ticket Created - Customer Notification',
        category: 'Customer Notifications',
        subject: '[%COMPANYNAME%] Ticket %TICKETID% Created - %TICKETTITLE%',
        bodyHtml: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Created</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0; }
        .ticket-id { background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
        .detail-row { display: flex; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .detail-label { font-weight: 600; width: 120px; color: #64748b; }
        .detail-value { flex: 1; }
        .expectation-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; }
        .btn-primary { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 16px 8px 16px 0; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); }
        .footer { background: #f8fafc; text-align: center; padding: 24px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎫 Support Ticket Created</h1>
        </div>
        <div class="content">
            <p>Hello %USERFIRST%,</p>
            <p>Thank you for contacting our support team. We've received your request and created a support ticket for you.</p>
            
            <div class="ticket-card">
                <div class="ticket-id">Ticket %TICKETID%</div>
                
                <div class="detail-row">
                    <div class="detail-label">Subject:</div>
                    <div class="detail-value">%TICKETTITLE%</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Priority:</div>
                    <div class="detail-value">%TICKETPRIORITY%</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">%TICKETSTATUS%</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">%TICKETCREATED%</div>
                </div>
            </div>

            <div class="expectation-box">
                <strong>📅 What to expect:</strong><br>
                Based on your ticket priority, you can expect a response within <strong>%RESPONSETIME%</strong>. 
                We'll keep you updated via email as our team works on your request.
            </div>

            <a href="%TICKETURL%" class="btn-primary">View Ticket Details</a>

            <p><strong>🔗 Tracking your ticket:</strong><br>
            Save this email for your records. You can always check your ticket status using ticket %TICKETID%.</p>
        </div>
        <div class="footer">
            <p>This message was sent from %COMPANYNAME% Support</p>
            <p>To reply to this ticket, please email <a href="mailto:%SUPPORTEMAIL%">%SUPPORTEMAIL%</a></p>
        </div>
    </div>
</body>
</html>`
      },
      {
        key: 'workflow-approval',
        name: 'Workflow Approval Request',
        category: 'Workflow',
        subject: '[%COMPANYNAME%] Approval Required - %REQUESTTITLE%',
        bodyHtml: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Approval Required</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .request-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .detail-row { display: flex; margin-bottom: 8px; }
        .detail-label { font-weight: 600; width: 120px; color: #6b7280; }
        .detail-value { flex: 1; color: #374151; }
        .action-buttons { text-align: center; margin: 32px 0; padding: 24px; background: #f9fafb; border-radius: 8px; }
        .btn { display: inline-block; padding: 14px 28px; margin: 0 8px 12px 8px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; }
        .btn-approve { background: #22c55e; color: white; }
        .btn-deny { background: #ef4444; color: white; }
        .btn-view { background: #3b82f6; color: white; }
        .footer { background: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Approval Required</h1>
            <p>A workflow is waiting for your approval</p>
        </div>
        
        <div class="content">
            <p>Hello %APPROVERNAME%,</p>
            <p>%REQUESTERNAME% has submitted a request that requires your approval.</p>
            
            <div class="request-details">
                <h3>Request Details</h3>
                <div class="detail-row">
                    <div class="detail-label">Request:</div>
                    <div class="detail-value">%REQUESTTITLE%</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Requester:</div>
                    <div class="detail-value">%REQUESTERNAME% (%REQUESTEREMAIL%)</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Submitted:</div>
                    <div class="detail-value">%CURRENTTIME%</div>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-top: 12px; line-height: 1.5;">
                    %REQUESTDESCRIPTION%
                </div>
            </div>
            
            <div class="action-buttons">
                <h4>Take Action on this Request</h4>
                <a href="#" class="btn btn-approve">✅ Approve Request</a>
                <a href="#" class="btn btn-deny">❌ Deny Request</a>
                <br>
                <a href="#" class="btn btn-view">👁️ View Full Details</a>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent by %COMPANYNAME% Workflow System.</p>
            <p>Expected response time: %RESPONSETIME%</p>
        </div>
    </div>
</body>
</html>`
      }
    ];
  }

  /**
   * Preview template with sample data (enhanced with industry standard placeholders)
   */
  async previewTemplate(templateName, sampleData = {}, organizationId = null) {
    const defaultSampleData = {
      user: {
        id: 'USR-12345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        firstName: 'John',
        lastName: 'Doe',
      },
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        firstName: 'John',
        lastName: 'Doe',
      },
      ticket: {
        id: 'NOVA-12345',
        ticketNumber: 'NOVA-12345',
        title: 'Sample Support Request',
        description: 'This is a sample ticket description for template preview.',
        priority: 'medium',
        status: 'open',
        category: 'Access Management',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      assignee: {
        name: 'Support Agent',
        email: 'agent@company.com',
        firstName: 'Support',
        lastName: 'Agent',
      },
      approver: {
        name: 'Manager Smith',
        email: 'manager@company.com',
        firstName: 'Manager',
        lastName: 'Smith',
      },
      requester: {
        name: 'John Doe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      update: {
        user: {
          name: 'Support Agent',
          firstName: 'Support',
          lastName: 'Agent',
        },
        comment: 'Sample update comment for preview purposes.',
        createdAt: new Date(),
      },
      // Workflow data
      title: 'Database Access Request',
      description: 'User needs read access to customer database for reporting purposes.',
      requestDetails: 'User needs read access to customer database for reporting purposes.',
      department: 'IT Department',
      location: 'New York Office',
      office: 'New York Office',
      
      // URLs
      ticketUrl: 'https://nova.company.com/tickets/12345',
      
      // Dates
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      now: new Date(),
      
      // System info
      companyName: 'Acme Corporation',
      supportEmail: 'support@acme.com',
      baseUrl: 'https://nova.acme.com',
      responseTime: '4 hours',
    };

    const mergedData = { ...defaultSampleData, ...sampleData };
    
    try {
      const html = await this.render(templateName, mergedData, organizationId);
      const subject = await this.renderSubject(templateName, mergedData, organizationId);
      
      return {
        subject,
        html,
        templateName,
        sampleData: mergedData,
      };
    } catch (error) {
      logger.error(`Error previewing template ${templateName}:`, error);
      throw error;
    }
  }
}

export default new EmailTemplateService();
