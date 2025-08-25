import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';
import ConfigurationService from './configuration.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailTemplateService {
  constructor() {
    this.templates = new Map();
    this.templatesPath = path.join(__dirname, '../templates/email');
    this.loadTemplates();
  }

  /**
   * Load all email templates
   */
  loadTemplates() {
    try {
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
            this.templates.set(templateName, Handlebars.compile(templateContent));
            logger.info(`Loaded email template: ${templateName}`);
          } catch (error) {
            logger.error(`Error compiling template ${templateName}:`, error);
          }
        }
      }

      // Register helpers
      this.registerHelpers();

      logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      logger.error('Error loading email templates:', error);
    }
  }

  /**
   * Register Handlebars helpers
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
   * Render email template
   */
  async render(templateName, data) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }

      // Get configuration from database/environment with proper fallbacks
      const emailConfig = await ConfigurationService.getEmailConfig();

      // Add default data with dynamic configuration
      const templateData = {
        ...data,
        baseUrl: emailConfig.baseUrl,
        companyName: emailConfig.companyName,
        supportEmail: emailConfig.support_email || 'support@example.com',
        responseTime: this.getResponseTime(data.ticket?.priority),
      };

      return template(templateData);
    } catch (error) {
      logger.error(`Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Render email subject
   */
  async renderSubject(templateName, data) {
    try {
      const subjectTemplate = this.templates.get(`${templateName}-subject`);
      if (!subjectTemplate) {
        // Fallback to generic subject
        return `Nova ITSM - ${templateName.replace('-', ' ')}`;
      }

      // Get configuration from database/environment with proper fallbacks
      const emailConfig = await ConfigurationService.getEmailConfig();

      const templateData = {
        ...data,
        companyName: emailConfig.companyName,
      };

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
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.templates.keys())
      .filter((name) => !name.endsWith('-subject'))
      .map((name) => ({
        name,
        hasSubject: this.templates.has(`${name}-subject`),
        category: this.getTemplateCategory(name),
      }));
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
   * Create custom template
   */
  createTemplate(name, html, subject) {
    try {
      // Save HTML template
      const htmlPath = path.join(this.templatesPath, `${name}.hbs`);
      fs.writeFileSync(htmlPath, html, 'utf8');

      // Save subject template if provided
      if (subject) {
        const subjectPath = path.join(this.templatesPath, `${name}-subject.hbs`);
        fs.writeFileSync(subjectPath, subject, 'utf8');
      }

      // Reload templates
      this.loadTemplates();

      logger.info(`Created custom template: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error creating template ${name}:`, error);
      throw error;
    }
  }

  /**
   * Update existing template
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
   * Delete template
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

      logger.info(`Deleted template: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting template ${name}:`, error);
      throw error;
    }
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(templateName, sampleData = {}) {
    const defaultSampleData = {
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      ticket: {
        id: 'TICKET-12345',
        title: 'Sample Support Request',
        description: 'This is a sample ticket description for template preview.',
        priority: 'medium',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      assignee: {
        name: 'Support Agent',
        email: 'agent@company.com',
      },
      update: {
        user: {
          name: 'Support Agent',
        },
        comment: 'Sample update comment for preview purposes.',
        createdAt: new Date(),
      },
      companyName: 'Nova ITSM',
      supportEmail: 'support@nova.com',
    };

    const mergedData = { ...defaultSampleData, ...sampleData };
    return await this.render(templateName, mergedData);
  }
}

export default new EmailTemplateService();
