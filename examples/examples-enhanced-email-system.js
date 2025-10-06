/**
 * Example: How to use the Enhanced Email/Notification System
 * This shows practical usage of the ServiceNow/Zendesk-style features
 */

// Example 1: Sending a workflow approval email
async function sendWorkflowApprovalEmail() {
  const EnhancedNotificationIntegration = await import('./apps/api/services/enhanced-notification-integration.service.js');
  
  const workflowData = {
    ticketId: 'NOVA-12345',
    workflowId: 'access-request-workflow',
    instanceId: 'inst-67890',
    title: 'Database Access Request',
    description: 'John Doe is requesting read access to the production customer database for analytics work.',
    priority: 'high',
    approvers: [
      { 
        id: 'manager-001', 
        email: 'sarah.manager@company.com', 
        name: 'Sarah Johnson', 
        role: 'Department Manager' 
      },
      { 
        id: 'dba-001', 
        email: 'mike.dba@company.com', 
        name: 'Mike Thompson', 
        role: 'Database Administrator' 
      }
    ],
    requester: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Analytics Team'
    },
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    requestDetails: `
      <p><strong>Access Details:</strong></p>
      <ul>
        <li>Database: prod-customer-db</li>
        <li>Access Type: Read-only</li>
        <li>Duration: 30 days</li>
        <li>Purpose: Q4 customer behavior analysis</li>
        <li>Business Justification: Annual strategy planning requires customer segmentation data</li>
      </ul>
      <p><strong>Security Considerations:</strong> User has completed data privacy training and signed NDA.</p>
    `
  };

  // This will send rich HTML emails with approve/deny buttons to both managers
  const result = await EnhancedNotificationIntegration.sendWorkflowApprovalNotification(workflowData);
  
  console.log('Workflow approval emails sent:', result);
  /*
  Result email will include:
  - Professional HTML design with company branding
  - Prominent APPROVE and DENY buttons that work from email
  - Full request details and context
  - Alternative action links (View Full Details, Add Comment)
  - Mobile-responsive design
  - Tracking pixels for delivery confirmation
  */
}

// Example 2: Sending enhanced ticket notifications
async function sendTicketNotification() {
  const EnhancedNotificationIntegration = await import('./apps/api/services/enhanced-notification-integration.service.js');
  
  const ticketData = {
    ticket: {
      id: 'NOVA-12345',
      title: 'Laptop not connecting to Wi-Fi',
      status: 'in_progress',
      priority: 'medium',
      category: 'Hardware Support',
      assignedToUserId: 'tech-001',
      userId: 'user-123',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      assignedTo: { name: 'Alex Technical', email: 'alex.tech@company.com' }
    },
    recipients: [
      { 
        id: 'user-123', 
        email: 'jane.user@company.com', 
        name: 'Jane User',
        roles: ['end_user']
      },
      { 
        id: 'tech-001', 
        email: 'alex.tech@company.com', 
        name: 'Alex Technical',
        roles: ['technician']
      }
    ],
    notificationType: 'updated',
    statusChanged: true,
    previousStatus: 'open',
    latestUpdate: {
      author: { name: 'Alex Technical', email: 'alex.tech@company.com' },
      content: `
        <p>Hi Jane,</p>
        <p>I've started working on your Wi-Fi connectivity issue. I can see from our network logs that your laptop is having trouble with the WPA2 authentication.</p>
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>Please try forgetting and reconnecting to the Wi-Fi network</li>
          <li>If that doesn't work, I'll schedule a time to look at your laptop directly</li>
        </ol>
        <p>I'll keep you updated on progress.</p>
        <p>Best regards,<br>Alex</p>
      `,
      createdAt: new Date(),
      type: 'agent_response'
    },
    slaInfo: {
      responseBy: new Date(Date.now() + 6 * 60 * 60 * 1000),
      timeRemaining: '6 hours',
      breached: false
    },
    conversationThread: [
      {
        author: { name: 'Jane User' },
        content: 'My laptop suddenly stopped connecting to the office Wi-Fi this morning. It was working fine yesterday.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'customer'
      },
      {
        author: { name: 'Alex Technical' },
        content: 'Thanks for reporting this. I can see your laptop in our network logs. Let me investigate the authentication logs.',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        type: 'agent'
      }
    ]
  };

  const result = await EnhancedNotificationIntegration.sendEnhancedTicketNotification(ticketData);
  
  console.log('Enhanced ticket notifications sent:', result);
  /*
  Result emails will include:
  - Proper email threading with Message-ID and In-Reply-To headers
  - Conversation history showing recent activity
  - Status change indicators
  - SLA information and deadlines
  - Action buttons for viewing ticket or adding responses
  - Note that replies to the email will automatically add comments to the ticket
  */
}

