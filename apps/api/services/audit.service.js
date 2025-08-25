import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';

/**
 * Audit Service - Tracks all changes and actions on tickets
 */
export class AuditService {
  /**
   * Log ticket creation
   */
  static async logTicketCreated(ticket, user) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'CREATED',
          fieldChanged: null,
          oldValue: null,
          newValue: null,
          description: `Ticket created: ${ticket.ticketNumber} - ${ticket.title}`,
          metadata: {
            ticketType: ticket.type,
            priority: ticket.priority,
            category: ticket.category,
          },
        },
      });

      logger.info(`Audit: Ticket ${ticket.id} created by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging ticket creation:', error);
    }
  }

  /**
   * Log ticket updates
   */
  static async logTicketUpdated(ticket, changes, user) {
    try {
      for (const change of changes) {
        await prisma.ticketHistory.create({
          data: {
            ticketId: ticket.id,
            userId: user.id,
            action: 'UPDATED',
            fieldChanged: change.field,
            oldValue: this.serializeValue(change.oldValue),
            newValue: this.serializeValue(change.newValue),
            description: `Updated ${change.field}: ${change.oldValue} → ${change.newValue}`,
            metadata: {
              changeType: 'field_update',
              field: change.field,
            },
          },
        });
      }

      logger.info(
        `Audit: Ticket ${ticket.id} updated by user ${user.id}, ${changes.length} changes`,
      );
    } catch (error) {
      logger.error('Error logging ticket update:', error);
    }
  }

  /**
   * Log ticket assignment
   */
  static async logTicketAssigned(ticket, assignmentData, user) {
    try {
      let description = 'Ticket assigned';
      const metadata = { assignmentType: 'manual' };

      if (assignmentData.assignedToUserId) {
        description += ` to user ${assignmentData.assignedToUserId}`;
        metadata.assignedToUserId = assignmentData.assignedToUserId;
      }

      if (assignmentData.assignedToGroupId) {
        description += ` to group ${assignmentData.assignedToGroupId}`;
        metadata.assignedToGroupId = assignmentData.assignedToGroupId;
      }

      if (assignmentData.assignedToQueueId) {
        description += ` to queue ${assignmentData.assignedToQueueId}`;
        metadata.assignedToQueueId = assignmentData.assignedToQueueId;
      }

      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'ASSIGNED',
          fieldChanged: 'assignment',
          oldValue: null,
          newValue: description,
          description,
          metadata,
        },
      });

      logger.info(`Audit: Ticket ${ticket.id} assigned by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging ticket assignment:', error);
    }
  }

  /**
   * Log ticket escalation
   */
  static async logTicketEscalated(ticket, escalationData, user) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'ESCALATED',
          fieldChanged: 'escalation_level',
          oldValue: String(escalationData.fromLevel || 0),
          newValue: String(escalationData.toLevel),
          description: `Ticket escalated to level ${escalationData.toLevel}: ${escalationData.reason}`,
          metadata: {
            escalationLevel: escalationData.toLevel,
            reason: escalationData.reason,
            escalatedTo: escalationData.escalatedTo,
            escalatedToGroup: escalationData.escalatedToGroup,
          },
        },
      });

      logger.info(`Audit: Ticket ${ticket.id} escalated by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging ticket escalation:', error);
    }
  }

  /**
   * Log ticket resolution
   */
  static async logTicketResolved(ticket, resolutionData, user) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'RESOLVED',
          fieldChanged: 'state',
          oldValue: ticket.previousState || 'IN_PROGRESS',
          newValue: 'RESOLVED',
          description: `Ticket resolved: ${resolutionData.resolution}`,
          metadata: {
            resolution: resolutionData.resolution,
            resolutionTime: ticket.resolutionTime,
          },
        },
      });

      logger.info(`Audit: Ticket ${ticket.id} resolved by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging ticket resolution:', error);
    }
  }

  /**
   * Log ticket closure
   */
  static async logTicketClosed(ticket, closeData, user) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'CLOSED',
          fieldChanged: 'state',
          oldValue: 'RESOLVED',
          newValue: 'CLOSED',
          description: `Ticket closed: ${closeData.closeNotes || 'No notes provided'}`,
          metadata: {
            closeNotes: closeData.closeNotes,
            satisfactionRating: closeData.satisfactionRating,
            satisfactionComment: closeData.satisfactionComment,
          },
        },
      });

      logger.info(`Audit: Ticket ${ticket.id} closed by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging ticket closure:', error);
    }
  }

  /**
   * Log ticket reopening
   */
  static async logTicketReopened(ticket, reopenData, user) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'REOPENED',
          fieldChanged: 'state',
          oldValue: ticket.previousState || 'CLOSED',
          newValue: 'REOPENED',
          description: `Ticket reopened: ${reopenData.reason}`,
          metadata: {
            reason: reopenData.reason,
          },
        },
      });

      logger.info(`Audit: Ticket ${ticket.id} reopened by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging ticket reopening:', error);
    }
  }

  /**
   * Log comment addition
   */
  static async logCommentAdded(ticket, comment) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: comment.userId,
          action: 'COMMENT_ADDED',
          fieldChanged: 'comments',
          oldValue: null,
          newValue: comment.content.substring(0, 255),
          description: `Comment added: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}`,
          metadata: {
            commentId: comment.id,
            isInternal: comment.isInternal,
            isSystem: comment.isSystem,
          },
        },
      });

      logger.info(`Audit: Comment added to ticket ${ticket.id} by user ${comment.userId}`);
    } catch (error) {
      logger.error('Error logging comment addition:', error);
    }
  }

  /**
   * Log attachment addition
   */
  static async logAttachmentAdded(ticket, attachment, user) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: user.id,
          action: 'ATTACHMENT_ADDED',
          fieldChanged: 'attachments',
          oldValue: null,
          newValue: attachment.filename,
          description: `Attachment added: ${attachment.filename}`,
          metadata: {
            attachmentId: attachment.id,
            filename: attachment.filename,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
          },
        },
      });

      logger.info(`Audit: Attachment added to ticket ${ticket.id} by user ${user.id}`);
    } catch (error) {
      logger.error('Error logging attachment addition:', error);
    }
  }

  /**
   * Log SLA breach
   */
  static async logSLABreach(ticket, breachType, targetTime, actualTime) {
    try {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: null, // System action
          action: 'SLA_BREACH',
          fieldChanged: `${breachType}_time`,
          oldValue: targetTime.toISOString(),
          newValue: actualTime.toISOString(),
          description: `SLA breach: ${breachType} time exceeded`,
          metadata: {
            breachType,
            targetTime: targetTime.toISOString(),
            actualTime: actualTime.toISOString(),
            breachDuration: Math.round((actualTime - targetTime) / (1000 * 60)), // minutes
          },
        },
      });

      logger.info(`Audit: SLA breach logged for ticket ${ticket.id}: ${breachType}`);
    } catch (error) {
      logger.error('Error logging SLA breach:', error);
    }
  }

  /**
   * Get audit trail for a ticket
   */
  static async getTicketAuditTrail(ticketId, options = {}) {
    try {
      const { limit = 50, offset = 0, actions, userId } = options;

      const whereClause = { ticketId };
      if (actions && actions.length > 0) {
        whereClause.action = { in: actions };
      }
      if (userId) {
        whereClause.userId = userId;
      }

      const auditEntries = await prisma.ticketHistory.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });

      return auditEntries;
    } catch (error) {
      logger.error('Error getting audit trail:', error);
      throw new Error('Failed to get audit trail');
    }
  }

  /**
   * Get audit summary for a ticket
   */
  static async getTicketAuditSummary(ticketId) {
    try {
      const summary = await prisma.ticketHistory.groupBy({
        by: ['action'],
        where: { ticketId },
        _count: { action: true },
      });

      return summary.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {});
    } catch (error) {
      logger.error('Error getting audit summary:', error);
      return {};
    }
  }

  /**
   * Serialize value for storage
   */
  static serializeValue(value) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
