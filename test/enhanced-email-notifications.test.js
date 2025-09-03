/**
 * Tests for Enhanced Email/Notification System
 * Tests ServiceNow/Zendesk-style email functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import enhancedEmailTrackingService from '../apps/api/services/enhanced-email-tracking.service.js';
import EnhancedNotificationIntegration from '../apps/api/services/enhanced-notification-integration.service.js';

describe('Enhanced Email/Notification System', () => {
  
  describe('Email Tracking Service', () => {
    it('should generate tracking headers with Message-ID and conversation threading', () => {
      const ticketId = '12345';
      const originalMessageId = '<original-message@nova.local>';
      
      const tracking = enhancedEmailTrackingService.generateTrackingHeaders(ticketId, originalMessageId);
      
      expect(tracking).toHaveProperty('messageId');
      expect(tracking).toHaveProperty('conversationId');
      expect(tracking).toHaveProperty('headers');
      
      expect(tracking.headers['Message-ID']).toMatch(/^<nova-12345-\d+-[a-f0-9-]+@nova\.local>$/);
      expect(tracking.headers['X-Nova-Ticket-ID']).toBe(ticketId);
      expect(tracking.headers['X-Nova-Conversation-ID']).toBe('nova-conversation-12345');
      expect(tracking.headers['In-Reply-To']).toBe(originalMessageId);
      expect(tracking.headers['References']).toBe(originalMessageId);
    });

    it('should generate secure action tokens for email workflows', () => {
      const action = 'approve';
      const context = { ticketId: '12345', workflowId: 'wf-001' };
      
      const token = enhancedEmailTrackingService.generateActionToken(action, context);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate proper action URLs for workflow emails', () => {
      const ticketId = '12345';
      const workflowId = 'wf-001';
      const instanceId = 'inst-001';
      
      const actionUrls = enhancedEmailTrackingService.generateActionUrls(ticketId, workflowId, instanceId);
      
      expect(actionUrls).toHaveProperty('approve');
      expect(actionUrls).toHaveProperty('deny');
      expect(actionUrls).toHaveProperty('view');
      expect(actionUrls).toHaveProperty('comment');
      
      expect(actionUrls.approve.url).toMatch(/\/api\/v[12]\/email-actions\/approve\?token=.+/);
      expect(actionUrls.deny.url).toMatch(/\/api\/v[12]\/email-actions\/deny\?token=.+/);
      expect(actionUrls.view.url).toMatch(/\/tickets\/12345$/);
      expect(actionUrls.comment.url).toMatch(/\/tickets\/12345#comment$/);
    });

    it('should validate action tokens correctly', async () => {
      const action = 'approve';
      const context = { ticketId: '12345' };
      
      const token = enhancedEmailTrackingService.generateActionToken(action, context);
      
      // Valid token should process successfully
      const result = await enhancedEmailTrackingService.processActionToken(token);
      expect(result).toHaveProperty('action', action);
      expect(result).toHaveProperty('context', context);
      expect(result).toHaveProperty('used', true);
      
      // Used token should throw error
      await expect(
        enhancedEmailTrackingService.processActionToken(token)
      ).rejects.toThrow('Action token has already been used');
    });

    it('should reject invalid or expired tokens', async () => {
      const invalidToken = 'invalid-token-123';
      
      await expect(
        enhancedEmailTrackingService.processActionToken(invalidToken)
      ).rejects.toThrow('Invalid or expired action token');
    });

    it('should generate tracking pixel URLs', () => {
      const messageId = '<test-message@nova.local>';
      
      const pixelUrl = enhancedEmailTrackingService.generateTrackingPixel(messageId);
      
      expect(pixelUrl).toMatch(/\/api\/v[12]\/email-tracking\/pixel\/[a-f0-9]+\.png$/);
    });
  });

  describe('Email Reply Processing', () => {
    it('should extract ticket ID from email headers', async () => {
      const emailData = {
        messageId: '<reply-123@customer.com>',
        inReplyTo: '<nova-12345-1234567890-uuid@nova.local>',
        from: 'customer@example.com',
        subject: 'RE: Your support request',
        bodyText: 'Thank you for your help!',
        headers: {
          'X-Nova-Ticket-ID': '12345'
        }
      };

      // Mock the database and ticket service calls
      const originalRecordEmail = enhancedEmailTrackingService.recordEmailCommunication;
      const originalAddComment = jest.fn();
      
      enhancedEmailTrackingService.recordEmailCommunication = jest.fn().mockResolvedValue({ success: true });
      
      // Mock dynamic import
      const mockTicketService = {
        TicketService: {
          addComment: originalAddComment.mockResolvedValue({ success: true })
        }
      };

      const originalImport = global.__originalImport || (await import('module')).createRequire(import.meta.url);
      
      jest.doMock('../apps/api/services/enhanced-ticket.service.js', () => mockTicketService);

      try {
        const result = await enhancedEmailTrackingService.processEmailReply(emailData);
        
        expect(result.success).toBe(true);
        expect(result.ticketId).toBe('12345');
        expect(result.action).toBe('comment_added');
      } finally {
        // Restore mocks
        enhancedEmailTrackingService.recordEmailCommunication = originalRecordEmail;
        jest.dontMock('../apps/api/services/enhanced-ticket.service.js');
      }
    });

    it('should extract ticket ID from In-Reply-To header when X-Nova-Ticket-ID is missing', async () => {
      const emailData = {
        messageId: '<reply-456@customer.com>',
        inReplyTo: '<nova-67890-1234567890-uuid@nova.local>',
        from: 'customer@example.com',
        subject: 'RE: Your support request',
        bodyText: 'I have a follow-up question.',
        headers: {}
      };

      enhancedEmailTrackingService.recordEmailCommunication = jest.fn().mockResolvedValue({ success: true });
      
      const mockTicketService = {
        TicketService: {
          addComment: jest.fn().mockResolvedValue({ success: true })
        }
      };

      jest.doMock('../apps/api/services/enhanced-ticket.service.js', () => mockTicketService);

      try {
        const result = await enhancedEmailTrackingService.processEmailReply(emailData);
        
        expect(result.success).toBe(true);
        expect(result.ticketId).toBe('67890');
      } finally {
        jest.dontMock('../apps/api/services/enhanced-ticket.service.js');
      }
    });
  });

  describe('Enhanced Notification Integration', () => {
    it('should send workflow approval notifications with action buttons', async () => {
      const workflowData = {
        ticketId: '12345',
        workflowId: 'wf-001',
        instanceId: 'inst-001',
        title: 'Access Request Approval',
        description: 'User needs access to production systems',
        priority: 'high',
        approvers: [
          { id: 'user1', email: 'manager@nova.local', name: 'Manager' }
        ],
        requester: { name: 'John Doe', email: 'john.doe@company.com' }
      };

      // Mock the sendRichEmail method
      const originalSendRichEmail = enhancedEmailTrackingService.sendRichEmail;
      enhancedEmailTrackingService.sendRichEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: '<test-message@nova.local>',
        actions: {}
      });

      try {
        const result = await EnhancedNotificationIntegration.sendWorkflowApprovalNotification(workflowData);
        
        expect(result.success).toBe(true);
        expect(result.notificationsSent).toBe(1);
        expect(result.messageType).toBe('workflow_approval');
        
        expect(enhancedEmailTrackingService.sendRichEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'manager@nova.local',
            templateName: 'workflow-approval',
            actions: ['approve', 'deny', 'view', 'comment'],
            priority: 'high'
          })
        );
      } finally {
        enhancedEmailTrackingService.sendRichEmail = originalSendRichEmail;
      }
    });

    it('should map ticket priorities to email priorities correctly', () => {
      expect(EnhancedNotificationIntegration.mapTicketPriorityToEmailPriority('critical')).toBe('high');
      expect(EnhancedNotificationIntegration.mapTicketPriorityToEmailPriority('high')).toBe('high');
      expect(EnhancedNotificationIntegration.mapTicketPriorityToEmailPriority('medium')).toBe('normal');
      expect(EnhancedNotificationIntegration.mapTicketPriorityToEmailPriority('low')).toBe('low');
      expect(EnhancedNotificationIntegration.mapTicketPriorityToEmailPriority(undefined)).toBe('normal');
    });
  });

  describe('Template System Integration', () => {
    it('should have the required email templates', () => {
      const fs = require('fs');
      const path = require('path');
      
      const templatesDir = path.join(process.cwd(), 'apps/api/templates/email');
      
      expect(fs.existsSync(path.join(templatesDir, 'workflow-approval.hbs'))).toBe(true);
      expect(fs.existsSync(path.join(templatesDir, 'workflow-approval-subject.hbs'))).toBe(true);
      expect(fs.existsSync(path.join(templatesDir, 'ticket-updated-enhanced.hbs'))).toBe(true);
      expect(fs.existsSync(path.join(templatesDir, 'ticket-updated-enhanced-subject.hbs'))).toBe(true);
    });
  });
});