// Example 3: Processing an email reply from a customer
async function processCustomerEmailReply() {
  const enhancedEmailTrackingService = await import('./apps/api/services/enhanced-email-tracking.service.js');
  
  // This represents an email reply received from a customer
  const incomingEmailData = {
    messageId: '<CAK8H=reply123@gmail.com>',
    inReplyTo: '<nova-12345-1756903791969-abc123@nova.local>', // Original ticket email
    from: 'jane.user@company.com',
    subject: 'RE: [NOVA-12345] Laptop not connecting to Wi-Fi',
    bodyText: `
Hi Alex,

Thank you for the quick response! I tried forgetting and reconnecting to the Wi-Fi network as you suggested. 

Unfortunately, it's still not working. I'm getting the same error message: "Unable to join network - invalid password" even though I'm using the correct password.

Other devices (my phone, tablet) can connect fine using the same credentials, so it seems to be specific to my laptop.

Would it be possible to schedule that direct look at my laptop? I'm available this afternoon after 2 PM.

Thanks again for your help!

Best regards,
Jane
    `,
    bodyHtml: null,
    headers: {
      'X-Nova-Ticket-ID': '12345',
      'delivered-to': 'support@company.com'
    }
  };

  const result = await enhancedEmailTrackingService.default.processEmailReply(incomingEmailData);
  
  console.log('Email reply processed:', result);
  /*
  This will:
  - Extract ticket ID from headers or In-Reply-To
  - Add the reply as a comment to ticket NOVA-12345
  - Notify the assigned technician about the new customer response
  - Maintain the email conversation thread
  - Track the email in the audit system
  */
}

// Example 4: Handling an email action (approve/deny from email)
async function handleEmailAction() {
  // This simulates what happens when someone clicks "Approve" in an email
  
  // 1. Generate a sample action URL (this would normally be in the email)
  const enhancedEmailTrackingService = await import('./apps/api/services/enhanced-email-tracking.service.js');
  
  const actionUrls = enhancedEmailTrackingService.default.generateActionUrls('12345', 'access-workflow', 'inst-001');
  console.log('Sample approve URL:', actionUrls.approve.url);
  
  // 2. When user clicks the URL, the system processes the token
  try {
    const actionData = await enhancedEmailTrackingService.default.processActionToken(
      actionUrls.approve.token,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '192.168.1.100'
    );
    
    console.log('Email action processed:', actionData);
    /*
    This will:
    - Validate the one-time token
    - Execute the approval in the workflow system
    - Update the ticket status
    - Send notifications to relevant parties
    - Log the action for audit purposes
    - Show a user-friendly confirmation page
    */
  } catch (error) {
    console.log('Action failed (expected for demo):', error.message);
  }
}

// Example 5: SLA breach notification
async function sendSLABreachNotification() {
  const EnhancedNotificationIntegration = await import('./apps/api/services/enhanced-notification-integration.service.js');
  
  const slaData = {
    ticket: {
      id: 'NOVA-98765',
      title: 'Critical server outage - Production database down',
      status: 'open',
      priority: 'critical',
      assignedToUserId: 'senior-tech-001',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    slaInfo: {
      responseBy: new Date(Date.now() - 30 * 60 * 1000), // Was due 30 minutes ago
      overdueBy: '30 minutes',
      breached: true
    },
    escalationLevel: 2,
    notifyRoles: ['senior_technician', 'manager', 'on_call_engineer']
  };

  const result = await EnhancedNotificationIntegration.sendSLABreachNotification(slaData);
  
  console.log('SLA breach notifications sent:', result);
  /*
  This will send high-priority emails to:
  - All senior technicians
  - Management team
  - On-call engineers
  
  Features:
  - Red/urgent styling to indicate severity
  - Clear SLA breach information
  - Escalation level indicator
  - Immediate action buttons
  - Mobile push notifications for critical alerts
  */
}

// Demo runner
async function runExamples() {
  console.log('🎯 Nova Enhanced Email System - Usage Examples\n');
  
  console.log('1. Workflow Approval Email Example:');
  console.log('-'.repeat(50));
  await sendWorkflowApprovalEmail();
  
  console.log('\n2. Enhanced Ticket Notification Example:');
  console.log('-'.repeat(50));
  await sendTicketNotification();
  
  console.log('\n3. Email Reply Processing Example:');
  console.log('-'.repeat(50));
  await processCustomerEmailReply();
  
  console.log('\n4. Email Action Handling Example:');
  console.log('-'.repeat(50));
  await handleEmailAction();
  
  console.log('\n5. SLA Breach Notification Example:');
  console.log('-'.repeat(50));
  await sendSLABreachNotification();
  
  console.log('\n✨ All examples completed!');
  console.log('\n🎯 Key Benefits Achieved:');
  console.log('   ✅ Rich, actionable emails like ServiceNow');
  console.log('   ✅ Proper email threading like Zendesk');
  console.log('   ✅ Email-based workflow actions');
  console.log('   ✅ Automated reply processing');
  console.log('   ✅ Comprehensive audit trails');
  console.log('   ✅ Mobile-responsive design');
  console.log('   ✅ Enterprise security features');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { 
  sendWorkflowApprovalEmail,
  sendTicketNotification, 
  processCustomerEmailReply,
  handleEmailAction,
  sendSLABreachNotification,
  runExamples
};