# Enhanced Email Template System - Admin Guide

## Overview

Nova now provides enterprise-grade email templates with industry standard placeholder support, enabling administrators to create and manage professional email communications that dynamically populate user data. This system supports both file-based templates and database-managed templates for maximum flexibility.

## Key Features

### ✨ Industry Standard Placeholders
- **Easy-to-use syntax**: Use `%USERFIRST%`, `%COMPANYNAME%`, `%TICKETID%` instead of complex template syntax
- **Auto-completion friendly**: Standard placeholder names that work across platforms
- **Comprehensive coverage**: 40+ predefined placeholders for all common use cases
- **Dynamic data substitution**: Automatic name parsing, date formatting, and data processing

### 🛠️ Admin-Editable Templates
- **Database storage**: Templates stored in database for easy editing
- **Version control**: Track changes and updates to templates
- **Organization-specific**: Custom templates per organization or global defaults
- **Live preview**: Test templates with sample data before deployment
- **Validation**: Built-in validation to catch errors and suggest improvements

### 🔄 Backward Compatibility
- **Dual support**: Works with both industry standard placeholders and existing Handlebars syntax
- **Gradual migration**: Update templates at your own pace
- **File fallback**: Continues to support file-based templates for custom workflows

## Available Placeholders

### User/Customer Information
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%USERFIRST%` | User's first name | John |
| `%USERLAST%` | User's last name | Doe |
| `%USERNAME%` | User's full name | John Doe |
| `%USEREMAIL%` | User's email address | john.doe@company.com |
| `%USERPHONE%` | User's phone number | +1-555-123-4567 |
| `%USERID%` | User's unique ID | USR-12345 |
| `%CUSTOMERNAME%` | Customer name (for external users) | John Doe |
| `%CUSTOMEREMAIL%` | Customer email | customer@external.com |

### Ticket Information
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%TICKETID%` | Ticket ID/Number | NOVA-12345 |
| `%TICKETTITLE%` | Ticket title/subject | Password Reset Request |
| `%TICKETDESCRIPTION%` | Ticket description | User cannot access account... |
| `%TICKETSTATUS%` | Current ticket status | Open |
| `%TICKETPRIORITY%` | Ticket priority level | High |
| `%TICKETCATEGORY%` | Ticket category | Access Management |
| `%TICKETURL%` | Direct link to ticket | https://nova.company.com/tickets/12345 |
| `%TICKETCREATED%` | Ticket creation date/time | January 14, 2024 9:15 AM |
| `%TICKETUPDATED%` | Last update date/time | January 15, 2024 1:45 PM |

### Agent/Support Information
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%AGENTNAME%` | Assigned agent's name | Jane Smith |
| `%AGENTFIRST%` | Agent's first name | Jane |
| `%AGENTLAST%` | Agent's last name | Smith |
| `%AGENTEMAIL%` | Agent's email address | jane.smith@company.com |

### Company/System Information
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%COMPANYNAME%` | Company/Organization name | Acme Corporation |
| `%SUPPORTEMAIL%` | Support email address | support@company.com |
| `%BASEURL%` | System base URL | https://nova.company.com |
| `%PORTALURL%` | Customer portal URL | https://nova.company.com/portal |

### Date/Time Information
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%CURRENTDATE%` | Current date | January 15, 2024 |
| `%CURRENTTIME%` | Current date and time | January 15, 2024 2:30 PM |
| `%DUEDATE%` | Ticket due date/time | January 16, 2024 5:00 PM |

### Workflow/Approval Information
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%REQUESTTITLE%` | Approval request title | Database Access Request |
| `%REQUESTDESCRIPTION%` | Request description | User needs read access... |
| `%APPROVERNAME%` | Approver's name | Manager Name |
| `%REQUESTERNAME%` | Requester's name | Employee Name |
| `%RESPONSETIME%` | Expected response time | 4 hours |

### Advanced Placeholders
| Placeholder | Description | Example |
|-------------|-------------|---------|
| `%DEPARTMENT%` | User's department | IT Department |
| `%LOCATION%` | User's location | New York Office |
| `%PRIORITYCOLOR%` | Priority color code | #ff0000 |
| `%STATUSCOLOR%` | Status color code | #00ff00 |

## API Endpoints for Template Management

