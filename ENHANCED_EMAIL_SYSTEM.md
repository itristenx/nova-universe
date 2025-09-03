# 📧 Nova Enhanced Email/Notification System

> **ServiceNow & Zendesk-style email notifications with rich actions and conversation threading**

Nova now features a comprehensive email notification system that rivals ServiceNow and Zendesk in functionality, providing rich email communications, workflow actions, and robust conversation threading.

## 🎯 Key Features

### ✅ Email Threading & Tracking
- **Conversation Threading**: Proper Message-ID and In-Reply-To headers for email clients
- **Ticket Integration**: Automatic email replies route back to correct tickets
- **Tracking Pixels**: Email open tracking and delivery confirmation
- **Rich Metadata**: Comprehensive email tracking with audit trails

### ✅ Email-Based Workflow Actions
- **Action Buttons**: Approve/Deny/Comment directly from email (like ServiceNow)
- **Secure Tokens**: One-time use tokens with expiration and audit logging
- **Mobile-Friendly**: Action buttons work on desktop and mobile email clients
- **Fallback Options**: Alternative methods if buttons don't work

### ✅ Rich Email Templates
- **Professional Design**: Modern, responsive HTML email templates
- **Action Integration**: Built-in support for workflow action buttons
- **Conversation Display**: Show recent ticket activity in emails
- **Brand Customization**: Easy theming and customization options

### ✅ Advanced Security
- **Token Security**: Secure token generation with expiration (24h default)
- **Audit Logging**: Complete audit trail for all email actions
- **IP Tracking**: Track user agent and IP address for security
- **Webhook Validation**: Secure webhook signatures for email processing

## 🚀 Quick Start

### 1. Send Workflow Approval Email

```javascript
import EnhancedNotificationIntegration from './apps/api/services/enhanced-notification-integration.service.js';

const workflowData = {
  ticketId: 'NOVA-12345',
  workflowId: 'access-request',
  title: 'Database Access Request',
  description: 'User requesting production database access',
  priority: 'high',
  approvers: [
    { id: 'mgr1', email: 'manager@company.com', name: 'System Manager' }
  ],
  requester: { name: 'John Doe', email: 'john@company.com' }
};

const result = await EnhancedNotificationIntegration.sendWorkflowApprovalNotification(workflowData);
// Sends rich HTML email with APPROVE/DENY buttons that work from email
```

### 2. Send Enhanced Ticket Notification

```javascript
const ticketData = {
  ticket: {
    id: 'NOVA-12345',
    title: 'Wi-Fi connectivity issue',
    status: 'in_progress',
    priority: 'medium'
  },
  recipients: [
    { email: 'customer@company.com', name: 'Jane User' }
  ],
  latestUpdate: {
    author: { name: 'Alex Tech' },
    content: 'I\'ve identified the issue and am working on a solution.'
  },
  conversationThread: [/* recent activity */]
};

const result = await EnhancedNotificationIntegration.sendEnhancedTicketNotification(ticketData);
// Sends threaded email showing conversation history
```

### 3. Process Email Replies

```javascript
import enhancedEmailTrackingService from './apps/api/services/enhanced-email-tracking.service.js';

const emailData = {
  messageId: '<reply@customer.com>',
  inReplyTo: '<nova-12345-timestamp-uuid@nova.local>',
  from: 'customer@company.com',
  subject: 'RE: [NOVA-12345] Your support request',
  bodyText: 'Thank you for the update!'
};

const result = await enhancedEmailTrackingService.processEmailReply(emailData);
// Automatically adds reply as comment to correct ticket
```

## 📡 API Endpoints

### Email Action Endpoints

```bash
# Approve workflow from email
GET /api/v2/email-actions/approve?token={secure_token}

# Deny workflow from email  
GET /api/v2/email-actions/deny?token={secure_token}

# Redirect to comment on ticket
GET /api/v2/email-actions/comment?token={secure_token}

# Email open tracking pixel
GET /api/v2/email-tracking/pixel/{tracking_id}.png

# Process incoming email replies
POST /api/v2/email-actions/webhook/reply
```

### Example Action URL Usage

When users receive workflow approval emails, they can click buttons that make requests like:

```
https://nova.company.com/api/v2/email-actions/approve?token=abc123...
```

This will:
1. ✅ Validate the secure one-time token
2. ✅ Execute the approval in the workflow system  
3. ✅ Update the ticket status
4. ✅ Send notifications to relevant parties
5. ✅ Show a user-friendly confirmation page
6. ✅ Log the action for audit/compliance

## 🎨 Email Templates

### Available Templates

| Template | Purpose | Features |
|----------|---------|----------|
| `workflow-approval.hbs` | Workflow approvals | Action buttons, rich context, mobile-responsive |
| `ticket-updated-enhanced.hbs` | Ticket notifications | Conversation threading, status changes, SLA info |
| `workflow-approval-subject.hbs` | Approval email subjects | Proper threading with ticket IDs |
| `ticket-updated-enhanced-subject.hbs` | Ticket email subjects | Status indicators, threading support |

### Template Features

- 📱 **Mobile Responsive**: Works perfectly on desktop and mobile
- 🎨 **Professional Design**: Modern, clean email styling
- 🔘 **Action Buttons**: Large, prominent buttons for key actions
- 📊 **Rich Context**: Show all relevant information clearly
- 🧵 **Threading Support**: Proper email client threading
- 🏢 **Brand Customization**: Easy to customize with your branding

## 🔧 Configuration

### Environment Variables

```bash
# Base URL for action links and tracking
PUBLIC_URL=https://nova.company.com

# Email webhook security
EMAIL_WEBHOOK_SECRET=your_secure_webhook_secret

# System email address  
SYSTEM_EMAIL=noreply@nova.company.com

# M365 integration (existing)
M365_CLIENT_ID=your_client_id
M365_CLIENT_SECRET=your_client_secret
M365_TENANT_ID=your_tenant_id
```

