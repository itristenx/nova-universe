/**
 * Email Placeholder Transformation Utilities
 * Converts industry standard placeholders (%USERFIRST%) to Handlebars syntax ({{user.firstName}})
 * and provides mapping for dynamic user data substitution
 */

import { logger } from '../logger.js';

/**
 * Industry standard placeholder mappings to Handlebars syntax
 * Following conventions used by ServiceNow, Zendesk, Freshdesk, etc.
 */
export const PLACEHOLDER_MAPPINGS = {
  // User/Customer placeholders
  '%USERFIRST%': '{{user.firstName}}',
  '%USER_FIRST_NAME%': '{{user.firstName}}',
  '%USERLAST%': '{{user.lastName}}',
  '%USER_LAST_NAME%': '{{user.lastName}}',
  '%USERNAME%': '{{user.name}}',
  '%USER_NAME%': '{{user.name}}',
  '%USERFULL%': '{{user.name}}',
  '%USER_FULL_NAME%': '{{user.name}}',
  '%USEREMAIL%': '{{user.email}}',
  '%USER_EMAIL%': '{{user.email}}',
  '%USERPHONE%': '{{user.phone}}',
  '%USER_PHONE%': '{{user.phone}}',
  '%USERID%': '{{user.id}}',
  '%USER_ID%': '{{user.id}}',

  // Customer specific (for external customers)
  '%CUSTOMERFIRST%': '{{customer.firstName}}',
  '%CUSTOMER_FIRST_NAME%': '{{customer.firstName}}',
  '%CUSTOMERLAST%': '{{customer.lastName}}',
  '%CUSTOMER_LAST_NAME%': '{{customer.lastName}}',
  '%CUSTOMERNAME%': '{{customer.name}}',
  '%CUSTOMER_NAME%': '{{customer.name}}',
  '%CUSTOMEREMAIL%': '{{customer.email}}',
  '%CUSTOMER_EMAIL%': '{{customer.email}}',
  '%CUSTOMERPHONE%': '{{customer.phone}}',
  '%CUSTOMER_PHONE%': '{{customer.phone}}',

  // Ticket/Request placeholders
  '%TICKETID%': '{{ticket.id}}',
  '%TICKET_ID%': '{{ticket.id}}',
  '%TICKETNUMBER%': '{{ticket.ticketNumber}}',
  '%TICKET_NUMBER%': '{{ticket.ticketNumber}}',
  '%TICKETTITLE%': '{{ticket.title}}',
  '%TICKET_TITLE%': '{{ticket.title}}',
  '%TICKETSUBJECT%': '{{ticket.title}}',
  '%TICKET_SUBJECT%': '{{ticket.title}}',
  '%TICKETDESCRIPTION%': '{{ticket.description}}',
  '%TICKET_DESCRIPTION%': '{{ticket.description}}',
  '%TICKETSTATUS%': '{{ticket.status}}',
  '%TICKET_STATUS%': '{{ticket.status}}',
  '%TICKETPRIORITY%': '{{ticket.priority}}',
  '%TICKET_PRIORITY%': '{{ticket.priority}}',
  '%TICKETCATEGORY%': '{{ticket.category}}',
  '%TICKET_CATEGORY%': '{{ticket.category}}',
  '%TICKETURL%': '{{ticketUrl}}',
  '%TICKET_URL%': '{{ticketUrl}}',
  '%TICKETLINK%': '{{ticketUrl}}',
  '%TICKET_LINK%': '{{ticketUrl}}',

  // Agent/Assignee placeholders
  '%AGENTNAME%': '{{assignee.name}}',
  '%AGENT_NAME%': '{{assignee.name}}',
  '%AGENTFIRST%': '{{assignee.firstName}}',
  '%AGENT_FIRST_NAME%': '{{assignee.firstName}}',
  '%AGENTLAST%': '{{assignee.lastName}}',
  '%AGENT_LAST_NAME%': '{{assignee.lastName}}',
  '%AGENTEMAIL%': '{{assignee.email}}',
  '%AGENT_EMAIL%': '{{assignee.email}}',
  '%ASSIGNEENAME%': '{{assignee.name}}',
  '%ASSIGNEE_NAME%': '{{assignee.name}}',

  // Company/Organization placeholders
  '%COMPANYNAME%': '{{companyName}}',
  '%COMPANY_NAME%': '{{companyName}}',
  '%ORGANIZATIONNAME%': '{{companyName}}',
  '%ORGANIZATION_NAME%': '{{companyName}}',
  '%ORGNAME%': '{{companyName}}',
  '%ORG_NAME%': '{{companyName}}',

  // System placeholders
  '%SUPPORTEMAIL%': '{{supportEmail}}',
  '%SUPPORT_EMAIL%': '{{supportEmail}}',
  '%BASEURL%': '{{baseUrl}}',
  '%BASE_URL%': '{{baseUrl}}',
  '%PORTALURL%': '{{baseUrl}}/portal',
  '%PORTAL_URL%': '{{baseUrl}}/portal',
  '%SYSTEMNAME%': '{{companyName}}',
  '%SYSTEM_NAME%': '{{companyName}}',

  // Date/Time placeholders
  '%CURRENTDATE%': '{{formatDate now}}',
  '%CURRENT_DATE%': '{{formatDate now}}',
  '%CURRENTTIME%': '{{formatDateTime now}}',
  '%CURRENT_TIME%': '{{formatDateTime now}}',
  '%DATETIME%': '{{formatDateTime now}}',
  '%DATE_TIME%': '{{formatDateTime now}}',
  '%TICKETCREATED%': '{{formatDateTime ticket.createdAt}}',
  '%TICKET_CREATED%': '{{formatDateTime ticket.createdAt}}',
  '%TICKETUPDATED%': '{{formatDateTime ticket.updatedAt}}',
  '%TICKET_UPDATED%': '{{formatDateTime ticket.updatedAt}}',

  // Workflow/Approval placeholders
  '%REQUESTTITLE%': '{{title}}',
  '%REQUEST_TITLE%': '{{title}}',
  '%REQUESTDESCRIPTION%': '{{description}}',
  '%REQUEST_DESCRIPTION%': '{{description}}',
  '%REQUESTREASON%': '{{requestDetails}}',
  '%REQUEST_REASON%': '{{requestDetails}}',
  '%APPROVERNAME%': '{{approver.name}}',
  '%APPROVER_NAME%': '{{approver.name}}',
  '%REQUESTERNAME%': '{{requester.name}}',
  '%REQUESTER_NAME%': '{{requester.name}}',
  '%REQUESTEREMAIL%': '{{requester.email}}',
  '%REQUESTER_EMAIL%': '{{requester.email}}',

  // SLA placeholders
  '%RESPONSETIME%': '{{responseTime}}',
  '%RESPONSE_TIME%': '{{responseTime}}',
  '%DUEDATE%': '{{formatDateTime dueDate}}',
  '%DUE_DATE%': '{{formatDateTime dueDate}}',
  '%SLABREACHED%': '{{slaInfo.breached}}',
  '%SLA_BREACHED%': '{{slaInfo.breached}}',

  // Department/Location placeholders
  '%DEPARTMENT%': '{{department}}',
  '%LOCATION%': '{{location}}',
  '%OFFICE%': '{{office}}',

  // Priority styling helpers
  '%PRIORITYCOLOR%': '{{getPriorityColor ticket.priority}}',
  '%PRIORITY_COLOR%': '{{getPriorityColor ticket.priority}}',
  '%STATUSCOLOR%': '{{getStatusColor ticket.status}}',
  '%STATUS_COLOR%': '{{getStatusColor ticket.status}}',
};

