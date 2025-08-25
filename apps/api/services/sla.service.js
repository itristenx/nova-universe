import { prisma } from '../db/prisma.js';
import { logger } from '../logger.js';

/**
 * SLA Service - Manages Service Level Agreements and compliance
 */
export class SLAService {
  /**
   * Determine the appropriate SLA for a ticket based on priority, category, and user type
   */
  static async determineSLA(ticketData) {
    try {
      const { priority, category, subcategory, userId } = ticketData;

      // Check if user is VIP
      const isVip = await this.isVipUser(userId);

      // Find matching SLA
      const sla = await prisma.slaDefinition.findFirst({
        where: {
          isActive: true,
          OR: [
            // Exact match criteria
            {
              AND: [
                { priority: { in: [priority, null] } },
                { category: { in: [category, null] } },
                { subcategory: { in: [subcategory, null] } },
                { isVipOnly: isVip ? true : { not: true } },
              ],
            },
            // Fallback to default SLA
            {
              isDefault: true,
            },
          ],
        },
        orderBy: [{ isVipOnly: 'desc' }, { priority: 'asc' }, { isDefault: 'asc' }],
      });

      return sla;
    } catch (error) {
      logger.error('Error determining SLA:', error);
      return null;
    }
  }

  /**
   * Check if a user is VIP
   */
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

  /**
   * Calculate priority score based on priority, urgency, and impact
   */
  static calculatePriorityScore(priority, urgency, impact) {
    const scoreMap = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const priorityScore = scoreMap[priority] || 2;
    const urgencyScore = scoreMap[urgency] || 2;
    const impactScore = scoreMap[impact] || 2;

    // Weighted calculation: urgency and impact are primary factors
    return Math.round(urgencyScore * 0.4 + impactScore * 0.4 + priorityScore * 0.2);
  }

  /**
   * Check if ticket response time SLA has been breached
   */
  static async checkResponseSLA(ticket) {
    try {
      if (!ticket.sla || ticket.firstResponseAt) {
        return { breached: false };
      }

      const now = new Date();
      const responseTarget = new Date(ticket.createdAt);
      responseTarget.setMinutes(responseTarget.getMinutes() + ticket.sla.responseTime);

      const breached = now > responseTarget;

      if (breached && !ticket.responseTimeBreached) {
        // Update ticket to mark response time as breached
        await prisma.enhancedSupportTicket.update({
          where: { id: ticket.id },
          data: {
            responseTimeBreached: true,
            responseTimeBreachedAt: now,
          },
        });

        // Log SLA breach
        await this.logSLABreach(ticket.id, 'response', responseTarget, now);
      }

      return {
        breached,
        target: responseTarget,
        timeRemaining: breached ? 0 : Math.max(0, responseTarget - now),
      };
    } catch (error) {
      logger.error('Error checking response SLA:', error);
      return { breached: false };
    }
  }

  /**
   * Check if ticket resolution time SLA has been breached
   */
  static async checkResolutionSLA(ticket) {
    try {
      if (!ticket.sla || ticket.state === 'CLOSED') {
        return { breached: false };
      }

      const now = new Date();
      const resolutionTarget = new Date(ticket.createdAt);
      resolutionTarget.setMinutes(resolutionTarget.getMinutes() + ticket.sla.resolutionTime);

      const breached = now > resolutionTarget;

      if (breached && !ticket.resolutionTimeBreached) {
        // Update ticket to mark resolution time as breached
        await prisma.enhancedSupportTicket.update({
          where: { id: ticket.id },
          data: {
            resolutionTimeBreached: true,
            resolutionTimeBreachedAt: now,
          },
        });

        // Log SLA breach
        await this.logSLABreach(ticket.id, 'resolution', resolutionTarget, now);
      }

      return {
        breached,
        target: resolutionTarget,
        timeRemaining: breached ? 0 : Math.max(0, resolutionTarget - now),
      };
    } catch (error) {
      logger.error('Error checking resolution SLA:', error);
      return { breached: false };
    }
  }

  /**
   * Get SLA status for a ticket
   */
  static async getTicketSLAStatus(ticketId) {
    try {
      const ticket = await prisma.enhancedSupportTicket.findUnique({
        where: { id: ticketId },
        include: { sla: true },
      });

      if (!ticket || !ticket.sla) {
        return null;
      }

      const [responseStatus, resolutionStatus] = await Promise.all([
        this.checkResponseSLA(ticket),
        this.checkResolutionSLA(ticket),
      ]);

      return {
        sla: ticket.sla,
        response: responseStatus,
        resolution: resolutionStatus,
        overallCompliance: !responseStatus.breached && !resolutionStatus.breached,
      };
    } catch (error) {
      logger.error('Error getting SLA status:', error);
      return null;
    }
  }

  /**
   * Log SLA breach
   */
  static async logSLABreach(ticketId, breachType, targetTime, actualTime) {
    try {
      await prisma.slaBreach.create({
        data: {
          ticketId,
          breachType: breachType.toUpperCase(),
          targetTime,
          actualTime,
          breachDuration: Math.round((actualTime - targetTime) / (1000 * 60)), // in minutes
        },
      });

      logger.warn(`SLA breach logged for ticket ${ticketId}: ${breachType} time exceeded`);
    } catch (error) {
      logger.error('Error logging SLA breach:', error);
    }
  }