### 1. List All Templates
```http
GET /api/email-templates/templates?organizationId=<uuid>
```
Returns both file-based and database templates available to the organization.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Welcome New User",
      "key": "welcome-new-user",
      "category": "System",
      "source": "database",
      "isEditable": true,
      "isActive": true,
      "organizationId": "uuid",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Get Available Placeholders
```http
GET /api/email-templates/placeholders
```
Returns all available placeholders with descriptions and examples.

### 3. Create New Template
```http
POST /api/email-templates/templates/database
Content-Type: application/json

{
  "key": "custom-notification",
  "name": "Custom Notification",
  "subject": "Hello %USERFIRST% - %COMPANYNAME% Update",
  "bodyHtml": "<html><body><h1>Hello %USERFIRST%!</h1><p>This is a custom notification from %COMPANYNAME%.</p></body></html>",
  "bodyText": "Hello %USERFIRST%! This is a custom notification from %COMPANYNAME%.",
  "category": "Custom",
  "organizationId": "uuid-or-null-for-global"
}
```

### 4. Update Existing Template
```http
PUT /api/email-templates/templates/database/{template-id}
Content-Type: application/json

{
  "name": "Updated Template Name",
  "subject": "Updated Subject with %USERFIRST%",
  "bodyHtml": "<html><body><h1>Updated content</h1></body></html>",
  "isActive": true
}
```

### 5. Delete Template
```http
DELETE /api/email-templates/templates/database/{template-id}
```

### 6. Preview Template
```http
POST /api/email-templates/templates/{template-name}/preview
Content-Type: application/json

{
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "ticket": {
      "id": "TEST-123",
      "title": "Test Ticket"
    }
  }
}
```

### 7. Validate Template
```http
POST /api/email-templates/templates/validate
Content-Type: application/json

{
  "content": "<html><body>Hello %USERFIRST%</body></html>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "suggestions": []
  }
}
```

### 8. Import Default Templates
```http
POST /api/email-templates/templates/import-defaults
Content-Type: application/json

{
  "organizationId": "uuid-or-null-for-global"
}
```

## Template Examples

### 1. Welcome Email Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to %COMPANYNAME%</title>
</head>
<body>
    <h1>Welcome to %COMPANYNAME%, %USERFIRST%!</h1>
    
    <p>Hello %USERNAME%,</p>
    
    <p>We're excited to have you join our community! Your account has been created successfully.</p>
    
    <div style="background: #f0f9ff; padding: 20px; margin: 20px 0;">
        <h3>Your Account Details:</h3>
        <ul>
            <li><strong>Email:</strong> %USEREMAIL%</li>
            <li><strong>Portal:</strong> <a href="%PORTALURL%">%PORTALURL%</a></li>
            <li><strong>Support:</strong> <a href="mailto:%SUPPORTEMAIL%">%SUPPORTEMAIL%</a></li>
        </ul>
    </div>
    
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
    
    <p>Best regards,<br>
    The %COMPANYNAME% Team</p>
</body>
</html>
```

### 2. Ticket Created Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket %TICKETID% Created</title>
</head>
<body>
    <h1>Support Ticket Created</h1>
    
    <p>Hello %USERFIRST%,</p>
    
    <p>Thank you for contacting our support team. We've received your request and created support ticket <strong>%TICKETID%</strong>.</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0;">
        <h3>Ticket Details</h3>
        <table style="width: 100%;">
            <tr>
                <td><strong>Ticket ID:</strong></td>
                <td>%TICKETID%</td>
            </tr>
            <tr>
                <td><strong>Subject:</strong></td>
                <td>%TICKETTITLE%</td>
            </tr>
            <tr>
                <td><strong>Priority:</strong></td>
                <td style="color: %PRIORITYCOLOR%;">%TICKETPRIORITY%</td>
            </tr>
            <tr>
                <td><strong>Status:</strong></td>
                <td style="color: %STATUSCOLOR%;">%TICKETSTATUS%</td>
            </tr>
            <tr>
                <td><strong>Created:</strong></td>
                <td>%TICKETCREATED%</td>
            </tr>
        </table>
    </div>
    
    <p><strong>What to expect:</strong> Based on your ticket priority, you can expect a response within <strong>%RESPONSETIME%</strong>.</p>
    
    <p><a href="%TICKETURL%" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Ticket</a></p>
    
    <p>Best regards,<br>
    %COMPANYNAME% Support Team<br>
    <a href="mailto:%SUPPORTEMAIL%">%SUPPORTEMAIL%</a></p>
</body>
</html>
```

