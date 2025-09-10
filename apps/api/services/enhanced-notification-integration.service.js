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
   * Helper: Get users by roles
   */
  static async getUsersByRoles(roles) {
    try {
      // Enhanced logging and validation for role-based user lookup
      logger.info('Fetching users by roles', {
        roles: Array.isArray(roles) ? roles : [roles],
        roleCount: Array.isArray(roles) ? roles.length : 1,
        timestamp: new Date().toISOString()
      });

      // Normalize roles to array
      const roleArray = Array.isArray(roles) ? roles : [roles];
      
      // Validate roles parameter
      if (!roleArray.length) {
        logger.warn('getUsersByRoles called with empty roles array');
        return [];
      }

      // Log the specific roles being queried
      logger.debug('Role-based user query parameters', {
        targetRoles: roleArray,
        queryType: 'user_lookup_by_roles',
        expectedResults: 'users_with_matching_roles'
      });

      // TODO: Implement actual user service integration when available
      // For now, return structured data that would come from the user service
      const mockUsers = roleArray.flatMap(role => [
        {
          id: `user-${role}-1`,
          email: `${role.toLowerCase()}1@company.com`,
          role: role,
          active: true,
          notificationPreferences: {
            email: true,
            sms: false,
            push: true
          }
        }
      ]);

      logger.info(`Found ${mockUsers.length} users for roles: ${roleArray.join(', ')}`);
      return mockUsers;
      
    } catch (error) {
      logger.error('Error in getUsersByRoles:', error, { roles });
      throw new Error(`Failed to get users by roles: ${error.message}`);
    }
  }

  /**
   * Helper: Get ticket by ID
   */
  static async getTicketById(ticketId) {
    const ticketService = await import('./enhanced-ticket.service.js');
    return await ticketService.TicketService.getTicketById(ticketId);
  }
}

export default EnhancedNotificationIntegration;
