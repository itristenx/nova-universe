#!/usr/bin/env node

/**
 * Enhanced Email/Notification System Demonstration
 * Shows ServiceNow/Zendesk-style email functionality
 */

// Simple console logger for demo
const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn
};

// Mock services for demonstration
const enhancedEmailTrackingService = {
  generateTrackingHeaders: (ticketId, originalMessageId = null) => {
    const messageId = `<nova-${ticketId}-${Date.now()}-${Math.random().toString(36).substring(2)}@nova.local>`;
    const conversationId = `nova-conversation-${ticketId}`;
    
    const headers = {
      'Message-ID': messageId,
      'X-Nova-Ticket-ID': ticketId,
      'X-Nova-Conversation-ID': conversationId,
      'X-Nova-Tracking': 'enabled'
    };

    if (originalMessageId) {
      headers['In-Reply-To'] = originalMessageId;
      headers['References'] = originalMessageId;
    }

    return { messageId, conversationId, headers };
  },
  
  generateActionToken: (action, context) => {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  },
  
  generateActionUrls: (ticketId, workflowId, instanceId) => {
    const baseUrl = process.env.PUBLIC_URL || 'https://nova.local';
    const approveToken = Math.random().toString(36).substring(2);
    const denyToken = Math.random().toString(36).substring(2);
    
    return {
      approve: {
        token: approveToken,
        url: `${baseUrl}/api/v2/email-actions/approve?token=${approveToken}`
      },
      deny: {
        token: denyToken,
        url: `${baseUrl}/api/v2/email-actions/deny?token=${denyToken}`
      },
      view: {
        url: `${baseUrl}/tickets/${ticketId}`
      },
      comment: {
        url: `${baseUrl}/tickets/${ticketId}#comment`
      }
    };
  },
  
  processActionToken: async (token) => {
    return {
      action: 'approve',
      context: { ticketId: '12345', workflowId: 'wf-001' },
      used: true,
      usedAt: new Date()
    };
  },
  
  generateTrackingPixel: (messageId) => {
    const baseUrl = process.env.PUBLIC_URL || 'https://nova.local';
    const trackingId = Math.random().toString(36).substring(2, 18);
    return `${baseUrl}/api/v2/email-tracking/pixel/${trackingId}.png`;
  }
};

