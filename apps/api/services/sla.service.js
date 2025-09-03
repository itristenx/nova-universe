import db from '../db.js';
import { logger } from '../logger.js';
import { SLAMatrixService } from './sla-matrix.service.js';

/**
 * Enhanced SLA Service - Manages Service Level Agreements and compliance
 * Now includes industry-standard Impact vs Urgency matrix calculations
 */
export class SLAService {
  /**
   * Enhanced SLA determination using Impact vs Urgency matrix
   * Following ServiceNow and ITIL best practices
   */
  static async determineSLA(ticketData) {
    try {
      const { priority, category, subcategory, userId } = ticketData;

      // Check if user is VIP
      const isVip = await this.isVipUser(userId);
      const vipLevel = isVip ? await this.getVipLevel(userId) : null;

      // Apply category-specific SLA adjustments
      const categoryMultiplier = this.getCategorySLAMultiplier(category, subcategory);
      const priorityAdjustment = this.getPriorityAdjustment(priority);

      // Enhanced ticket data for matrix calculation
      const enhancedTicketData = {
        ...ticketData,
        isVip,
        vipLevel,
        businessHours: this.isBusinessHours(),
        categoryMultiplier,
        priorityAdjustment,
        // Include original priority for validation
        originalPriority: priority
      };

      // Calculate SLA using Impact vs Urgency matrix
      const slaCalculation = SLAMatrixService.calculateTicketSLA(enhancedTicketData);

      // Find or create matching SLA definition
      const sla = await this.findOrCreateSLADefinition(slaCalculation);

      return {
        ...sla,
        calculation: slaCalculation
      };
    } catch (error) {
      logger.error('Error determining SLA:', error);
      return null;
    }
  }

  /**
   * Find or create SLA definition based on calculation
   */
  static async findOrCreateSLADefinition(slaCalculation) {
    try {
      const { 
        priority, 
        priorityLabel, 
        userType, 
        slaPolicy,
        impact,
        urgency
      } = slaCalculation;

      // Try to find existing SLA definition
      // Use both calculated priority and priority label for enhanced matching
      let sla = await db.slaDefinition.findFirst({
        where: {
          OR: [
            // Primary match: Use calculated priority label
            {
              priority: priorityLabel.toUpperCase(),
              isVipOnly: userType !== 'standard',
              responseTime: slaPolicy.responseTime,
              resolutionTime: slaPolicy.resolutionTime,
              isActive: true
            },
            // Secondary match: Use original priority if priority label doesn't match
            {
              priority: priority.toString().toUpperCase(),
              isVipOnly: userType !== 'standard',
              isActive: true
            }
          ]
        },
        orderBy: [
          { priority: 'asc' },
          { responseTime: 'asc' }
        ]
      });

      // Create new SLA definition if not found
      if (!sla) {
        sla = await db.slaDefinition.create({
          data: {
            name: `${slaPolicy.templateName} - ${priorityLabel}`,
            description: `Auto-generated SLA for ${priorityLabel} priority ${userType} tickets (Impact: ${slaCalculation.impactLabel}, Urgency: ${slaCalculation.urgencyLabel})`,
            priority: priorityLabel.toUpperCase(),
            responseTime: slaPolicy.responseTime,
            resolutionTime: slaPolicy.resolutionTime,
            escalationTime: slaPolicy.escalationTime,
            isVipOnly: userType !== 'standard',
            isActive: true,
            isDefault: false,
            metadata: {
              impact: impact,
              urgency: urgency,
              userType: userType,
              escalationLevel: slaPolicy.escalationLevel,
              templateName: slaPolicy.templateName,
              calculationMatrix: 'impact_urgency_v1'
            }
          }
        });

        logger.info(`Created new SLA definition: ${sla.name} (ID: ${sla.id})`);
      }

      return sla;
    } catch (error) {
      logger.error('Error finding/creating SLA definition:', error);
      throw error;
    }
  }

  /**
   * Get VIP level for user
   */
  static async getVipLevel(userId) {
    if (!userId) return null;

    try {
      const userExtended = await db.userExtended.findUnique({
        where: { userId },
        select: { vipLevel: true },
      });

      return userExtended?.vipLevel;
    } catch (error) {
      logger.error('Error getting VIP level:', error);
      return null;
    }
  }

