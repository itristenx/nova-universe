# Enhanced Email Template System - Documentation

## Overview

The Nova ITSM email template system has been completely enhanced with professional, enterprise-grade email templates that provide rich HTML designs with modern CSS styling. This system supports comprehensive customer and agent communications that rival platforms like HelpScout and Zendesk.

## Features

### Professional Templates

- **Modern Design**: Apple-inspired gradients, proper typography, and responsive layouts
- **Mobile Optimized**: All templates are fully responsive for mobile devices
- **Rich Styling**: Professional CSS with gradients, shadows, and modern design elements
- **Handlebars Integration**: Dynamic content rendering with powerful helper functions

### Template Categories

#### 1. Customer Notifications

- `ticket-created-customer`: Welcome message when a ticket is created
- `ticket-updated-customer`: Updates when agents respond to tickets
- `ticket-resolved-customer`: Satisfaction survey and closure notification

#### 2. Agent Notifications

- `ticket-assigned-agent`: Assignment notifications with customer context
- `ticket-escalated-agent`: Urgent escalation alerts with priority styling

#### 3. Auto-Reply Templates

- `auto-reply-received`: Professional acknowledgment of customer submissions

#### 4. System Templates

- `password-reset`: Secure password reset with expiration warnings
- `welcome-new-user`: Onboarding for new portal users

## Environment Variables Integration

All templates automatically use configured environment variables:

```env
# Primary URL Configuration
WEB_BASE_URL=https://support.company.com
BASE_URL=https://api.company.com
PUBLIC_URL=https://app.company.com

# Email Service Configuration
ORGANIZATION_NAME=Your Company Name
COMPANY_NAME=Your Company Name
SUPPORT_EMAIL=support@company.com
```

### URL Fallback Chain

Templates use a robust fallback system:

1. `WEB_BASE_URL` (preferred for customer-facing URLs)
2. `BASE_URL` (API base URL)
3. `PUBLIC_URL` (public application URL)
4. `http://localhost:3000` (development fallback)

## Template Structure

### File Organization

```
apps/api/templates/email/
├── ticket-created-customer.hbs          # HTML template
├── ticket-created-customer-subject.hbs  # Subject line template
├── ticket-updated-customer.hbs
├── ticket-updated-customer-subject.hbs
├── ticket-resolved-customer.hbs
├── ticket-resolved-customer-subject.hbs
├── ticket-assigned-agent.hbs
├── ticket-assigned-agent-subject.hbs
├── ticket-escalated-agent.hbs
├── ticket-escalated-agent-subject.hbs
├── auto-reply-received.hbs
├── auto-reply-received-subject.hbs
├── password-reset.hbs
├── password-reset-subject.hbs
├── welcome-new-user.hbs
└── welcome-new-user-subject.hbs
```

## Service Usage

### Basic Usage

```javascript
import emailTemplateService from '../services/email-template.service.js';

// Render a template
const html = emailTemplateService.render('ticket-created-customer', {
  customer: { name: 'John Doe', email: 'john@example.com' },
  ticket: { id: 'TICKET-123', title: 'Support Request', priority: 'high' },
});

// Render subject line
const subject = emailTemplateService.renderSubject('ticket-created-customer', {
  companyName: 'Nova ITSM',
  ticket: { id: 'TICKET-123', title: 'Support Request' },
});
```

### Available Methods

#### Template Management

- `render(templateName, data)` - Render HTML template
- `renderSubject(templateName, data)` - Render subject line
- `getAvailableTemplates()` - List all templates with categories
- `previewTemplate(templateName, sampleData)` - Preview with sample data

#### Template Creation/Modification

- `createTemplate(name, html, subject)` - Create custom template
- `updateTemplate(name, html, subject)` - Update existing template
- `deleteTemplate(name)` - Remove template

## Handlebars Helpers

The system includes comprehensive Handlebars helpers:

### Date Formatting

- `{{formatDate date}}` - Format as locale date
- `{{formatDateTime date}}` - Format as locale date/time

### String Manipulation

- `{{upperCase string}}` - Convert to uppercase
- `{{lowerCase string}}` - Convert to lowercase
- `{{capitalize string}}` - Capitalize first letter
- `{{truncate string length}}` - Truncate with ellipsis
- `{{substring string start end}}` - Extract substring

### Conditional Logic

- `{{#if (eq value1 value2)}}` - Equality check
- `{{#if (ne value1 value2)}}` - Not equal check
- `{{#if (gt value1 value2)}}` - Greater than check
- `{{#if (lt value1 value2)}}` - Less than check

## Template Data Structure

### Customer Notification Data

```javascript
{
  customer: {
    name: "Customer Name",
    email: "customer@example.com"
  },
  ticket: {
    id: "TICKET-123",
    title: "Issue Description",
    description: "Detailed issue description",
    priority: "high|medium|low|critical",
    status: "open|in-progress|resolved|closed",
    createdAt: Date,
    updatedAt: Date
  },
  update: {
    user: { name: "Agent Name" },
    comment: "Update comment",
    createdAt: Date
  },
  baseUrl: "https://support.company.com",
  companyName: "Company Name",
  supportEmail: "support@company.com",
  responseTime: "4 hours" // Auto-calculated based on priority
}
```

### Agent Notification Data