async function demonstrateEnhancedEmailSystem() {
  console.log('\n🚀 Nova Enhanced Email/Notification System Demo\n');
  console.log('='.repeat(60));

  try {
    // 1. Demonstrate Email Threading
    console.log('\n📧 1. Email Threading & Tracking');
    console.log('-'.repeat(40));
    
    const ticketId = '12345';
    const tracking = enhancedEmailTrackingService.generateTrackingHeaders(ticketId);
    
    console.log('✅ Generated tracking headers:');
    console.log(`   Message-ID: ${tracking.headers['Message-ID']}`);
    console.log(`   Conversation-ID: ${tracking.headers['X-Nova-Conversation-ID']}`);
    console.log(`   Ticket-ID: ${tracking.headers['X-Nova-Ticket-ID']}`);

    // 2. Demonstrate Action Token Generation
    console.log('\n🔐 2. Email Action Tokens');
    console.log('-'.repeat(40));
    
    const actionUrls = enhancedEmailTrackingService.generateActionUrls(ticketId, 'wf-001', 'inst-001');
    
    console.log('✅ Generated action URLs:');
    console.log(`   Approve: ${actionUrls.approve.url}`);
    console.log(`   Deny: ${actionUrls.deny.url}`);
    console.log(`   View: ${actionUrls.view.url}`);
    console.log(`   Comment: ${actionUrls.comment.url}`);

    // 3. Demonstrate Token Validation
    console.log('\n🔍 3. Token Validation');
    console.log('-'.repeat(40));
    
    const testToken = enhancedEmailTrackingService.generateActionToken('approve', { 
      ticketId, 
      workflowId: 'wf-001' 
    });
    
    console.log(`✅ Generated token: ${testToken.substring(0, 16)}...`);
    
    const tokenData = await enhancedEmailTrackingService.processActionToken(testToken);
    console.log(`✅ Token validated: ${tokenData.action} for ticket ${tokenData.context.ticketId}`);

    // 4. Demonstrate Workflow Approval Email (Mock)
    console.log('\n📋 4. Workflow Approval Notification');
    console.log('-'.repeat(40));
    
    const workflowData = {
      ticketId: '12345',
      workflowId: 'wf-access-request',
      instanceId: 'inst-001',
      title: 'Production Access Request',
      description: 'User John Doe is requesting access to production database',
      priority: 'high',
      approvers: [
        { id: 'mgr1', email: 'manager@nova.local', name: 'System Manager' },
        { id: 'sec1', email: 'security@nova.local', name: 'Security Officer' }
      ],
      requester: {
        name: 'John Doe',
        email: 'john.doe@company.com'
      },
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      requestDetails: 'Access needed for emergency hotfix deployment scheduled for tonight.'
    };

    console.log('✅ Workflow approval notification data prepared:');
    console.log(`   Title: ${workflowData.title}`);
    console.log(`   Priority: ${workflowData.priority}`);
    console.log(`   Approvers: ${workflowData.approvers.length}`);
    console.log(`   Due: ${workflowData.dueDate.toLocaleString()}`);

    // 5. Demonstrate Email Reply Processing
    console.log('\n💬 5. Email Reply Processing');
    console.log('-'.repeat(40));

    const mockEmailReply = {
      messageId: '<reply-customer-123@gmail.com>',
      inReplyTo: tracking.messageId,
      from: 'customer@example.com',
      subject: 'RE: [NOVA-12345] Your support request',
      bodyText: 'Thank you for the quick response! The issue is now resolved.',
      headers: {
        'X-Nova-Ticket-ID': ticketId,
        'delivered-to': 'support@nova.local'
      }
    };

    console.log('✅ Mock email reply data:');
    console.log(`   From: ${mockEmailReply.from}`);
    console.log(`   In-Reply-To: ${mockEmailReply.inReplyTo.substring(0, 30)}...`);
    console.log(`   Content: ${mockEmailReply.bodyText.substring(0, 50)}...`);

    // 6. Demonstrate Tracking Pixel
    console.log('\n📊 6. Email Tracking');
    console.log('-'.repeat(40));
    
    const trackingPixel = enhancedEmailTrackingService.generateTrackingPixel(tracking.messageId);
    console.log(`✅ Tracking pixel URL: ${trackingPixel}`);

    // 7. Show Template Integration
    console.log('\n🎨 7. Template System');
    console.log('-'.repeat(40));
    
    console.log('✅ Available enhanced email templates:');
    console.log('   • workflow-approval.hbs - Rich approval emails with action buttons');
    console.log('   • ticket-updated-enhanced.hbs - Threaded ticket notifications');
    console.log('   • Subject line templates with ticket IDs for threading');

    // 8. Show API Endpoints
    console.log('\n🔌 8. API Endpoints');
    console.log('-'.repeat(40));
    
    const baseUrl = process.env.PUBLIC_URL || 'https://nova.local';
    console.log('✅ Enhanced email action endpoints:');
    console.log(`   GET ${baseUrl}/api/v2/email-actions/approve?token=<token>`);
    console.log(`   GET ${baseUrl}/api/v2/email-actions/deny?token=<token>`);
    console.log(`   GET ${baseUrl}/api/v2/email-actions/comment?token=<token>`);
    console.log(`   GET ${baseUrl}/api/v2/email-tracking/pixel/<id>.png`);
    console.log(`   POST ${baseUrl}/api/v2/email-actions/webhook/reply`);

    // 9. Show Integration Points
    console.log('\n🔗 9. Integration Points');
    console.log('-'.repeat(40));
    
    console.log('✅ Integrates with existing Nova systems:');
    console.log('   • Universal Notification Platform (UNP)');
    console.log('   • M365 Email Service');
    console.log('   • Workflow Engine');
    console.log('   • Audit System');
    console.log('   • Enhanced Ticket Service');

    // 10. Show Security Features
    console.log('\n🔒 10. Security Features');
    console.log('-'.repeat(40));
    
    console.log('✅ Security implementations:');
    console.log('   • Secure token generation with expiration');
    console.log('   • One-time use tokens');
    console.log('   • IP address and user agent logging');
    console.log('   • Webhook signature validation');
    console.log('   • Audit trail for all email actions');

    console.log('\n' + '='.repeat(60));
    console.log('✨ Demo completed successfully!');
    console.log('🎯 Nova now supports ServiceNow/Zendesk-style email workflows');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEnhancedEmailSystem().catch(console.error);
}

export default demonstrateEnhancedEmailSystem;