  /**
   * Check if current time is within business hours
   */
  static isBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Business hours: Monday-Friday, 8 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
  }

  /**
   * Get category-specific SLA multiplier for enhanced resolution times
   */
  static getCategorySLAMultiplier(category, subcategory) {
    // Define category-based SLA multipliers
    const categoryMultipliers = {
      'security': 0.5,      // Security issues get faster response
      'outage': 0.3,        // Outages get critical response
      'hardware': 1.2,      // Hardware might take longer
      'software': 1.0,      // Standard software issues
      'request': 1.5,       // Service requests can take longer
      'compliance': 0.7,    // Compliance issues need quick response
      'network': 0.8,       // Network issues high priority
      'access': 0.9,        // Access issues moderate priority
    };

    // Subcategory refinements
    const subcategoryAdjustments = {
      'critical': 0.5,      // Critical subcategory halves time
      'high': 0.7,         // High subcategory reduces time  
      'database': 0.8,     // Database issues need quick response
      'email': 1.1,        // Email issues slightly longer
      'printing': 1.3,     // Printing issues lower priority
      'training': 2.0,     // Training requests much longer
    };

    let multiplier = categoryMultipliers[category?.toLowerCase()] || 1.0;
    
    // Apply subcategory adjustment
    if (subcategory) {
      const subcategoryAdjustment = subcategoryAdjustments[subcategory.toLowerCase()] || 1.0;
      multiplier *= subcategoryAdjustment;
    }

    return Math.max(multiplier, 0.1); // Minimum 10% of base time
  }

  /**
   * Get priority-based adjustment factor
   */
  static getPriorityAdjustment(priority) {
    const priorityAdjustments = {
      '1': 0.25,    // P1 - Critical - 25% of base time
      '2': 0.5,     // P2 - High - 50% of base time  
      '3': 1.0,     // P3 - Medium - 100% of base time
      '4': 1.5,     // P4 - Low - 150% of base time
      'critical': 0.25,
      'high': 0.5,
      'medium': 1.0,
      'low': 1.5,
      'p1': 0.25,
      'p2': 0.5,
      'p3': 1.0,
      'p4': 1.5,
    };

    return priorityAdjustments[priority?.toString().toLowerCase()] || 1.0;
  }

  /**
   * Check if a user is VIP
   */
  static async isVipUser(userId) {
    if (!userId) return false;

    try {
      const userExtended = await db.userExtended.findUnique({
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
   * Enhanced priority calculation using Impact vs Urgency matrix
   * Replaces the basic weighted calculation with industry standard approach
   */
  static calculatePriorityScore(priority, urgency, impact) {
    // Normalize inputs for matrix calculation
    const normalizedUrgency = SLAMatrixService.normalizeLevel(urgency);
    const normalizedImpact = SLAMatrixService.normalizeLevel(impact);
    
    // Calculate priority using matrix
    const matrixPriority = SLAMatrixService.calculatePriority(normalizedImpact, normalizedUrgency);
    
    // Return the matrix result (1-4 scale)
    return matrixPriority;
  }

  /**
   * Get enhanced ticket SLA calculation
   */
  static async getTicketSLACalculation(ticketData) {
    try {
      // Check if user is VIP
      const isVip = await this.isVipUser(ticketData.userId);
      const vipLevel = isVip ? await this.getVipLevel(ticketData.userId) : null;

      // Enhanced ticket data for matrix calculation
      const enhancedTicketData = {
        ...ticketData,
        isVip,
        vipLevel,
        businessHours: this.isBusinessHours()
      };

      // Calculate SLA using Impact vs Urgency matrix
      return SLAMatrixService.calculateTicketSLA(enhancedTicketData);
    } catch (error) {
      logger.error('Error getting ticket SLA calculation:', error);
      throw error;
    }
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
        await db.enhancedSupportTicket.update({
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
        await db.enhancedSupportTicket.update({
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
      const ticket = await db.enhancedSupportTicket.findUnique({
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
      await db.slaBreach.create({
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
          db.enhancedSupportTicket.count({ where: whereClause }),
          db.enhancedSupportTicket.count({
            where: { ...whereClause, responseTimeBreached: true },
          }),
          db.enhancedSupportTicket.count({
            where: { ...whereClause, resolutionTimeBreached: true },
          }),
          db.enhancedSupportTicket.count({
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

      const atRiskTickets = await db.enhancedSupportTicket.findMany({
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
      const ticket = await db.enhancedSupportTicket.findUnique({
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

      await db.enhancedSupportTicket.update({
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
      const ticket = await db.enhancedSupportTicket.findUnique({
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
      const activeTickets = await db.enhancedSupportTicket.findMany({
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

  /**
   * Create standard SLA policies from templates
   */
  static async createStandardSLAPolicies() {
    try {
      logger.info('Creating standard SLA policies...');

      const templates = SLAMatrixService.DEFAULT_SLA_TEMPLATES;
      const createdPolicies = [];

      for (const [templateKey, template] of Object.entries(templates)) {
        for (const [priority, policy] of Object.entries(template.policies)) {
          const priorityLabel = SLAMatrixService.getPriorityLabel(parseInt(priority));
          
          // Check if policy already exists
          const existing = await db.slaDefinition.findFirst({
            where: {
              name: `${template.name} - ${priorityLabel}`,
              isActive: true
            }
          });

          if (!existing) {
            const slaPolicy = await db.slaDefinition.create({
              data: {
                name: `${template.name} - ${priorityLabel}`,
                description: `${template.description} - ${priorityLabel} priority`,
                priority: priorityLabel.toUpperCase(),
                responseTime: policy.responseTime,
                resolutionTime: policy.resolutionTime,
                escalationTime: policy.escalationTime,
                isVipOnly: templateKey !== 'standard',
                isActive: true,
                isDefault: templateKey === 'standard' && priority === '4', // Low priority standard is default
                metadata: {
                  templateKey,
                  escalationLevel: policy.escalationLevel,
                  templateName: template.name,
                  calculationMatrix: 'impact_urgency_v1'
                }
              }
            });

            createdPolicies.push(slaPolicy);
            logger.info(`Created SLA policy: ${slaPolicy.name}`);
          }
        }
      }

      logger.info(`Created ${createdPolicies.length} new SLA policies`);
      return createdPolicies;
    } catch (error) {
      logger.error('Error creating standard SLA policies:', error);
      throw error;
    }
  }

  /**
   * Get SLA policy recommendations for a ticket
   */
  static async getSLARecommendations(ticketData) {
    try {
      const slaCalculation = await this.getTicketSLACalculation(ticketData);
      
      return {
        calculation: slaCalculation,
        recommendations: {
          priority: slaCalculation.priorityLabel,
          impact: slaCalculation.impactLabel,
          urgency: slaCalculation.urgencyLabel,
          responseTime: `${slaCalculation.slaPolicy.responseTime} minutes`,
          resolutionTime: `${slaCalculation.slaPolicy.resolutionTime} minutes`,
          escalationTime: `${slaCalculation.slaPolicy.escalationTime} minutes`,
          escalationLevel: slaCalculation.slaPolicy.escalationLevel,
          userType: slaCalculation.userType
        },
        matrix: {
          impactLevel: slaCalculation.impact,
          urgencyLevel: slaCalculation.urgency,
          priorityLevel: slaCalculation.priority,
          matrixKey: `${slaCalculation.impact},${slaCalculation.urgency}`
        }
      };
    } catch (error) {
      logger.error('Error getting SLA recommendations:', error);
      throw error;
    }
  }

  /**
   * Validate and update custom SLA matrix
   */
  static async updateCustomSLAMatrix(matrixConfig, tenantId = 'default') {
    try {
      // Validate matrix configuration
      if (!SLAMatrixService.validateMatrix(matrixConfig)) {
        throw new Error('Invalid matrix configuration');
      }

      // Store custom matrix (this would typically go to a configuration table)
      // For now, we'll log it as this would require schema changes
      logger.info(`Custom SLA matrix validated for tenant ${tenantId}:`, matrixConfig);
      
      return {
        success: true,
        message: 'Custom SLA matrix configuration is valid',
        matrix: matrixConfig
      };
    } catch (error) {
      logger.error('Error updating custom SLA matrix:', error);
      throw error;
    }
  }

  /**
   * Get SLA compliance dashboard data
   */
  static async getSLADashboardData(filters = {}) {
    try {
      const metrics = await this.getSLAMetrics(filters);
      const upcomingBreaches = await this.getUpcomingSLABreaches(24);
      
      // Get priority distribution
      const priorityDistribution = await db.enhancedSupportTicket.groupBy({
        by: ['priority'],
        _count: true,
        where: {
          createdAt: {
            gte: filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      // Get SLA template usage
      const slaUsage = await db.enhancedSupportTicket.groupBy({
        by: ['slaId'],
        _count: true,
        where: {
          slaId: { not: null },
          createdAt: {
            gte: filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      return {
        compliance: metrics,
        upcomingBreaches: upcomingBreaches.length,
        priorityDistribution,
        slaUsage,
        dashboardGeneratedAt: new Date()
      };
    } catch (error) {
      logger.error('Error getting SLA dashboard data:', error);
      throw error;
    }
  }
}
