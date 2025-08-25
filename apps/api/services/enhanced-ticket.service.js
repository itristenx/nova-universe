import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';
import { generateTypedTicketId } from '../utils/dbUtils.js';
import { SLAService } from './sla.service.js';
import { WorkflowService } from './workflow.service.js';
import { NotificationService } from './notification.service.js';
import { AuditService } from './audit.service.js';
import { AutoClassificationService } from './autoClassification.service.js';
import { SearchService } from './search.service.js';
import { ExportService } from './export.service.js';

/**
 * Enhanced Ticket Service - Production Ready ITSM Implementation
 * Based on ITIL standards and industry best practices
 */
export class TicketService {
  /**
   * Get tickets with advanced filtering, sorting, and pagination
   */
  static async getTickets(filters = {}, user) {
    try {
      const {
        page = 1,
        limit = 25,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search,
        searchFields = ['title', 'description'],
        ...filterOptions
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause = await this.buildWhereClause(filterOptions, user);

      // Add search functionality
      if (search) {
        const searchConditions = searchFields.map((field) => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        }));

        whereClause.OR = searchConditions;
      }

      // Execute queries
      const [tickets, totalCount] = await Promise.all([
        prisma.enhancedSupportTicket.findMany({
          where: whereClause,
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            assignedUser: {
              select: { id: true, name: true, email: true },
            },
            assignedGroup: {
              select: { id: true, name: true },
            },
            assignedQueue: {
              select: { id: true, name: true },
            },
            sla: {
              select: { id: true, name: true, responseTime: true, resolutionTime: true },
            },
            _count: {
              select: {
                comments: true,
                attachments: true,
                watchers: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.enhancedSupportTicket.count({ where: whereClause }),
      ]);

      // Calculate pagination
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        tickets: tickets.map((ticket) => this.formatTicketResponse(ticket)),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          itemsPerPage: limit,
        },
        totalFiltered: totalCount,
        totalUnfiltered: await prisma.enhancedSupportTicket.count(),
        appliedFilters: Object.keys(filterOptions).filter(
          (key) => filterOptions[key] !== undefined,
        ),
      };
    } catch (error) {
      logger.error('Error in getTickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  }

  /**
   * Get single ticket by ID with optional includes
   */
  static async getTicketById(ticketId, include = [], user) {
    try {
      const includeClause = this.buildIncludeClause(include);

      const ticket = await prisma.enhancedSupportTicket.findFirst({
        where: {
          id: ticketId,
          ...(await this.getAccessFilter(user)),
        },
        include: includeClause,
      });

      if (!ticket) {
        return null;
      }

      return this.formatTicketResponse(ticket, include);
    } catch (error) {
      logger.error('Error in getTicketById:', error);
      throw new Error('Failed to fetch ticket');
    }
  }

  /**
   * Create new ticket
   */
  static async createTicket(ticketData, user) {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        // Generate ticket number
        const ticketNumber = await generateTypedTicketId(ticketData.type || 'REQUEST');

        // Determine SLA
        const sla = await SLAService.determineSLA(ticketData);

        // Calculate due dates
        const dueDates = this.calculateDueDates(sla, ticketData.priority, ticketData.urgency);

        // Create ticket
        const ticket = await tx.enhancedSupportTicket.create({
          data: {
            ticketNumber,
            title: ticketData.title,
            description: ticketData.description,
            shortDescription:
              ticketData.shortDescription || this.generateShortDescription(ticketData.title),
            type: this.normalizeTicketType(ticketData.type || 'REQUEST'),
            state: 'NEW',
            priority: ticketData.priority || 'MEDIUM',
            urgency: ticketData.urgency || 'MEDIUM',
            impact: ticketData.impact || 'MEDIUM',
            category: ticketData.category,
            subcategory: ticketData.subcategory,
            businessService: ticketData.businessService,
            configurationItem: ticketData.configurationItem,
            userId: ticketData.userId,
            assignedToUserId: ticketData.assignedToUserId,
            assignedToGroupId: ticketData.assignedToGroupId,
            assignedToQueueId: ticketData.assignedToQueueId,
            source: ticketData.source || 'PORTAL',
            channel: ticketData.channel,
            location: ticketData.location,
            costCenter: ticketData.costCenter,
            businessJustification: ticketData.businessJustification,
            dueDate: ticketData.dueDate ? new Date(ticketData.dueDate) : dueDates.dueDate,
            slaId: sla?.id,
            responseTimeTarget: sla?.responseTime,
            resolutionTimeTarget: sla?.resolutionTime,
            tags: ticketData.tags || [],
            customFields: ticketData.customFields || {},
            confidentialityLevel: ticketData.confidentialityLevel || 'internal',
            parentTicketId: ticketData.parentTicketId,
            isVip: await this.isVipUser(ticketData.userId),
            lastActivityAt: new Date(),
          },
          include: {
            requester: true,
            assignedUser: true,
            assignedGroup: true,
            assignedQueue: true,
            sla: true,
          },
        });

        // Handle attachments
        if (ticketData.attachments && ticketData.attachments.length > 0) {
          await this.processAttachments(tx, ticket.id, ticketData.attachments, user.id);
        }

        // Auto-assign if queue has auto-assignment enabled
        if (ticket.assignedToQueueId) {
          await this.performAutoAssignment(tx, ticket);
        }

        // Add automatic watchers
        await this.addAutoWatchers(tx, ticket);

        // Create audit entry
        await AuditService.logTicketCreated(ticket, user);

        // Start workflow if specified
        if (ticketData.workflowId) {
          await WorkflowService.startWorkflow(ticket.id, ticketData.workflowId, user);
        }

        return ticket;
      });

      // Trigger notifications (outside transaction)
      setImmediate(async () => {
        try {
          await NotificationService.sendTicketCreatedNotifications(transaction);
        } catch (error) {
          logger.error('Error sending ticket created notifications:', error);
        }
      });

      return this.formatTicketResponse(transaction);
    } catch (error) {
      logger.error('Error in createTicket:', error);
      throw new Error('Failed to create ticket');
    }
  }

  /**
   * Update existing ticket
   */
  static async updateTicket(ticketId, updateData, user) {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        // Get current ticket
        const currentTicket = await tx.enhancedSupportTicket.findUnique({
          where: { id: ticketId },
          include: { sla: true },
        });

        if (!currentTicket) {
          throw new Error('Ticket not found');
        }

        // Check permissions
        await this.checkUpdatePermissions(currentTicket, updateData, user);

        // Track changes for audit
        const changes = this.trackChanges(currentTicket, updateData);

        // Handle state transitions
        const stateData = await this.handleStateTransition(
          currentTicket.state,
          updateData.state,
          currentTicket,
          user,
        );

        // Update SLA if priority/urgency/impact changed
        let slaData = {};
        if (updateData.priority || updateData.urgency || updateData.impact) {
          const newSla = await SLAService.determineSLA({
            ...currentTicket,
            ...updateData,
          });
          if (newSla) {
            slaData = {
              slaId: newSla.id,
              responseTimeTarget: newSla.responseTime,
              resolutionTimeTarget: newSla.resolutionTime,
            };
          }
        }

        // Perform update
        const updatedTicket = await tx.enhancedSupportTicket.update({
          where: { id: ticketId },
          data: {
            ...updateData,
            ...stateData,
            ...slaData,
            updatedAt: new Date(),
            lastActivityAt: new Date(),
          },
          include: {
            requester: true,
            assignedUser: true,
            assignedGroup: true,
            assignedQueue: true,
            sla: true,
          },
        });

        // Log changes
        if (changes.length > 0) {
          await AuditService.logTicketUpdated(updatedTicket, changes, user);
        }

        // Handle assignment changes
        if (
          updateData.assignedToUserId !== undefined ||
          updateData.assignedToGroupId !== undefined ||
          updateData.assignedToQueueId !== undefined
        ) {
          await this.handleAssignmentChange(tx, updatedTicket, currentTicket, user);
        }

        return updatedTicket;
      });

