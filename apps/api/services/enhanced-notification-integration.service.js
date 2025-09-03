/**
 * Enhanced Notification Integration Service
 * Integrates enhanced email tracking with existing Nova notification systems
 */

import { logger } from '../logger.js';
import { NotificationService } from './notification.service.js';
import enhancedEmailTrackingService from './enhanced-email-tracking.service.js';
import _EmailTemplateService from './email-template.service.js';

export class EnhancedNotificationIntegration {
  
  /**
   * Send workflow approval notification with enhanced email actions
   */
  static async sendWorkflowApprovalNotification(workflowData) {
    try {
      const {
        ticketId,
        workflowId,
        instanceId,
        title,
        description,
        priority = 'normal',
        approvers = [],
        requester,
        dueDate,
        requestDetails
      } = workflowData;

      logger.info(`Sending workflow approval notification`, {
        ticketId,
        workflowId,
        approvers: approvers.length
      });

      // Send to each approver
      for (const approver of approvers) {
        await enhancedEmailTrackingService.sendRichEmail({
          to: approver.email,
          subject: null, // Will use template
          templateName: 'workflow-approval',
          templateData: {
            title,
            description,
            priority,
            ticketId,
            workflowId,
            instanceId,
            requester,
            dueDate,
            requestDetails,
            approver: approver,
            baseUrl: process.env.PUBLIC_URL || 'https://nova.local'
          },
          ticketId,
          workflowId,
          actions: ['approve', 'deny', 'view', 'comment'],
          priority,
          trackingEnabled: true
        });

        // Also send in-app notification through existing system
        await NotificationService.sendNotification('workflow_approval_required', {
          userId: approver.id,
          ticket: { id: ticketId, title },
          workflow: { id: workflowId, instanceId },
          message: `Approval required: ${title}`,
          actions: [{
            label: 'Review Request',
            url: `/workflows/${workflowId}/instances/${instanceId}`
          }]
        });
      }

      return {
        success: true,
        notificationsSent: approvers.length,
        messageType: 'workflow_approval'
      };

    } catch (error) {
      logger.error('Error sending workflow approval notification:', error);
      throw error;
    }
  }

  /**
   * Send enhanced ticket notification with conversation threading
   */
  static async sendEnhancedTicketNotification(ticketData, notificationType = 'updated') {
    try {
      const {
        ticket,
        recipients = [],
        latestUpdate,
        statusChanged = false,
        previousStatus,
        slaInfo,
        conversationThread = [],
        originalMessageId
      } = ticketData;

      logger.info(`Sending enhanced ticket notification`, {
        ticketId: ticket.id,
        type: notificationType,
        recipients: recipients.length
      });

      for (const recipient of recipients) {
        // Determine if user can respond
        const userCanRespond = recipient.roles?.includes('technician') || 
                              recipient.roles?.includes('admin') ||
                              recipient.id === ticket.userId;

        const userIsAssigned = recipient.id === ticket.assignedToUserId;

        await enhancedEmailTrackingService.sendRichEmail({
          to: recipient.email,
          subject: null, // Will use template
          templateName: 'ticket-updated-enhanced',
          templateData: {
            ticket,
            recipient,
            isNewTicket: notificationType === 'created',
            statusChanged,
            previousStatus,
            latestUpdate,
            slaInfo,
            conversationThread: conversationThread.slice(-3), // Last 3 items
            userCanRespond,
            userIsAssigned,
            baseUrl: process.env.PUBLIC_URL || 'https://nova.local'
          },
          ticketId: ticket.id,
          originalMessageId,
          actions: userCanRespond ? ['view', 'comment'] : ['view'],
          priority: this.mapTicketPriorityToEmailPriority(ticket.priority),
          trackingEnabled: true
        });

        // Send in-app notification through existing system
        await NotificationService.sendTicketUpdatedNotifications(
          ticket,
          { statusChanged, latestUpdate },
          'system'
        );
      }

      return {
        success: true,
        notificationsSent: recipients.length,
        messageType: 'ticket_' + notificationType
      };

    } catch (error) {
      logger.error('Error sending enhanced ticket notification:', error);
      throw error;
    }
  }