### 3. Approval Request Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Approval Required - %REQUESTTITLE%</title>
</head>
<body>
    <h1>🚀 Approval Required</h1>
    
    <p>Hello %APPROVERNAME%,</p>
    
    <p><strong>%REQUESTERNAME%</strong> has submitted a request that requires your approval.</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0;">
        <h3>Request Details</h3>
        <table style="width: 100%;">
            <tr>
                <td><strong>Request:</strong></td>
                <td>%REQUESTTITLE%</td>
            </tr>
            <tr>
                <td><strong>Requester:</strong></td>
                <td>%REQUESTERNAME% (%REQUESTEREMAIL%)</td>
            </tr>
            <tr>
                <td><strong>Department:</strong></td>
                <td>%DEPARTMENT%</td>
            </tr>
            <tr>
                <td><strong>Submitted:</strong></td>
                <td>%CURRENTTIME%</td>
            </tr>
        </table>
        
        <div style="background: white; border: 1px solid #d1d5db; padding: 15px; margin-top: 15px;">
            <strong>Description:</strong><br>
            %REQUESTDESCRIPTION%
        </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="#approve" style="background: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 0 10px;">✅ Approve</a>
        <a href="#deny" style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 0 10px;">❌ Deny</a>
    </div>
    
    <p><small>Expected response time: <strong>%RESPONSETIME%</strong></small></p>
    
    <p>Best regards,<br>
    %COMPANYNAME% Workflow System</p>
</body>
</html>
```

## Best Practices

### 1. Template Organization
- **Use descriptive keys**: `welcome-new-customer` instead of `template1`
- **Categorize properly**: Use categories like `Customer Notifications`, `System`, `Workflow`
- **Version control**: Keep track of changes and test thoroughly

### 2. Content Guidelines
- **Mobile-friendly**: Use responsive design principles
- **Accessibility**: Include alt text for images, proper heading structure
- **Brand consistency**: Use company colors, fonts, and messaging
- **Clear CTAs**: Make action buttons prominent and clear

### 3. Placeholder Usage
- **Fallback values**: Always test with missing data
- **Formatting**: Use appropriate date/time formats for your audience
- **Personalization**: Use first names for friendly tone, full names for formal communications

### 4. Testing
- **Preview templates**: Always preview with realistic sample data
- **Multiple scenarios**: Test with different user types, ticket priorities, etc.
- **Cross-platform**: Test in different email clients (Gmail, Outlook, etc.)
- **Performance**: Keep templates reasonably sized for fast loading

### 5. Security Considerations
- **No JavaScript**: Templates should not contain executable JavaScript
- **Validate input**: Use the validation endpoint to check for issues
- **Sanitize content**: Be careful with user-generated content in templates

## Migration Guide

### From Handlebars to Industry Standard
If you have existing Handlebars templates, you can gradually migrate:

**Old Handlebars syntax:**
```html
<p>Hello {{user.name}}, your ticket {{ticket.id}} is ready.</p>
```

**New Industry Standard syntax:**
```html
<p>Hello %USERNAME%, your ticket %TICKETID% is ready.</p>
```

The system supports both syntaxes simultaneously, so you can migrate incrementally.

### From File-based to Database Templates
1. **Export existing templates** to database using the import endpoint
2. **Customize** templates through the admin interface
3. **Test thoroughly** with preview functionality
4. **Deploy gradually** one template type at a time

## Troubleshooting

### Common Issues

**Template not rendering:**
- Check placeholder spelling (case-sensitive)
- Verify data is available for the placeholder
- Use validation endpoint to check for errors

**Placeholders not replaced:**
- Ensure placeholder format is correct: `%PLACEHOLDER%`
- Check that data mapping exists for the placeholder
- Verify template is properly saved and compiled

**Email formatting issues:**
- Test in multiple email clients
- Use inline CSS for better compatibility
- Avoid complex layouts that might break

**Performance issues:**
- Keep template size reasonable (< 100KB)
- Optimize images and use CDN when possible
- Minimize complex logic in templates

### Support
For additional help with email templates:
- Check the API documentation for detailed endpoint specs
- Use the validation endpoint to catch issues early
- Contact your system administrator for organization-specific configurations

## Conclusion

The Enhanced Email Template System provides administrators with powerful tools to create professional, personalized email communications. With industry standard placeholders, database management, and comprehensive validation, you can ensure consistent, error-free email experiences for your users.

Remember to always test templates thoroughly and follow security best practices when creating custom email content.