```javascript
{
  assignee: {
    name: "Agent Name",
    email: "agent@company.com"
  },
  ticket: {
    // Same structure as customer notifications
    customer: {
      name: "Customer Name",
      email: "customer@example.com"
    }
  },
  escalation: {
    escalatedBy: { name: "Manager Name" },
    escalatedAt: Date,
    reason: "SLA breach"
  }
}
```

## Design System

### Color Palette

- **Primary Blue**: `#3b82f6` to `#1d4ed8` (Customer notifications)
- **Success Green**: `#10b981` to `#059669` (Updates, resolved)
- **Warning Orange**: `#f59e0b` to `#d97706` (Assignments, alerts)
- **Danger Red**: `#dc2626` to `#b91c1c` (Escalations, critical)
- **Info Purple**: `#8b5cf6` to `#7c3aed` (System notifications)
- **Neutral Cyan**: `#06b6d4` to `#0891b2` (Welcome, onboarding)

### Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Line Height**: `1.6` for optimal readability
- **Color**: `#374151` for body text, `#64748b` for secondary

### Layout Components

- **Container**: Max-width 600px with centered layout
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Badges**: Priority and status indicators with appropriate colors

## Priority-Based Response Times

The system automatically calculates expected response times:

- **Critical**: 1 hour
- **High**: 4 hours
- **Medium**: 24 hours
- **Low**: 72 hours

## Integration Examples

### Email Service Integration

```javascript
import emailTemplateService from './services/email-template.service.js';
import emailService from './services/email.service.js';

const sendTicketCreatedEmail = async (ticket, customer) => {
  const html = emailTemplateService.render('ticket-created-customer', {
    ticket,
    customer,
    responseTime: emailTemplateService.getResponseTime(ticket.priority),
  });

  const subject = emailTemplateService.renderSubject('ticket-created-customer', {
    companyName: process.env.ORGANIZATION_NAME,
    ticket,
  });

  await emailService.sendEmail({
    to: customer.email,
    subject,
    html,
  });
};
```

### Notification Service Integration

```javascript
const sendAgentAssignmentEmail = async (ticket, agent) => {
  const html = emailTemplateService.render('ticket-assigned-agent', {
    ticket,
    assignee: agent,
    responseTime: emailTemplateService.getResponseTime(ticket.priority),
  });

  const subject = emailTemplateService.renderSubject('ticket-assigned-agent', {
    companyName: process.env.ORGANIZATION_NAME,
    ticket,
  });

  await emailService.sendEmail({
    to: agent.email,
    subject,
    html,
  });
};
```

## Customization

### Creating Custom Templates

1. **Create HTML Template**:

```handlebars
<html>
  <head>
    <meta charset='utf-8' />
    <title>{{subject}}</title>
    <style>
      /* Custom CSS */
    </style>
  </head>
  <body>
    <div class='container'>
      <h1>{{title}}</h1>
      <p>Hello {{customer.name}},</p>
      <!-- Template content -->
    </div>
  </body>
</html>
```

2. **Create Subject Template**:

```handlebars
[{{companyName}}] {{ticket.title}} - Custom Notification
```

3. **Register Template**:

```javascript
emailTemplateService.createTemplate('custom-notification', htmlTemplate, subjectTemplate);
```

### Template Testing

Use the preview function for development:

```javascript
// Test with sample data
const html = emailTemplateService.previewTemplate('ticket-created-customer');
console.log(html); // Full HTML output

// Test specific scenarios
const escalationHtml = emailTemplateService.previewTemplate('ticket-escalated-agent', {
  escalation: {
    reason: 'SLA breach - Customer waiting 48 hours',
    escalatedBy: { name: 'Support Manager' },
  },
});
```

## Best Practices

### Performance

- Templates are compiled once and cached in memory
- Use appropriate helpers to minimize template complexity
- Keep template file sizes reasonable (< 10KB recommended)

### Accessibility

- All templates include proper semantic HTML
- Color contrast ratios meet WCAG standards
- Email clients compatibility considered

### Security

- All user data is automatically escaped by Handlebars
- No JavaScript execution in templates
- Safe HTML rendering only

### Maintainability

- Use consistent naming conventions
- Document custom helpers thoroughly
- Test templates across email clients
- Version control template changes

## Testing

Run template tests to ensure all templates render correctly:

```bash
# Test template loading
node -e "import('./apps/api/services/email-template.service.js').then(m => console.log('Templates:', m.default.getAvailableTemplates().length))"

# Test specific template rendering
node -e "import('./apps/api/services/email-template.service.js').then(m => console.log(m.default.previewTemplate('ticket-created-customer').length))"
```

## Troubleshooting

### Common Issues

1. **Template Not Found**: Ensure `.hbs` files exist in templates directory
2. **Import Errors**: Check logger import is `{ logger }` not default
3. **Rendering Errors**: Validate Handlebars syntax and data structure
4. **Missing Styles**: Verify CSS is included in template head section

### Debug Mode

Enable debug logging to troubleshoot template issues:

```javascript
// Check available templates
console.log(emailTemplateService.getAvailableTemplates());

// Test template compilation
try {
  const html = emailTemplateService.render('template-name', data);
  console.log('Template rendered successfully');
} catch (error) {
  console.error('Template error:', error.message);
}
```

This enhanced email template system provides enterprise-grade email communications that enhance the professional appearance of your ITSM platform and improve customer satisfaction through clear, well-designed notifications.
