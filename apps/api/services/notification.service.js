import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';

/**
 * Notification Service - Handles sending notifications for ticket events
 */
export class NotificationService {
  /**
   * Send notifications when a ticket is created
   */
  static async sendTicketCreatedNotifications(ticket) {
    try {
      logger.info(`Sending ticket created notifications for ticket ${ticket.id}`);

      // Send to assignee if assigned
      if (ticket.assignedToUserId) {
        await this.sendNotification('ticket_assigned', {
          userId: ticket.assignedToUserId,
          ticket,
          message: `New ticket assigned to you: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }

      // Send to requester
      if (ticket.userId) {
        await this.sendNotification('ticket_created_confirmation', {
          userId: ticket.userId,
          ticket,
          message: `Your ticket has been created: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }

      // Send to watchers
      const watchers = await this.getTicketWatchers(ticket.id);
      for (const watcher of watchers) {
        await this.sendNotification('ticket_created', {
          userId: watcher.userId,
          ticket,
          message: `New ticket created: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }
    } catch (error) {
      logger.error('Error sending ticket created notifications:', error);
    }
  }

  /**
   * Send notifications when a ticket is updated
   */
  static async sendTicketUpdatedNotifications(ticket, changes, updatedBy) {
    try {
      logger.info(`Sending ticket updated notifications for ticket ${ticket.id}`);

      const changeText = changes.map((c) => `${c.field}: ${c.oldValue} → ${c.newValue}`).join(', ');

      // Send to interested parties
      const interestedUsers = await this.getInterestedUsers(ticket, updatedBy.id);

      for (const user of interestedUsers) {
        await this.sendNotification('ticket_updated', {
          userId: user.id,
          ticket,
          message: `Ticket updated: ${ticket.ticketNumber} - Changes: ${changeText}`,
        });
      }
    } catch (error) {
      logger.error('Error sending ticket updated notifications:', error);
    }
  }

  /**
   * Send notifications when a comment is added
   */
  static async sendCommentNotifications(ticket, comment) {
    try {
      if (comment.isInternal) {
        // Only notify internal users for internal comments
        return;
      }

      logger.info(`Sending comment notifications for ticket ${ticket.id}`);

      const interestedUsers = await this.getInterestedUsers(ticket, comment.userId);

      for (const user of interestedUsers) {
        await this.sendNotification('comment_added', {
          userId: user.id,
          ticket,
          comment,
          message: `New comment on ticket ${ticket.ticketNumber}: ${comment.content.substring(0, 100)}...`,
        });
      }
    } catch (error) {
      logger.error('Error sending comment notifications:', error);
    }
  }

  /**
   * Send SLA breach notifications
   */
  static async sendSLABreachNotification(ticket, breachType) {
    try {
      logger.info(`Sending SLA breach notification for ticket ${ticket.id}: ${breachType}`);

      // Notify assignee and manager
      const usersToNotify = [];

      if (ticket.assignedToUserId) {
        usersToNotify.push(ticket.assignedToUserId);
      }

      // Add manager/supervisor
      if (ticket.assignedGroup?.managerId) {
        usersToNotify.push(ticket.assignedGroup.managerId);
      }

      for (const userId of usersToNotify) {
        await this.sendNotification('sla_breach', {
          userId,
          ticket,
          message: `SLA breach: ${breachType} time exceeded for ticket ${ticket.ticketNumber}`,
        });
      }
    } catch (error) {
      logger.error('Error sending SLA breach notification:', error);
    }
  }

  /**
   * Send notifications when a ticket is assigned
   */
  static async sendTicketAssignedNotifications(ticket) {
    try {
      logger.info(`Sending ticket assigned notifications for ticket ${ticket.id}`);

      // Send to assignee
      if (ticket.assignedToUserId) {
        await this.sendNotification('ticket_assigned', {
          userId: ticket.assignedToUserId,
          ticket,
          message: `Ticket assigned to you: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }

      // Send to previous assignee if reassigned
      // This would be tracked in the audit history
    } catch (error) {
      logger.error('Error sending ticket assigned notifications:', error);
    }
  }

  /**
   * Send notifications when a ticket is resolved
   */
  static async sendTicketResolvedNotifications(ticket) {
    try {
      logger.info(`Sending ticket resolved notifications for ticket ${ticket.id}`);

      // Send to requester
      if (ticket.userId) {
        await this.sendNotification('ticket_resolved', {
          userId: ticket.userId,
          ticket,
          message: `Your ticket has been resolved: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }

      // Send to watchers
      const watchers = await this.getTicketWatchers(ticket.id);
      for (const watcher of watchers) {
        await this.sendNotification('ticket_resolved', {
          userId: watcher.userId,
          ticket,
          message: `Ticket resolved: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }
    } catch (error) {
      logger.error('Error sending ticket resolved notifications:', error);
    }
  }

  /**
   * Send notifications when a ticket is closed
   */
  static async sendTicketClosedNotifications(ticket) {
    try {
      logger.info(`Sending ticket closed notifications for ticket ${ticket.id}`);

      // Send to requester
      if (ticket.userId) {
        await this.sendNotification('ticket_closed', {
          userId: ticket.userId,
          ticket,
          message: `Your ticket has been closed: ${ticket.ticketNumber} - ${ticket.title}`,
        });
      }
    } catch (error) {
      logger.error('Error sending ticket closed notifications:', error);
    }
  }

  /**
   * Send escalation notifications
   */
  static async sendEscalationNotifications(escalation) {
    try {
      logger.info(`Sending escalation notifications for ticket ${escalation.ticketId}`);

      // Send to escalated user/group
      if (escalation.escalatedTo) {
        await this.sendNotification('ticket_escalated', {
          userId: escalation.escalatedTo,
          escalation,
          message: `Ticket escalated to you: ${escalation.reason}`,
        });
      }

      // Send to management
      if (escalation.escalatedToGroup) {
        const groupMembers = await this.getGroupMembers(escalation.escalatedToGroup);
        for (const member of groupMembers) {
          await this.sendNotification('ticket_escalated', {
            userId: member.userId,
            escalation,
            message: `Ticket escalated to your group: ${escalation.reason}`,
          });
        }
      }
    } catch (error) {
      logger.error('Error sending escalation notifications:', error);
    }
  }

  /**
   * Send individual notification
   */
  static async sendNotification(type, data) {
    try {
      // Create in-app notification
      await this.createInAppNotification(type, data);

      // Send email notification
      await this.sendEmailNotification(type, data);

      // Send push notification if urgent
      if (this.isUrgentNotification(type)) {
        await this.sendPushNotification(type, data);
      }

      logger.info(`Sent ${type} notification to user ${data.userId}: ${data.message}`);
    } catch (error) {
      logger.error('Error sending individual notification:', error);
    }
  }

  /**
   * Create in-app notification
   */
  static async createInAppNotification(type, data) {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type,
          title: this.getNotificationTitle(type),
          message: data.message,
          metadata: {
            ticketId: data.ticket?.id,
            ticketNumber: data.ticket?.ticketNumber,
            commentId: data.comment?.id,
            escalationId: data.escalation?.id,
          },
          isRead: false,
        },
      });
    } catch (error) {
      logger.error('Error creating in-app notification:', error);
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(type, data) {
    try {
      // Get user email preferences
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true, name: true },
      });

      if (!user?.email) {
        return;
      }

      // Check if user wants email notifications for this type
      const preferences = await this.getUserNotificationPreferences(data.userId);
      if (!preferences.email[type]) {
        return;
      }

      // This would integrate with email service (SendGrid, SES, etc.)
      logger.info(`Sending email notification to ${user.email}: ${data.message}`);

      // Placeholder for actual email service integration
      const _emailData = {
        to: user.email,
        subject: this.getEmailSubject(type, data),
        template: this.getEmailTemplate(type),
        data: {
          userName: user.name,
          ticket: data.ticket,
          comment: data.comment,
          escalation: data.escalation,
          message: data.message,
        },
      };

      // await emailService.send(_emailData);
    } catch (error) {
      logger.error('Error sending email notification:', error);
    }
  }

  /**
   * Send push notification
   */
  static async sendPushNotification(type, data) {
    try {
      // Get user's push notification tokens
      const tokens = await this.getUserPushTokens(data.userId);

      if (tokens.length === 0) {
        return;
      }

      // This would integrate with push notification service (FCM, APNs, etc.)
      logger.info(`Sending push notification to user ${data.userId}: ${data.message}`);

      // Placeholder for actual push service integration
      const _pushData = {
        tokens,
        title: this.getNotificationTitle(type),
        body: data.message,
        data: {
          type,
          ticketId: data.ticket?.id,
          ticketNumber: data.ticket?.ticketNumber,
        },
      };

      // await pushService.send(_pushData);
    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }

  /**
   * Get watchers for a ticket
   */
  static async getTicketWatchers(ticketId) {
    try {
      return await prisma.ticketWatcher.findMany({
        where: { ticketId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      logger.error('Error getting ticket watchers:', error);
      return [];
    }
  }

  /**
   * Get users interested in ticket updates
   */
  static async getInterestedUsers(ticket, excludeUserId) {
    const interestedUsers = [];

    // Add requester
    if (ticket.userId && ticket.userId !== excludeUserId) {
      interestedUsers.push({ id: ticket.userId });
    }

    // Add assignee
    if (ticket.assignedToUserId && ticket.assignedToUserId !== excludeUserId) {
      interestedUsers.push({ id: ticket.assignedToUserId });
    }

    // Add watchers
    const watchers = await this.getTicketWatchers(ticket.id);
    for (const watcher of watchers) {
      if (watcher.userId !== excludeUserId) {
        interestedUsers.push({ id: watcher.userId });
      }
    }

    return interestedUsers;
  }

  /**
   * Get group members
   */
  static async getGroupMembers(groupId) {
    try {
      return await prisma.groupMember.findMany({
        where: { groupId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      logger.error('Error getting group members:', error);
      return [];
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserNotificationPreferences(userId) {
    try {
      const preferences = await prisma.userNotificationPreferences.findUnique({
        where: { userId },
      });

      return (
        preferences?.preferences || {
          email: {
            ticket_created: true,
            ticket_assigned: true,
            ticket_updated: true,
            ticket_resolved: true,
            ticket_closed: true,
            comment_added: true,
            sla_breach: true,
            ticket_escalated: true,
          },
          push: {
            ticket_assigned: true,
            sla_breach: true,
            ticket_escalated: true,
          },
          inApp: {
            ticket_created: true,
            ticket_assigned: true,
            ticket_updated: true,
            ticket_resolved: true,
            ticket_closed: true,
            comment_added: true,
            sla_breach: true,
            ticket_escalated: true,
          },
        }
      );
    } catch (error) {
      logger.error('Error getting user notification preferences:', error);
      return { email: {}, push: {}, inApp: {} };
    }
  }

  /**
   * Get user push notification tokens
   */
  static async getUserPushTokens(userId) {
    try {
      const tokens = await prisma.userPushToken.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: { token: true },
      });

      return tokens.map((t) => t.token);
    } catch (error) {
      logger.error('Error getting user push tokens:', error);
      return [];
    }
  }

  /**
   * Get notification title based on type
   */
  static getNotificationTitle(type) {
    const titles = {
      ticket_created: 'New Ticket Created',
      ticket_created_confirmation: 'Ticket Created',
      ticket_assigned: 'Ticket Assigned',
      ticket_updated: 'Ticket Updated',
      ticket_resolved: 'Ticket Resolved',
      ticket_closed: 'Ticket Closed',
      comment_added: 'New Comment',
      sla_breach: 'SLA Breach Alert',
      ticket_escalated: 'Ticket Escalated',
    };

    return titles[type] || 'Notification';
  }

  /**
   * Get email subject based on type and data
   */
  static getEmailSubject(type, data) {
    const ticket = data.ticket;
    const ticketRef = ticket ? `[${ticket.ticketNumber}]` : '';

    const subjects = {
      ticket_created: `${ticketRef} New Ticket Created: ${ticket?.title}`,
      ticket_created_confirmation: `${ticketRef} Your Ticket Has Been Created`,
      ticket_assigned: `${ticketRef} Ticket Assigned to You`,
      ticket_updated: `${ticketRef} Ticket Updated`,
      ticket_resolved: `${ticketRef} Ticket Resolved`,
      ticket_closed: `${ticketRef} Ticket Closed`,
      comment_added: `${ticketRef} New Comment Added`,
      sla_breach: `${ticketRef} SLA Breach Alert`,
      ticket_escalated: `${ticketRef} Ticket Escalated`,
    };

    return subjects[type] || 'Nova ITSM Notification';
  }

  /**
   * Get email template name based on type
   */
  static getEmailTemplate(type) {
    const templates = {
      ticket_created: 'ticket-created',
      ticket_created_confirmation: 'ticket-confirmation',
      ticket_assigned: 'ticket-assigned',
      ticket_updated: 'ticket-updated',
      ticket_resolved: 'ticket-resolved',
      ticket_closed: 'ticket-closed',
      comment_added: 'comment-added',
      sla_breach: 'sla-breach',
      ticket_escalated: 'ticket-escalated',
    };

    return templates[type] || 'default-notification';
  }

  /**
   * Check if notification type is urgent
   */
  static isUrgentNotification(type) {
    const urgentTypes = ['sla_breach', 'ticket_escalated', 'ticket_assigned'];

    return urgentTypes.includes(type);
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId, userId) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId, // Ensure user can only mark their own notifications
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get user's unread notifications
   */
  static async getUnreadNotifications(userId, limit = 50) {
    try {
      return await prisma.notification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      logger.error('Error getting unread notifications:', error);
      return [];
    }
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });

      logger.info(`Cleaned up ${result.count} old notifications`);
      return result.count;
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}