/**
 * Transform industry standard placeholders to Handlebars syntax
 * @param {string} template - Template content with industry standard placeholders
 * @returns {string} Template with Handlebars syntax
 */
export function transformPlaceholders(template) {
  if (!template || typeof template !== 'string') {
    return template;
  }

  let transformedTemplate = template;

  // Replace all placeholder mappings
  for (const [placeholder, handlebars] of Object.entries(PLACEHOLDER_MAPPINGS)) {
    // Use global case-insensitive replacement
    const regex = new RegExp(escapeRegExp(placeholder), 'gi');
    transformedTemplate = transformedTemplate.replace(regex, handlebars);
  }

  return transformedTemplate;
}

/**
 * Transform Handlebars syntax back to industry standard placeholders
 * @param {string} template - Template content with Handlebars syntax
 * @returns {string} Template with industry standard placeholders
 */
export function reverseTransformPlaceholders(template) {
  if (!template || typeof template !== 'string') {
    return template;
  }

  let transformedTemplate = template;

  // Reverse the mapping
  for (const [placeholder, handlebars] of Object.entries(PLACEHOLDER_MAPPINGS)) {
    const regex = new RegExp(escapeRegExp(handlebars), 'gi');
    transformedTemplate = transformedTemplate.replace(regex, placeholder);
  }

  return transformedTemplate;
}

/**
 * Extract data for template processing with proper name parsing
 * @param {Object} data - Raw data object
 * @param {Date} currentTime - Optional timestamp to use for consistency
 * @returns {Object} Processed data with proper name parsing
 */