  /**
   * Get SLA compliance metrics
   */
  static async getSLAMetrics(filters = {}) {
    try {
      const { startDate, endDate, slaId, priority, category } = filters;

      const whereClause = {};
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
      }
      if (slaId) whereClause.slaId = slaId;
      if (priority) whereClause.priority = priority;
      if (category) whereClause.category = category;

      const [totalTickets, responseBreaches, resolutionBreaches, totalBreaches] = await Promise.all(
        [
          prisma.enhancedSupportTicket.count({ where: whereClause }),
          prisma.enhancedSupportTicket.count({
            where: { ...whereClause, responseTimeBreached: true },
          }),
          prisma.enhancedSupportTicket.count({
            where: { ...whereClause, resolutionTimeBreached: true },
          }),
          prisma.enhancedSupportTicket.count({
            where: {
              ...whereClause,
              OR: [{ responseTimeBreached: true }, { resolutionTimeBreached: true }],
            },
          }),
        ],
      );

      const responseCompliance =
        totalTickets > 0
          ? (((totalTickets - responseBreaches) / totalTickets) * 100).toFixed(2)
          : 100;

      const resolutionCompliance =
        totalTickets > 0
          ? (((totalTickets - resolutionBreaches) / totalTickets) * 100).toFixed(2)
          : 100;

      const overallCompliance =
        totalTickets > 0 ? (((totalTickets - totalBreaches) / totalTickets) * 100).toFixed(2) : 100;

      return {
        totalTickets,
        responseBreaches,
        resolutionBreaches,
        totalBreaches,
        responseCompliance: parseFloat(responseCompliance),
        resolutionCompliance: parseFloat(resolutionCompliance),
        overallCompliance: parseFloat(overallCompliance),
      };
    } catch (error) {
      logger.error('Error getting SLA metrics:', error);
      throw new Error('Failed to get SLA metrics');
    }
  }

  /**
   * Get upcoming SLA breaches (tickets at risk)
   */
  static async getUpcomingSLABreaches(hoursAhead = 24) {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() + hoursAhead);

      const atRiskTickets = await prisma.enhancedSupportTicket.findMany({
        where: {
          state: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'] },
          sla: { isNot: null },
          OR: [
            {
              AND: [{ firstResponseAt: null }, { responseTimeBreached: false }],
            },
            {
              AND: [{ resolvedAt: null }, { resolutionTimeBreached: false }],
            },
          ],
        },
        include: {
          sla: true,
          requester: { select: { id: true, name: true, email: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
      });

      const riskyTickets = [];

      for (const ticket of atRiskTickets) {
        const responseTarget = new Date(ticket.createdAt);
        responseTarget.setMinutes(responseTarget.getMinutes() + ticket.sla.responseTime);

        const resolutionTarget = new Date(ticket.createdAt);
        resolutionTarget.setMinutes(resolutionTarget.getMinutes() + ticket.sla.resolutionTime);

        const responseRisk = !ticket.firstResponseAt && responseTarget <= cutoffTime;
        const resolutionRisk = !ticket.resolvedAt && resolutionTarget <= cutoffTime;

        if (responseRisk || resolutionRisk) {
          riskyTickets.push({
            ...ticket,
            riskFactors: {
              responseRisk,
              resolutionRisk,
              responseTarget,
              resolutionTarget,
            },
          });
        }
      }

      return riskyTickets;
    } catch (error) {
      logger.error('Error getting upcoming SLA breaches:', error);
      throw new Error('Failed to get upcoming SLA breaches');
    }
  }

  /**
   * Update first response time for a ticket
   */
  static async updateFirstResponseTime(ticketId, responseTime) {
    try {
      const ticket = await prisma.enhancedSupportTicket.findUnique({
        where: { id: ticketId },
        select: {
          firstResponseAt: true,
          createdAt: true,
          responseTimeTarget: true,
        },
      });

      if (!ticket || ticket.firstResponseAt) {
        return; // Already has first response time
      }

      const responseMinutes = Math.round((responseTime - ticket.createdAt) / (1000 * 60));

      await prisma.enhancedSupportTicket.update({
        where: { id: ticketId },
        data: {
          firstResponseAt: responseTime,
          responseTime: responseMinutes,
        },
      });

      logger.info(`Updated first response time for ticket ${ticketId}: ${responseMinutes} minutes`);
    } catch (error) {
      logger.error('Error updating first response time:', error);
    }
  }

  /**
   * Calculate actual resolution time
   */
  static async calculateResolutionTime(ticketId, resolvedTime) {
    try {
      const ticket = await prisma.enhancedSupportTicket.findUnique({
        where: { id: ticketId },
        select: { createdAt: true },
      });

      if (!ticket) {
        return null;
      }

      return Math.round((resolvedTime - ticket.createdAt) / (1000 * 60)); // in minutes
    } catch (error) {
      logger.error('Error calculating resolution time:', error);
      return null;
    }
  }

  /**
   * Run SLA monitoring job (to be called by scheduler)
   */
  static async runSLAMonitoring() {
    try {
      logger.info('Starting SLA monitoring job...');

      // Get all active tickets with SLAs
      const activeTickets = await prisma.enhancedSupportTicket.findMany({
        where: {
          state: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'] },
          sla: { isNot: null },
        },
        include: { sla: true },
      });

      let responseBreaches = 0;
      let resolutionBreaches = 0;

      for (const ticket of activeTickets) {
        const [responseCheck, resolutionCheck] = await Promise.all([
          this.checkResponseSLA(ticket),
          this.checkResolutionSLA(ticket),
        ]);

        if (responseCheck.breached) responseBreaches++;
        if (resolutionCheck.breached) resolutionBreaches++;
      }

      logger.info(
        `SLA monitoring completed. Checked ${activeTickets.length} tickets. ` +
          `New breaches: ${responseBreaches} response, ${resolutionBreaches} resolution`,
      );

      return {
        ticketsChecked: activeTickets.length,
        newResponseBreaches: responseBreaches,
        newResolutionBreaches: resolutionBreaches,
      };
    } catch (error) {
      logger.error('Error in SLA monitoring job:', error);
      throw error;
    }
  }
}