  /**
   * Send SLA breach notification with enhanced urgency
   */
  static async sendSLABreachNotification(slaData) {
    try {
      const {
        ticket,
        slaInfo,
        escalationLevel = 1,
        notifyRoles = ['technician', 'manager']
      } = slaData;

      logger.warn(`Sending SLA breach notification`, {
        ticketId: ticket.id,
        escalationLevel,
        overdueBy: slaInfo.overdueBy
      });

      // Get users to notify based on roles
      const recipients = await this.getUsersByRoles(notifyRoles);

      for (const recipient of recipients) {
        await enhancedEmailTrackingService.sendRichEmail({
          to: recipient.email,
          subject: `🚨 SLA BREACH - [NOVA-${ticket.id}] ${ticket.title}`,
          templateName: 'ticket-updated-enhanced',
          templateData: {
            ticket,
            recipient,
            isNewTicket: false,
            statusChanged: false,
            slaInfo: {
              ...slaInfo,
              breached: true,
              escalationLevel
            },
            urgentAlert: true,
            baseUrl: process.env.PUBLIC_URL || 'https://nova.local'
          },
          ticketId: ticket.id,
          actions: ['view', 'comment'],
          priority: 'high',
          trackingEnabled: true
        });

        // Send high-priority in-app notification
        await NotificationService.sendNotification('sla_breach', {
          userId: recipient.id,
          ticket,
          message: `SLA BREACH: Ticket #${ticket.id} is overdue by ${slaInfo.overdueBy}`,
          priority: 'critical'
        });
      }

      return {
        success: true,
        notificationsSent: recipients.length,
        messageType: 'sla_breach'
      };

    } catch (error) {
      logger.error('Error sending SLA breach notification:', error);
      throw error;
    }
  }

  /**
   * Process email reply and continue conversation thread
   */
  static async processEmailReply(emailData) {
    try {
      const result = await enhancedEmailTrackingService.processEmailReply(emailData);
      
      if (result.success) {
        // Send notification to assigned technician about new customer reply
        const ticket = await this.getTicketById(result.ticketId);
        if (ticket && ticket.assignedToUserId) {
          await NotificationService.sendNotification('customer_reply', {
            userId: ticket.assignedToUserId,
            ticket,
            message: `New customer reply on ticket #${ticket.id}`,
            actions: [{
              label: 'View Reply',
              url: `/tickets/${ticket.id}#latest`
            }]
          });
        }
      }

      return result;
    } catch (error) {
      logger.error('Error processing email reply:', error);
      throw error;
    }
  }

  /**
   * Get email thread for ticket (for API endpoints)
   */
  static async getTicketEmailThread(ticketId) {
    try {
      const thread = await enhancedEmailTrackingService.getEmailThread(ticketId);
      return {
        success: true,
        ticketId,
        threadCount: thread.length,
        thread
      };
    } catch (error) {
      logger.error('Error getting ticket email thread:', error);
      throw error;
    }
  }

  /**
   * Helper: Map ticket priority to email priority
   */
  static mapTicketPriorityToEmailPriority(ticketPriority) {
    const priorityMap = {
      'critical': 'high',
      'high': 'high',
      'medium': 'normal',
      'low': 'low'
    };
    return priorityMap[ticketPriority?.toLowerCase()] || 'normal';
  }

  /**
   * Helper: Get users by roles (mock implementation)
   */
  static async getUsersByRoles(roles) {
    // This would typically query your user management system
    // For now, return mock data - implement based on your user system
    try {
      // Mock implementation - replace with actual user lookup
      return [
        {
          id: 'user1',
          email: 'technician@nova.local',
          name: 'Technical Support',
          roles: ['technician']
        },
        {
          id: 'user2', 
          email: 'manager@nova.local',
          name: 'Support Manager',
          roles: ['manager', 'technician']
        }
      ].filter(user => user.roles.some(role => roles.includes(role)));
    } catch (error) {
      logger.error('Error getting users by roles:', error);
      return [];
    }
  }

  /**
   * Helper: Get ticket by ID (mock implementation)
   */
  static async getTicketById(ticketId) {
    try {
      // This would typically query your ticket system
      // Mock implementation - replace with actual ticket lookup
      const ticketService = await import('./enhanced-ticket.service.js');
      return await ticketService.TicketService.getTicketById(ticketId);
    } catch (error) {
      logger.error('Error getting ticket by ID:', error);
      return null;
    }
  }
}

export default EnhancedNotificationIntegration;