export function processTemplateData(data, currentTime = null) {
  const processedData = { ...data };

  // Use provided timestamp or create new one (but only once)
  const timestamp = currentTime || new Date();

  // Process user name parsing
  if (data.user && data.user.name) {
    const nameParts = data.user.name.trim().split(/\s+/);
    processedData.user = {
      ...data.user,
      firstName: nameParts[0] || '',
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  }

  // Process customer name parsing
  if (data.customer && data.customer.name) {
    const nameParts = data.customer.name.trim().split(/\s+/);
    processedData.customer = {
      ...data.customer,
      firstName: nameParts[0] || '',
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  }

  // Process assignee name parsing
  if (data.assignee && data.assignee.name) {
    const nameParts = data.assignee.name.trim().split(/\s+/);
    processedData.assignee = {
      ...data.assignee,
      firstName: nameParts[0] || '',
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  }

  // Process approver name parsing
  if (data.approver && data.approver.name) {
    const nameParts = data.approver.name.trim().split(/\s+/);
    processedData.approver = {
      ...data.approver,
      firstName: nameParts[0] || '',
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  }

  // Process requester name parsing
  if (data.requester && data.requester.name) {
    const nameParts = data.requester.name.trim().split(/\s+/);
    processedData.requester = {
      ...data.requester,
      firstName: nameParts[0] || '',
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
    };
  }

  // Add current timestamp for date placeholders (use consistent timestamp)
  processedData.now = timestamp;

  return processedData;
}

/**
 * Get available placeholders with descriptions
 * @returns {Array} Array of placeholder objects with descriptions
 */
export function getAvailablePlaceholders() {
  return [
    {
      category: 'User/Customer Information',
      placeholders: [
        { placeholder: '%USERFIRST%', description: 'User\'s first name', example: 'John' },
        { placeholder: '%USERLAST%', description: 'User\'s last name', example: 'Doe' },
        { placeholder: '%USERNAME%', description: 'User\'s full name', example: 'John Doe' },
        { placeholder: '%USEREMAIL%', description: 'User\'s email address', example: 'john.doe@company.com' },
        { placeholder: '%USERPHONE%', description: 'User\'s phone number', example: '+1-555-123-4567' },
        { placeholder: '%USERID%', description: 'User\'s unique ID', example: 'USR-12345' },
      ],
    },
    {
      category: 'Ticket Information',
      placeholders: [
        { placeholder: '%TICKETID%', description: 'Ticket ID/Number', example: 'NOVA-12345' },
        { placeholder: '%TICKETTITLE%', description: 'Ticket title/subject', example: 'Password Reset Request' },
        { placeholder: '%TICKETDESCRIPTION%', description: 'Ticket description', example: 'User cannot access account...' },
        { placeholder: '%TICKETSTATUS%', description: 'Current ticket status', example: 'Open' },
        { placeholder: '%TICKETPRIORITY%', description: 'Ticket priority level', example: 'High' },
        { placeholder: '%TICKETCATEGORY%', description: 'Ticket category', example: 'Access Management' },
        { placeholder: '%TICKETURL%', description: 'Direct link to ticket', example: 'https://nova.company.com/tickets/12345' },
      ],
    },
    {
      category: 'Agent/Assignee Information',
      placeholders: [
        { placeholder: '%AGENTNAME%', description: 'Assigned agent\'s name', example: 'Jane Smith' },
        { placeholder: '%AGENTFIRST%', description: 'Agent\'s first name', example: 'Jane' },
        { placeholder: '%AGENTLAST%', description: 'Agent\'s last name', example: 'Smith' },
        { placeholder: '%AGENTEMAIL%', description: 'Agent\'s email address', example: 'jane.smith@company.com' },
      ],
    },
    {
      category: 'Company/System Information',
      placeholders: [
        { placeholder: '%COMPANYNAME%', description: 'Company/Organization name', example: 'Acme Corporation' },
        { placeholder: '%SUPPORTEMAIL%', description: 'Support email address', example: 'support@company.com' },
        { placeholder: '%BASEURL%', description: 'System base URL', example: 'https://nova.company.com' },
        { placeholder: '%PORTALURL%', description: 'Customer portal URL', example: 'https://nova.company.com/portal' },
      ],
    },
    {
      category: 'Date/Time Information',
      placeholders: [
        { placeholder: '%CURRENTDATE%', description: 'Current date', example: 'January 15, 2024' },
        { placeholder: '%CURRENTTIME%', description: 'Current date and time', example: 'January 15, 2024 2:30 PM' },
        { placeholder: '%TICKETCREATED%', description: 'Ticket creation date/time', example: 'January 14, 2024 9:15 AM' },
        { placeholder: '%TICKETUPDATED%', description: 'Ticket last update date/time', example: 'January 15, 2024 1:45 PM' },
        { placeholder: '%DUEDATE%', description: 'Ticket due date/time', example: 'January 16, 2024 5:00 PM' },
      ],
    },
    {
      category: 'Workflow/Approval Information',
      placeholders: [
        { placeholder: '%REQUESTTITLE%', description: 'Approval request title', example: 'Database Access Request' },
        { placeholder: '%REQUESTDESCRIPTION%', description: 'Approval request description', example: 'User needs read access to customer database' },
        { placeholder: '%APPROVERNAME%', description: 'Approver\'s name', example: 'Manager Name' },
        { placeholder: '%REQUESTERNAME%', description: 'Requester\'s name', example: 'Employee Name' },
        { placeholder: '%RESPONSETIME%', description: 'Expected response time', example: '4 hours' },
      ],
    },
    {
      category: 'Advanced Placeholders',
      placeholders: [
        { placeholder: '%DEPARTMENT%', description: 'User\'s department', example: 'IT Department' },
        { placeholder: '%LOCATION%', description: 'User\'s location', example: 'New York Office' },
        { placeholder: '%PRIORITYCOLOR%', description: 'Priority color code', example: '#ff0000' },
        { placeholder: '%STATUSCOLOR%', description: 'Status color code', example: '#00ff00' },
      ],
    },
  ];
}

/**
 * Validate template content for common issues
 * @param {string} template - Template content to validate
 * @returns {Object} Validation result with warnings and errors
 */
export function validateTemplate(template) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  if (!template || typeof template !== 'string') {
    result.isValid = false;
    result.errors.push('Template content is required');
    return result;
  }

  // Check for unmatched placeholders
  const unmatchedPlaceholders = template.match(/%[A-Z_]+%/g) || [];
  const validPlaceholders = Object.keys(PLACEHOLDER_MAPPINGS);
  
  unmatchedPlaceholders.forEach(placeholder => {
    if (!validPlaceholders.includes(placeholder)) {
      result.warnings.push(`Unknown placeholder: ${placeholder}`);
      result.suggestions.push(`Did you mean one of: ${validPlaceholders.filter(p => 
        p.toLowerCase().includes(placeholder.replace(/%/g, '').toLowerCase())
      ).slice(0, 3).join(', ')}`);
    }
  });

  // Check for basic HTML structure (if it looks like HTML)
  if (template.includes('<html') || template.includes('<!DOCTYPE')) {
    if (!template.includes('<body')) {
      result.warnings.push('HTML template missing <body> tag');
    }
    if (!template.includes('</html>')) {
      result.warnings.push('HTML template missing closing </html> tag');
    }
  }

  // Check for potential XSS issues
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(template)) {
      result.warnings.push('Template contains potentially unsafe JavaScript code');
    }
  });

  return result;
}