### Email Provider Setup

The system integrates with Nova's existing M365 email service. Ensure your M365 configuration is properly set up for sending emails.

## 🔒 Security Features

### Token Security
- **Secure Generation**: Cryptographically secure random tokens
- **One-Time Use**: Tokens become invalid after use
- **Expiration**: Configurable expiration (default 24 hours)
- **Context Binding**: Tokens tied to specific actions and tickets

### Audit & Compliance  
- **Complete Audit Trail**: Every email action is logged
- **IP Address Tracking**: Track who performed actions from where
- **User Agent Logging**: Device and browser information
- **Webhook Validation**: Secure webhook signatures

### Example Audit Log Entry
```json
{
  "action": "email_action_executed",
  "token": "abc123...",
  "ticketId": "NOVA-12345",
  "decision": "approved",
  "timestamp": "2024-09-03T12:00:00Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "context": {
    "workflowId": "access-request",
    "approver": "manager@company.com"
  }
}
```

## 🔄 Email Threading & Reply Processing

### How Email Threading Works

1. **Outbound Emails**: Include proper Message-ID headers
   ```
   Message-ID: <nova-12345-1756903791969-abc123@nova.local>
   X-Nova-Ticket-ID: 12345
   X-Nova-Conversation-ID: nova-conversation-12345
   ```

2. **Reply Emails**: Include In-Reply-To for threading
   ```
   In-Reply-To: <nova-12345-1756903791969-abc123@nova.local>
   References: <nova-12345-1756903791969-abc123@nova.local>
   ```

3. **Reply Processing**: Automatically routes replies back to tickets
   - Extract ticket ID from headers or In-Reply-To
   - Add reply as comment to correct ticket
   - Notify assigned technician
   - Maintain conversation thread

### Subject Line Threading

Subject lines include ticket IDs for proper threading:
```
[NOVA-12345] High Priority - Database Access Request
RE: [NOVA-12345] Your support request has been updated
```

## 🧪 Testing

### Run Tests

```bash
npm test test/enhanced-email-notifications.test.js
```

### Run Demo

```bash
node demo-enhanced-email-system.js
```

### Test Email Actions

1. Generate test action URLs:
```javascript
const actionUrls = enhancedEmailTrackingService.generateActionUrls('12345', 'wf-001');
console.log('Test approve URL:', actionUrls.approve.url);
```

2. Visit the URL in a browser to test the workflow

## 📊 Monitoring & Analytics

### Email Tracking

- **Delivery Confirmation**: Tracking pixels show email opens
- **Action Completion**: Track which actions are taken from emails  
- **Response Times**: Monitor how quickly users respond to emails
- **Failure Tracking**: Comprehensive error logging and retry logic

### Integration with Nova Analytics

The email system integrates with Nova's existing analytics platform to provide:
- Email delivery rates
- Action completion rates  
- Response time metrics
- User engagement analytics

## 🔗 Integration Points

### Existing Nova Systems

- ✅ **Universal Notification Platform (UNP)**: Seamless integration
- ✅ **M365 Email Service**: Uses existing email infrastructure  
- ✅ **Workflow Engine**: Actions trigger workflow state changes
- ✅ **Enhanced Ticket Service**: Reply processing adds comments
- ✅ **Audit System**: All actions logged for compliance
- ✅ **RBAC (Helix)**: Respects user permissions and roles

### Migration from Existing Systems

The enhanced email system is designed to work alongside existing notification methods:
- Existing email templates continue to work
- New features are opt-in via template selection
- Backward compatibility maintained for v1 API endpoints

## 🚀 Production Deployment

### Deployment Checklist

- [ ] Configure environment variables
- [ ] Set up email webhook endpoints  
- [ ] Test action token generation/validation
- [ ] Verify M365 email service integration
- [ ] Test email reply processing webhook
- [ ] Configure monitoring and alerting
- [ ] Train support staff on new features

### Scaling Considerations

- **Token Storage**: Uses in-memory Map (consider Redis for multi-instance deployments)
- **Email Volume**: Integrates with existing M365 rate limiting
- **Webhook Processing**: Consider queue-based processing for high volume
- **Template Caching**: Templates are cached in memory for performance

## 🆘 Troubleshooting

### Common Issues

**Email actions not working:**
- Check PUBLIC_URL environment variable
- Verify token generation and validation
- Check browser console for JavaScript errors

**Replies not routing to tickets:**  
- Verify webhook endpoint configuration
- Check email headers for ticket ID extraction
- Review audit logs for processing errors

**Templates not rendering:**
- Check template file paths and permissions
- Verify Handlebars helpers registration
- Review template syntax for errors

### Debug Mode

Enable debug logging:
```javascript
// Set LOG_LEVEL=debug in environment
logger.debug('Email action processing', { token, context });
```

## 📚 Additional Resources

- [Nova Universal Notification Platform Documentation](./docs/NOVA_UNIVERSAL_NOTIFICATION_PLATFORM.md)
- [M365 Email Integration Guide](./apps/api/README-m365-email.md)  
- [Workflow Engine Documentation](./docs/workflow-engine.md)
- [API Reference](./docs/api-reference.md)

## 🤝 Contributing

When adding new email features:

1. Follow existing template patterns
2. Include comprehensive tests
3. Update this documentation
4. Consider security implications
5. Test with multiple email clients
6. Verify mobile responsiveness

---

**🎯 Result**: Nova now provides enterprise-grade email notifications that match the functionality of ServiceNow and Zendesk, with rich HTML emails, workflow actions, conversation threading, and comprehensive security features.