      return this.formatTicketResponse(transaction);
    } catch (error) {
      logger.error('Error in updateTicket:', error);
      throw error;
    }
  }

  /**
   * Assign ticket to user, group, or queue
   */
  static async assignTicket(ticketId, assignmentData) {
    try {
      const ticket = await prisma.enhancedSupportTicket.update({
        where: { id: ticketId },
        data: {
          assignedToUserId: assignmentData.assignedToUserId,
          assignedToGroupId: assignmentData.assignedToGroupId,
          assignedToQueueId: assignmentData.assignedToQueueId,
          state: 'ASSIGNED',
          updatedAt: new Date(),
          lastActivityAt: new Date(),
        },
        include: {
          requester: true,
          assignedUser: true,
          assignedGroup: true,
          assignedQueue: true,
        },
      });

      // Log assignment
      await AuditService.logTicketAssigned(ticket, assignmentData, assignmentData.assignedBy);

      // Add assignee as watcher
      if (assignmentData.assignedToUserId) {
        await this.addWatcher(ticketId, assignmentData.assignedToUserId, 'auto_assignee');
      }

      return this.formatTicketResponse(ticket);
    } catch (error) {
      logger.error('Error in assignTicket:', error);
      throw new Error('Failed to assign ticket');
    }
  }

  /**
   * Add comment to ticket
   */
  static async addComment(ticketId, commentData) {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        // Create comment
        const comment = await tx.ticketComment.create({
          data: {
            ticketId,
            userId: commentData.userId,
            content: commentData.content,
            isInternal: commentData.isInternal || false,
            isSystem: commentData.isSystem || false,
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        // Handle attachments
        if (commentData.attachments && commentData.attachments.length > 0) {
          await this.processCommentAttachments(tx, comment.id, commentData.attachments);
        }

        // Update ticket last activity
        await tx.enhancedSupportTicket.update({
          where: { id: ticketId },
          data: {
            lastActivityAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Update first response time if this is the first response
        if (!commentData.isInternal && !commentData.isSystem) {
          await this.updateFirstResponseTime(tx, ticketId, comment.createdAt);
        }

        return comment;
      });

      return transaction;
    } catch (error) {
      logger.error('Error in addComment:', error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Add watcher to ticket
   */
  static async addWatcher(ticketId, userId, watchType = 'manual', addedBy = null) {
    try {
      await prisma.ticketWatcher.upsert({
        where: {
          ticketId_userId: {
            ticketId,
            userId,
          },
        },
        update: {
          watchType,
          addedBy,
        },
        create: {
          ticketId,
          userId,
          watchType,
          addedBy,
        },
      });

      logger.info(`Added watcher ${userId} to ticket ${ticketId}`);
    } catch (error) {
      logger.error('Error in addWatcher:', error);
      throw new Error('Failed to add watcher');
    }
  }

  /**
   * Escalate ticket
   */
  static async escalateTicket(ticketId, escalationData) {
    try {
      const transaction = await prisma.$transaction(async (tx) => {
        // Get current escalation level
        const existingEscalations = await tx.ticketEscalation.findMany({
          where: { ticketId, status: 'ACTIVE' },
          orderBy: { escalationLevel: 'desc' },
        });

        const currentLevel = existingEscalations[0]?.escalationLevel || 0;
        const newLevel = escalationData.escalationLevel || currentLevel + 1;

        // Create escalation record
        const escalation = await tx.ticketEscalation.create({
          data: {
            ticketId,
            escalationLevel: newLevel,
            escalatedBy: escalationData.escalatedBy,
            escalatedTo: escalationData.escalatedTo,
            escalatedToGroup: escalationData.escalatedToGroup,
            reason: escalationData.reason,
            status: 'ACTIVE',
          },
          include: {
            ticket: true,
            escalatingUser: true,
            escalatedToUser: true,
            escalatedToGroupRel: true,
          },
        });

        // Update ticket
        await tx.enhancedSupportTicket.update({
          where: { id: ticketId },
          data: {
            isEscalated: true,
            assignedToUserId: escalationData.escalatedTo,
            assignedToGroupId: escalationData.escalatedToGroup,
            updatedAt: new Date(),
            lastActivityAt: new Date(),
          },
        });

        return escalation;
      });

      return transaction;
    } catch (error) {
      logger.error('Error in escalateTicket:', error);
      throw new Error('Failed to escalate ticket');
    }
  }

  /**
   * Resolve ticket
   */
  static async resolveTicket(ticketId, resolutionData) {
    try {
      const resolvedAt = new Date();

      const ticket = await prisma.enhancedSupportTicket.update({
        where: { id: ticketId },
        data: {
          state: 'RESOLVED',
          resolution: resolutionData.resolution,
          resolvedAt,
          resolutionTime: await this.calculateResolutionTime(ticketId, resolvedAt),
          updatedAt: new Date(),
          lastActivityAt: new Date(),
        },
        include: {
          requester: true,
          assignedUser: true,
          sla: true,
        },
      });

      // Add resolution comment
      await this.addComment(ticketId, {
        userId: resolutionData.resolvedBy,
        content: `Ticket resolved: ${resolutionData.resolution}`,
        isSystem: true,
      });

      // Check for SLA compliance
      await SLAService.checkResolutionSLA(ticket);

      return this.formatTicketResponse(ticket);
    } catch (error) {
      logger.error('Error in resolveTicket:', error);
      throw new Error('Failed to resolve ticket');
    }
  }

  /**
   * Close ticket
   */
  static async closeTicket(ticketId, closeData) {
    try {
      const closedAt = new Date();

      const ticket = await prisma.enhancedSupportTicket.update({
        where: { id: ticketId },
        data: {
          state: 'CLOSED',
          closedAt,
          closeNotes: closeData.closeNotes,
          satisfactionRating: closeData.satisfactionRating,
          satisfactionComment: closeData.satisfactionComment,
          updatedAt: new Date(),
        },
        include: {
          requester: true,
          assignedUser: true,
        },
      });

      // Add closure comment
      if (closeData.closeNotes) {
        await this.addComment(ticketId, {
          userId: closeData.closedBy,
          content: `Ticket closed: ${closeData.closeNotes}`,
          isSystem: true,
        });
      }

      return this.formatTicketResponse(ticket);
    } catch (error) {
      logger.error('Error in closeTicket:', error);
      throw new Error('Failed to close ticket');
    }
  }

  /**
   * Reopen ticket
   */
  static async reopenTicket(ticketId, reopenData) {
    try {
      const ticket = await prisma.enhancedSupportTicket.update({
        where: { id: ticketId },
        data: {
          state: 'REOPENED',
          closedAt: null,
          resolvedAt: null,
          updatedAt: new Date(),
          lastActivityAt: new Date(),
        },
        include: {
          requester: true,
          assignedUser: true,
        },
      });

      // Add reopen comment
      await this.addComment(ticketId, {
        userId: reopenData.reopenedBy,
        content: `Ticket reopened: ${reopenData.reason}`,
        isSystem: true,
      });

      return this.formatTicketResponse(ticket);
    } catch (error) {
      logger.error('Error in reopenTicket:', error);
      throw new Error('Failed to reopen ticket');
    }
  }

  /**
   * Link tickets together
   */
  static async linkTickets(sourceTicketId, targetTicketId, relationshipType, createdBy) {
    try {
      const link = await prisma.ticketLink.create({
        data: {
          sourceTicketId,
          targetTicketId,
          relationshipType: relationshipType.toUpperCase(),
          createdBy,
        },
        include: {
          sourceTicket: { select: { id: true, ticketNumber: true, title: true } },
          targetTicket: { select: { id: true, ticketNumber: true, title: true } },
        },
      });

      // Create reciprocal link for bidirectional relationships
      const reciprocalTypes = {
        BLOCKS: 'IS_BLOCKED_BY',
        IS_BLOCKED_BY: 'BLOCKS',
        DUPLICATES: 'IS_DUPLICATED_BY',
        IS_DUPLICATED_BY: 'DUPLICATES',
        PARENT_OF: 'CHILD_OF',
        CHILD_OF: 'PARENT_OF',
        CAUSED_BY: 'CAUSES',
        CAUSES: 'CAUSED_BY',
      };

      if (reciprocalTypes[relationshipType.toUpperCase()]) {
        await prisma.ticketLink.create({
          data: {
            sourceTicketId: targetTicketId,
            targetTicketId: sourceTicketId,
            relationshipType: reciprocalTypes[relationshipType.toUpperCase()],
            createdBy,
          },
        });
      }

      return link;
    } catch (error) {
      logger.error('Error in linkTickets:', error);
      throw new Error('Failed to link tickets');
    }
  }

  /**
   * Add time entry to ticket
   */
  static async addTimeEntry(ticketId, timeData) {
    try {
      const timeEntry = await prisma.ticketTimeEntry.create({
        data: {
          ticketId,
          userId: timeData.userId,
          duration: timeData.duration,
          description: timeData.description,
          timeType: timeData.timeType || 'WORK',
          billable: timeData.billable || false,
          startTime: new Date(timeData.startTime),
          endTime: timeData.endTime ? new Date(timeData.endTime) : null,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return timeEntry;
    } catch (error) {
      logger.error('Error in addTimeEntry:', error);
      throw new Error('Failed to add time entry');
    }
  }

  /**
   * Advanced search functionality
   */
  static async searchTickets(searchParams) {
    try {
      return await SearchService.searchTickets(searchParams);
    } catch (error) {
      logger.error('Error in searchTickets:', error);
      throw new Error('Search failed');
    }
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStats(params) {
    try {
      const { period, groupBy, assignedToMe, createdByMe, user } = params;

      const dateRange = this.getDateRange(period);
      const whereClause = {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
        ...(await this.getAccessFilter(user)),
      };

      if (assignedToMe) {
        whereClause.assignedToUserId = assignedToMe;
      }

      if (createdByMe) {
        whereClause.userId = createdByMe;
      }

      // Basic counts
      const [total, open, resolved, closed, breached] = await Promise.all([
        prisma.enhancedSupportTicket.count({ where: whereClause }),
        prisma.enhancedSupportTicket.count({
          where: { ...whereClause, state: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'] } },
        }),
        prisma.enhancedSupportTicket.count({
          where: { ...whereClause, state: 'RESOLVED' },
        }),
        prisma.enhancedSupportTicket.count({
          where: { ...whereClause, state: 'CLOSED' },
        }),
        prisma.enhancedSupportTicket.count({
          where: {
            ...whereClause,
            OR: [{ responseTimeBreached: true }, { resolutionTimeBreached: true }],
          },
        }),
      ]);

      // Group by statistics
      const groupedStats = groupBy ? await this.getGroupedStats(whereClause, groupBy) : null;

      // Average times
      const avgTimes = await this.getAverageResolutionTimes(whereClause);

      return {
        summary: {
          total,
          open,
          resolved,
          closed,
          breached,
          resolutionRate: total > 0 ? (((resolved + closed) / total) * 100).toFixed(1) : 0,
          slaCompliance: total > 0 ? (((total - breached) / total) * 100).toFixed(1) : 100,
        },
        averageTimes: avgTimes,
        groupedStats,
        period,
        dateRange,
      };
    } catch (error) {
      logger.error('Error in getTicketStats:', error);
      throw new Error('Failed to get ticket statistics');
    }
  }

  /**
   * Bulk operations on tickets
   */
  static async bulkOperation(operationData) {
    try {
      const { ticketIds, operation, data, performedBy } = operationData;

      const results = {
        successful: [],
        failed: [],
        totalProcessed: ticketIds.length,
      };

      for (const ticketId of ticketIds) {
        try {
          let result;

          switch (operation) {
            case 'update':
              result = await this.updateTicket(ticketId, data, { id: performedBy });
              break;
            case 'assign':
              result = await this.assignTicket(ticketId, { ...data, assignedBy: performedBy });
              break;
            case 'close':
              result = await this.closeTicket(ticketId, { ...data, closedBy: performedBy });
              break;
            case 'escalate':
              result = await this.escalateTicket(ticketId, { ...data, escalatedBy: performedBy });
              break;
            default:
              throw new Error(`Unsupported operation: ${operation}`);
          }

          results.successful.push({ ticketId, result });
        } catch (error) {
          results.failed.push({ ticketId, error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error in bulkOperation:', error);
      throw new Error('Bulk operation failed');
    }
  }

  /**
   * Export tickets to various formats
   */
  static async exportTickets(exportParams) {
    try {
      return await ExportService.exportTickets(exportParams);
    } catch (error) {
      logger.error('Error in exportTickets:', error);
      throw new Error('Export failed');
    }
  }

  /**
   * Get available ticket templates
   */
  static async getTicketTemplates(user) {
    try {
      const templates = await prisma.ticketTemplate.findMany({
        where: {
          isActive: true,
          OR: [{ isPublic: true }, { createdBy: user.id }],
        },
        include: {
          workflow: {
            select: { id: true, name: true },
          },
          sla: {
            select: { id: true, name: true, responseTime: true, resolutionTime: true },
          },
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });

      return templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        subcategory: template.subcategory,
        templateType: template.templateType,
        titleTemplate: template.titleTemplate,
        descriptionTemplate: template.descriptionTemplate,
        defaultPriority: template.defaultPriority,
        defaultUrgency: template.defaultUrgency,
        defaultImpact: template.defaultImpact,
        defaultCategory: template.defaultCategory,
        defaultSubcategory: template.defaultSubcategory,
        requiredFields: template.requiredFields,
        formSchema: template.formSchema,
        workflow: template.workflow,
        sla: template.sla,
        usageCount: template.usageCount,
        createdBy: template.createdByUser,
      }));
    } catch (error) {
      logger.error('Error in getTicketTemplates:', error);
      throw new Error('Failed to fetch ticket templates');
    }
  }

  /**
   * Create ticket from template
   */
  static async createFromTemplate(templateId, overrides, user) {
    try {
      const template = await prisma.ticketTemplate.findUnique({
        where: { id: templateId },
        include: {
          workflow: true,
          sla: true,
        },
      });

      if (!template) {
        throw new Error('Template not found');
      }

      if (!template.isActive) {
        throw new Error('Template is not active');
      }

      // Check template access permissions
      if (!template.isPublic && template.createdBy !== user.id) {
        throw new Error('Access denied to template');
      }

      // Process template variables in title and description
      const processedTitle = this.processTemplateVariables(
        template.titleTemplate,
        overrides.templateVariables || {},
      );

      const processedDescription = this.processTemplateVariables(
        template.descriptionTemplate,
        overrides.templateVariables || {},
      );

      // Validate required fields
      if (template.requiredFields && template.requiredFields.length > 0) {
        const missingFields = template.requiredFields.filter(
          (field) =>
            !overrides[field] &&
            !template[`default${field.charAt(0).toUpperCase() + field.slice(1)}`],
        );

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }

      // Merge template defaults with overrides
      const ticketData = {
        title: processedTitle,
        description: processedDescription,
        type: template.templateType || 'REQUEST',
        priority: overrides.priority || template.defaultPriority || 'MEDIUM',
        urgency: overrides.urgency || template.defaultUrgency || 'MEDIUM',
        impact: overrides.impact || template.defaultImpact || 'MEDIUM',
        category: overrides.category || template.defaultCategory,
        subcategory: overrides.subcategory || template.defaultSubcategory,
        workflowId: overrides.workflowId || template.workflowId,
        slaId: overrides.slaId || template.slaId,
        userId: user.id,
        source: overrides.source || 'TEMPLATE',
        customFields: {
          ...(template.formSchema?.defaultValues || {}),
          ...(overrides.customFields || {}),
          templateId: templateId,
          templateName: template.name,
        },
        ...overrides,
      };

      // Create ticket using standard creation flow
      const createdTicket = await this.createTicket(ticketData, user);

      // Update template usage count
      await prisma.ticketTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
      });

      logger.info(`Ticket created from template ${template.name} by user ${user.id}`);

      return createdTicket;
    } catch (error) {
      logger.error('Error in createFromTemplate:', error);
      throw error;
    }
  }

  /**
   * Process template variables in text
   */
  static processTemplateVariables(text, variables) {
    if (!text || typeof text !== 'string') return text;

    let processedText = text;

    // Replace {{variable}} patterns
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedText = processedText.replace(regex, value || '');
    });

    // Replace system variables
    const systemVars = {
      currentDate: new Date().toLocaleDateString(),
      currentTime: new Date().toLocaleTimeString(),
      currentDateTime: new Date().toLocaleString(),
    };

    Object.entries(systemVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedText = processedText.replace(regex, value);
    });

    return processedText;
  }

  /**
   * Auto-classify ticket using AI/ML
   */
  static async autoClassifyTicket(ticketData) {
    try {
      return await AutoClassificationService.classifyTicket(ticketData);
    } catch (error) {
      logger.error('Error in autoClassifyTicket:', error);
      return null; // Don't fail ticket creation if classification fails
    }
  }

  // Private helper methods

  static async buildWhereClause(filters, user) {
    const where = {};

    // Apply access filter based on user permissions
    const accessFilter = await this.getAccessFilter(user);
    Object.assign(where, accessFilter);

    // Apply filters
    if (filters.status)
      where.state = { in: Array.isArray(filters.status) ? filters.status : [filters.status] };
    if (filters.priority)
      where.priority = {
        in: Array.isArray(filters.priority) ? filters.priority : [filters.priority],
      };
    if (filters.type)
      where.type = {
        in: Array.isArray(filters.type)
          ? filters.type.map((t) => t.toUpperCase())
          : [filters.type.toUpperCase()],
      };
    if (filters.assignedToUserId) where.assignedToUserId = filters.assignedToUserId;
    if (filters.assignedToGroupId) where.assignedToGroupId = filters.assignedToGroupId;
    if (filters.assignedToQueueId) where.assignedToQueueId = filters.assignedToQueueId;
    if (filters.requesterId) where.userId = filters.requesterId;
    if (filters.category) where.category = filters.category;
    if (filters.subcategory) where.subcategory = filters.subcategory;
    if (filters.isVip !== undefined) where.isVip = filters.isVip;
    if (filters.isEscalated !== undefined) where.isEscalated = filters.isEscalated;
    if (filters.slaBreached !== undefined) {
      where.OR = [
        { responseTimeBreached: filters.slaBreached },
        { resolutionTimeBreached: filters.slaBreached },
      ];
    }

    // Date filters
    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) where.createdAt.gte = new Date(filters.createdAfter);
      if (filters.createdBefore) where.createdAt.lte = new Date(filters.createdBefore);
    }

    if (filters.dueDate) {
      where.dueDate = {
        lte: new Date(filters.dueDate),
      };
    }

    // Tags filter
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : filters.tags.split(',');
      where.tags = {
        hasSome: tags,
      };
    }

    return where;
  }

  static buildIncludeClause(include) {
    const includeClause = {
      requester: {
        select: { id: true, name: true, email: true },
      },
      assignedUser: {
        select: { id: true, name: true, email: true },
      },
      assignedGroup: {
        select: { id: true, name: true },
      },
      assignedQueue: {
        select: { id: true, name: true },
      },
      sla: {
        select: { id: true, name: true, responseTime: true, resolutionTime: true },
      },
    };

    if (include.includes('comments')) {
      includeClause.comments = {
        include: {
          user: { select: { id: true, name: true, email: true } },
          attachments: true,
        },
        orderBy: { createdAt: 'asc' },
      };
    }

    if (include.includes('attachments')) {
      includeClause.attachments = {
        include: {
          uploader: { select: { id: true, name: true, email: true } },
        },
      };
    }

    if (include.includes('history')) {
      includeClause.history = {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      };
    }

    if (include.includes('time_entries')) {
      includeClause.timeEntries = {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startTime: 'desc' },
      };
    }

    if (include.includes('watchers')) {
      includeClause.watchers = {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      };
    }

    if (include.includes('links')) {
      includeClause.linkedTickets = {
        include: {
          targetTicket: { select: { id: true, ticketNumber: true, title: true, state: true } },
        },
      };
      includeClause.linkedFromTickets = {
        include: {
          sourceTicket: { select: { id: true, ticketNumber: true, title: true, state: true } },
        },
      };
    }

    return includeClause;
  }

  static async getAccessFilter(user) {
    // Implement based on user roles and permissions
    // This is a simplified version - in production, this would be more complex
    if (user.roles?.includes('admin') || user.roles?.includes('technician')) {
      return {}; // Admin/tech can see all tickets
    }

    // Regular users can only see their own tickets and public tickets
    return {
      OR: [
        { userId: user.id }, // Tickets they created
        { assignedToUserId: user.id }, // Tickets assigned to them
        { confidentialityLevel: { in: ['public', 'internal'] } }, // Public tickets
      ],
    };
  }

  static formatTicketResponse(ticket, include = []) {
    if (!ticket) return null;

    const formatted = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      shortDescription: ticket.shortDescription,
      type: ticket.type,
      state: ticket.state,
      priority: ticket.priority,
      urgency: ticket.urgency,
      impact: ticket.impact,
      category: ticket.category,
      subcategory: ticket.subcategory,
      businessService: ticket.businessService,
      configurationItem: ticket.configurationItem,
      source: ticket.source,
      channel: ticket.channel,
      location: ticket.location,
      costCenter: ticket.costCenter,
      businessJustification: ticket.businessJustification,
      resolution: ticket.resolution,
      closeNotes: ticket.closeNotes,
      tags: ticket.tags,
      customFields: ticket.customFields,
      isVip: ticket.isVip,
      isEscalated: ticket.isEscalated,
      confidentialityLevel: ticket.confidentialityLevel,
      satisfactionRating: ticket.satisfactionRating,
      satisfactionComment: ticket.satisfactionComment,
      responseTimeTarget: ticket.responseTimeTarget,
      resolutionTimeTarget: ticket.resolutionTimeTarget,
      responseTimeBreached: ticket.responseTimeBreached,
      resolutionTimeBreached: ticket.resolutionTimeBreached,
      responseTime: ticket.responseTime,
      resolutionTime: ticket.resolutionTime,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      closedAt: ticket.closedAt,
      resolvedAt: ticket.resolvedAt,
      firstResponseAt: ticket.firstResponseAt,
      lastActivityAt: ticket.lastActivityAt,
      dueDate: ticket.dueDate,
      requester: ticket.requester,
      assignedUser: ticket.assignedUser,
      assignedGroup: ticket.assignedGroup,
      assignedQueue: ticket.assignedQueue,
      sla: ticket.sla,
    };

    // Add counts if available
    if (ticket._count) {
      formatted.counts = ticket._count;
    }

    // Add included data
    if (ticket.comments && include.includes('comments')) {
      formatted.comments = ticket.comments;
    }
    if (ticket.attachments && include.includes('attachments')) {
      formatted.attachments = ticket.attachments;
    }
    if (ticket.history && include.includes('history')) {
      formatted.history = ticket.history;
    }
    if (ticket.timeEntries && include.includes('time_entries')) {
      formatted.timeEntries = ticket.timeEntries;
    }
    if (ticket.watchers && include.includes('watchers')) {
      formatted.watchers = ticket.watchers;
    }
    if (ticket.linkedTickets && include.includes('links')) {
      formatted.linkedTickets = ticket.linkedTickets;
    }
    if (ticket.linkedFromTickets && include.includes('links')) {
      formatted.linkedFromTickets = ticket.linkedFromTickets;
    }

    return formatted;
  }

  static normalizeTicketType(type) {
    const typeMap = {
      incident: 'INCIDENT',
      request: 'REQUEST',
      problem: 'PROBLEM',
      change: 'CHANGE',
      task: 'TASK',
      hr: 'HR',
      ops: 'OPS',
      isac: 'ISAC',
      feedback: 'FEEDBACK',
    };

    return typeMap[type?.toLowerCase()] || 'REQUEST';
  }

  static generateShortDescription(title) {
    return title.length > 160 ? title.substring(0, 157) + '...' : title;
  }

  static calculateDueDates(sla, priority, _urgency) {
    // Calculate due dates based on SLA and business hours
    const now = new Date();
    let dueDate = new Date(now);

    if (sla?.resolutionTime) {
      dueDate.setMinutes(dueDate.getMinutes() + sla.resolutionTime);
    } else {
      // Default resolution times based on priority
      const defaultTimes = {
        CRITICAL: 240, // 4 hours
        HIGH: 480, // 8 hours
        MEDIUM: 1440, // 24 hours
        LOW: 2880, // 48 hours
      };
      dueDate.setMinutes(dueDate.getMinutes() + (defaultTimes[priority] || 1440));
    }

    return { dueDate };
  }

  static async isVipUser(userId) {
    if (!userId) return false;

    try {
      const userExtended = await prisma.userExtended.findUnique({
        where: { userId },
        select: { vipLevel: true },
      });

      return userExtended?.vipLevel > 0;
    } catch (error) {
      logger.error('Error checking VIP status:', error);
      return false;
    }
  }

  static trackChanges(current, updates) {
    const changes = [];

    Object.keys(updates).forEach((field) => {
      if (current[field] !== updates[field]) {
        changes.push({
          field,
          oldValue: current[field],
          newValue: updates[field],
        });
      }
    });

    return changes;
  }

  static async handleStateTransition(currentState, newState, _ticket, _user) {
    if (!newState || currentState === newState) {
      return {};
    }

    const stateData = {
      state: newState,
    };

    // Handle specific state transitions
    switch (newState) {
      case 'RESOLVED':
        stateData.resolvedAt = new Date();
        break;
      case 'CLOSED':
        stateData.closedAt = new Date();
        break;
      case 'REOPENED':
        stateData.resolvedAt = null;
        stateData.closedAt = null;
        break;
    }

    return stateData;
  }

  static getDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '1d':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }

  // Additional helper methods would be implemented here...
}