/**
 * Escape special regex characters using standard implementation
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
  // Standard ECMAScript implementation
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Register additional Handlebars helpers for email templates
 * @param {Object} Handlebars - Handlebars instance
 */
export function registerPlaceholderHelpers(Handlebars) {
  // Priority color helper
  Handlebars.registerHelper('getPriorityColor', (priority) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#16a34a',
    };
    return colors[priority?.toLowerCase()] || '#6b7280';
  });

  // Status color helper
  Handlebars.registerHelper('getStatusColor', (status) => {
    const colors = {
      open: '#3b82f6',
      'in-progress': '#f59e0b',
      resolved: '#10b981',
      closed: '#6b7280',
    };
    return colors[status?.toLowerCase()] || '#6b7280';
  });

  // Format name helper
  Handlebars.registerHelper('formatName', (name, format) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    
    switch (format) {
      case 'first':
        return parts[0] || '';
      case 'last':
        return parts.length > 1 ? parts[parts.length - 1] : '';
      case 'initials':
        return parts.map(part => part.charAt(0).toUpperCase()).join('');
      default:
        return name;
    }
  });

  // Ticket URL helper
  Handlebars.registerHelper('buildTicketUrl', (baseUrl, ticketId) => {
    if (!baseUrl || !ticketId) return '#';
    return `${baseUrl.replace(/\/$/, '')}/tickets/${ticketId}`;
  });

  logger.info('Registered email placeholder helpers');
}

export default {
  PLACEHOLDER_MAPPINGS,
  transformPlaceholders,
  reverseTransformPlaceholders,
  processTemplateData,
  getAvailablePlaceholders,
  validateTemplate,
  registerPlaceholderHelpers,
};