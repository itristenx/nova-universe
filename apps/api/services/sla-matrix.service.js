import { logger } from '../logger.js';

/**
 * SLA Matrix Service - Industry standard Impact vs Urgency matrix for priority calculation
 * Following ServiceNow and ITIL best practices
 */
export class SLAMatrixService {
  /**
   * Standard Impact vs Urgency matrix for priority calculation
   * Follows ServiceNow convention where lower numbers = higher priority
   * Updated to support 1-4 scale for both impact and urgency as requested
   */
  static DEFAULT_PRIORITY_MATRIX = {
    // Impact levels (Critical=1, High=2, Medium=3, Low=4)
    // Urgency levels (Critical=1, High=2, Medium=3, Low=4)
    // Result: Priority (Critical=1, High=2, Medium=3, Low=4)
    matrix: {
      "1,1": 1, // Critical Impact, Critical Urgency = Critical
      "1,2": 1, // Critical Impact, High Urgency = Critical
      "1,3": 2, // Critical Impact, Medium Urgency = High
      "1,4": 2, // Critical Impact, Low Urgency = High
      "2,1": 1, // High Impact, Critical Urgency = Critical
      "2,2": 2, // High Impact, High Urgency = High
      "2,3": 2, // High Impact, Medium Urgency = High
      "2,4": 3, // High Impact, Low Urgency = Medium
      "3,1": 2, // Medium Impact, Critical Urgency = High
      "3,2": 2, // Medium Impact, High Urgency = High
      "3,3": 3, // Medium Impact, Medium Urgency = Medium
      "3,4": 4, // Medium Impact, Low Urgency = Low
      "4,1": 2, // Low Impact, Critical Urgency = High
      "4,2": 3, // Low Impact, High Urgency = Medium
      "4,3": 4, // Low Impact, Medium Urgency = Low
      "4,4": 4  // Low Impact, Low Urgency = Low
    },
    impactLevels: {
      1: "Critical",
      2: "High",
      3: "Medium", 
      4: "Low"
    },
    urgencyLevels: {
      1: "Critical",
      2: "High",
      3: "Medium",
      4: "Low"
    },
    priorityLevels: {
      1: "Critical",
      2: "High",
      3: "Medium",
      4: "Low"
    }
  };

  /**
   * Standard SLA policy templates based on priority
   * Times in minutes
   */
  static DEFAULT_SLA_TEMPLATES = {
    standard: {
      name: "Standard SLA Policy",
      description: "Default SLA policy for regular users",
      policies: {
        1: { // Critical
          responseTime: 15,    // 15 minutes
          resolutionTime: 240, // 4 hours
          escalationTime: 30,  // 30 minutes
          escalationLevel: "manager"
        },
        2: { // High
          responseTime: 60,    // 1 hour
          resolutionTime: 480, // 8 hours
          escalationTime: 120, // 2 hours
          escalationLevel: "supervisor"
        },
        3: { // Medium
          responseTime: 240,   // 4 hours
          resolutionTime: 1440, // 24 hours
          escalationTime: 480, // 8 hours
          escalationLevel: "team_lead"
        },
        4: { // Low
          responseTime: 480,   // 8 hours
          resolutionTime: 2880, // 48 hours
          escalationTime: 1440, // 24 hours
          escalationLevel: "queue"
        }
      }
    },
    vip: {
      name: "VIP SLA Policy",
      description: "Enhanced SLA policy for VIP users",
      policies: {
        1: { // Critical
          responseTime: 5,     // 5 minutes
          resolutionTime: 60,  // 1 hour
          escalationTime: 10,  // 10 minutes
          escalationLevel: "director"
        },
        2: { // High
          responseTime: 15,    // 15 minutes
          resolutionTime: 120, // 2 hours
          escalationTime: 30,  // 30 minutes
          escalationLevel: "manager"
        },
        3: { // Medium
          responseTime: 60,    // 1 hour
          resolutionTime: 240, // 4 hours
          escalationTime: 120, // 2 hours
          escalationLevel: "supervisor"
        },
        4: { // Low
          responseTime: 120,   // 2 hours
          resolutionTime: 480, // 8 hours
          escalationTime: 240, // 4 hours
          escalationLevel: "team_lead"
        }
      }
    },
    executive: {
      name: "Executive VIP SLA Policy",
      description: "Premium SLA policy for executive VIP users",
      policies: {
        1: { // Critical
          responseTime: 2,     // 2 minutes
          resolutionTime: 30,  // 30 minutes
          escalationTime: 5,   // 5 minutes
          escalationLevel: "c_level"
        },
        2: { // High
          responseTime: 5,     // 5 minutes
          resolutionTime: 60,  // 1 hour
          escalationTime: 10,  // 10 minutes
          escalationLevel: "director"
        },
        3: { // Medium
          responseTime: 15,    // 15 minutes
          resolutionTime: 120, // 2 hours
          escalationTime: 30,  // 30 minutes
          escalationLevel: "manager"
        },
        4: { // Low
          responseTime: 30,    // 30 minutes
          resolutionTime: 240, // 4 hours
          escalationTime: 60,  // 1 hour
          escalationLevel: "supervisor"
        }
      }
    }
  };

  /**
   * Calculate priority using Impact vs Urgency matrix
   */
  static calculatePriority(impact, urgency, customMatrix = null) {
    try {
      const matrix = customMatrix || this.DEFAULT_PRIORITY_MATRIX;
      
      // Normalize impact and urgency to numeric values
      const impactLevel = this.normalizeLevel(impact);
      const urgencyLevel = this.normalizeLevel(urgency);
      
      const key = `${impactLevel},${urgencyLevel}`;
      const priority = matrix.matrix[key];
      
      if (!priority) {
        logger.warn(`Invalid impact/urgency combination: ${impact}/${urgency}, defaulting to Low priority`);
        return 4; // Default to Low priority
      }
      
      return priority;
    } catch (error) {
      logger.error('Error calculating priority:', error);
      return 4; // Default to Low priority on error
    }
  }

  /**
   * Get SLA policy for given priority and user type
   */
  static getSLAPolicy(priority, userType = 'standard', customTemplate = null) {
    try {
      const template = customTemplate || this.DEFAULT_SLA_TEMPLATES[userType] || this.DEFAULT_SLA_TEMPLATES.standard;
      
      const policy = template.policies[priority];
      if (!policy) {
        logger.warn(`No SLA policy found for priority ${priority} and user type ${userType}`);
        return template.policies[4]; // Default to Low priority policy
      }
      
      return {
        ...policy,
        templateName: template.name,
        templateDescription: template.description,
        priority,
        userType
      };
    } catch (error) {
      logger.error('Error getting SLA policy:', error);
      return this.DEFAULT_SLA_TEMPLATES.standard.policies[4];
    }
  }

  /**
   * Determine impact level from ticket data
   * Users can provide direct impact level (1-4) or let the system analyze content
   */
  static analyzeImpact(ticketData) {
    try {
      const { 
        impact, // Direct impact input (1-4 scale)
        category, 
        subcategory, 
        title, 
        description, 
        businessService,
        severity 
      } = ticketData;

      // If direct impact is provided, use it (normalized to 1-4)
      if (impact !== undefined && impact !== null) {
        return this.normalizeLevel(impact);
      }

      let impactScore = 4; // Default to Low impact

      // High impact indicators
      const criticalImpactKeywords = [
        'critical', 'emergency', 'production down', 'system crash', 'data loss', 
        'security breach', 'virus', 'complete outage', 'total failure'
      ];
      
      const highImpactKeywords = [
        'outage', 'down', 'server down', 'network down', 'service unavailable',
        'major', 'significant', 'widespread'
      ];
      
      // Medium impact indicators  
      const mediumImpactKeywords = [
        'slow', 'performance', 'error', 'issue', 'problem', 'malfunction',
        'not working', 'unable to', 'connection', 'timeout', 'intermittent'
      ];

      const content = `${title} ${description}`.toLowerCase();
      
      // Check for critical impact keywords
      if (criticalImpactKeywords.some(keyword => content.includes(keyword))) {
        impactScore = 1; // Critical impact
      }
      // Check for high impact keywords
      else if (highImpactKeywords.some(keyword => content.includes(keyword))) {
        impactScore = 2; // High impact
      }
      // Check for medium impact keywords
      else if (mediumImpactKeywords.some(keyword => content.includes(keyword))) {
        impactScore = 3; // Medium impact
      }

      // Adjust based on business service criticality
      if (businessService?.criticality === 'Critical') {
        impactScore = Math.min(impactScore, 1);
      } else if (businessService?.criticality === 'High') {
        impactScore = Math.min(impactScore, 2);
      } else if (businessService?.criticality === 'Medium') {
        impactScore = Math.min(impactScore, 3);
      }

      // Override with explicit severity if provided
      if (severity) {
        const severityMap = {
          'critical': 1,
          'high': 2,
          'medium': 3,
          'low': 4
        };
        if (severityMap[severity.toLowerCase()]) {
          impactScore = severityMap[severity.toLowerCase()];
        }
      }

      return impactScore;
    } catch (error) {
      logger.error('Error analyzing impact:', error);
      return 4; // Default to Low impact
    }
  }

  /**
   * Determine urgency level from ticket data
   * Users can provide direct urgency level (1-4) or let the system analyze content
   */
  static analyzeUrgency(ticketData) {
    try {
      const { 
        urgency, // Direct urgency input (1-4 scale)
        isVip, 
        vipLevel, 
        requestedBy, 
        dueDate, 
        businessHours, 
        title, 
        description
      } = ticketData;

      // If direct urgency is provided, use it (normalized to 1-4)
      if (urgency !== undefined && urgency !== null) {
        return this.normalizeLevel(urgency);
      }

      let urgencyScore = 4; // Default to Low urgency

      // Critical urgency indicators
      const criticalUrgencyKeywords = [
        'emergency', 'immediate', 'now', 'critical', 'asap',
        'deadline today', 'meeting in', 'presentation now'
      ];

      // High urgency indicators
      const highUrgencyKeywords = [
        'urgent', 'deadline', 'meeting', 'presentation', 'demo', 'client', 
        'customer', 'important', 'priority', 'soon'
      ];

      const content = `${title} ${description}`.toLowerCase();

      // Check for critical urgency keywords
      if (criticalUrgencyKeywords.some(keyword => content.includes(keyword))) {
        urgencyScore = 1; // Critical urgency
      }
      // Check for high urgency keywords
      else if (highUrgencyKeywords.some(keyword => content.includes(keyword))) {
        urgencyScore = 2; // High urgency
      }

      // VIP user urgency boost
      if (isVip) {
        if (vipLevel === 'executive' || vipLevel === 'exec') {
          urgencyScore = Math.min(urgencyScore, 1); // Critical urgency for executives
        } else if (vipLevel === 'gold') {
          urgencyScore = Math.min(urgencyScore, 2); // High urgency for gold VIPs
        } else {
          urgencyScore = Math.min(urgencyScore, 2); // High urgency for VIPs
        }
      }

      // Due date urgency
      if (dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const hoursUntilDue = (due - now) / (1000 * 60 * 60);
        
        if (hoursUntilDue <= 0) {
          urgencyScore = Math.min(urgencyScore, 1); // Critical urgency for overdue
        } else if (hoursUntilDue <= 2) {
          urgencyScore = Math.min(urgencyScore, 1); // Critical urgency
        } else if (hoursUntilDue <= 8) {
          urgencyScore = Math.min(urgencyScore, 2); // High urgency
        } else if (hoursUntilDue <= 24) {
          urgencyScore = Math.min(urgencyScore, 3); // Medium urgency
        }
        // For far future dates (> 24 hours), don't boost urgency - keep default
      }

      // Business hours consideration - only reduce high urgency outside business hours
      if (businessHours === false && urgencyScore < 3) {
        urgencyScore = Math.max(urgencyScore, 3); // Don't go below medium urgency outside business hours
      }

      return urgencyScore;
    } catch (error) {
      logger.error('Error analyzing urgency:', error);
      return 4; // Default to Low urgency
    }
  }

  /**
   * Normalize level input to numeric value (1-4 scale)
   */
  static normalizeLevel(level) {
    if (typeof level === 'number') {
      return Math.max(1, Math.min(4, level)); // Ensure 1-4 range
    }
    
    const levelMap = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4,
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4
    };
    
    return levelMap[String(level).toLowerCase()] || 4;
  }

  /**
   * Get priority label from numeric value
   */
  static getPriorityLabel(priority) {
    return this.DEFAULT_PRIORITY_MATRIX.priorityLevels[priority] || 'Low';
  }

  /**
   * Get impact label from numeric value
   */
  static getImpactLabel(impact) {
    return this.DEFAULT_PRIORITY_MATRIX.impactLevels[impact] || 'Low';
  }

  /**
   * Get urgency label from numeric value
   */
  static getUrgencyLabel(urgency) {
    return this.DEFAULT_PRIORITY_MATRIX.urgencyLevels[urgency] || 'Low';
  }

  /**
   * Apply VIP priority boost - VIP users get priority level increased by 1
   * This follows the requirement that "a VIP might bump up the priority +1"
   */
  static applyVipPriorityBoost(basePriority, isVip, vipLevel) {
    if (!isVip) {
      return {
        finalPriority: basePriority,
        boosted: false,
        boostReason: null
      };
    }

    // VIP priority boost: lower number = higher priority (1=Critical, 2=High, 3=Medium, 4=Low)
    let boostedPriority = basePriority;
    let boostReason = 'VIP Status';

    // Apply different boost levels based on VIP tier
    if (vipLevel === 'executive' || vipLevel === 'exec') {
      // Executive VIPs get +2 priority boost (but minimum Critical = 1)
      boostedPriority = Math.max(1, basePriority - 2);
      boostReason = 'Executive VIP Status (+2 levels)';
    } else if (vipLevel === 'gold') {
      // Gold VIPs get +1 priority boost
      boostedPriority = Math.max(1, basePriority - 1);
      boostReason = 'Gold VIP Status (+1 level)';
    } else {
      // Regular VIPs get +1 priority boost
      boostedPriority = Math.max(1, basePriority - 1);
      boostReason = 'VIP Status (+1 level)';
    }

    return {
      finalPriority: boostedPriority,
      boosted: boostedPriority !== basePriority,
      boostReason: boostedPriority !== basePriority ? boostReason : null,
      originalPriority: basePriority
    };
  }

  /**
   * Calculate complete SLA policy for a ticket
   */
  static calculateTicketSLA(ticketData) {
    try {
      // Analyze impact and urgency
      const impact = this.analyzeImpact(ticketData);
      const urgency = this.analyzeUrgency(ticketData);
      
      // Calculate base priority using matrix
      const basePriority = this.calculatePriority(impact, urgency);
      
      // Apply VIP priority boost
      const vipBoost = this.applyVipPriorityBoost(basePriority, ticketData.isVip, ticketData.vipLevel);
      const finalPriority = vipBoost.finalPriority;
      
      // Determine user type for SLA template
      let userType = 'standard';
      if (ticketData.isVip) {
        if (ticketData.vipLevel === 'executive' || ticketData.vipLevel === 'exec') {
          userType = 'executive';
        } else {
          userType = 'vip';
        }
      }
      
      // Get SLA policy using the final (boosted) priority
      const slaPolicy = this.getSLAPolicy(finalPriority, userType);
      
      // Calculate target times
      const now = new Date();
      const responseTarget = new Date(now.getTime() + slaPolicy.responseTime * 60000);
      const resolutionTarget = new Date(now.getTime() + slaPolicy.resolutionTime * 60000);
      const escalationTarget = new Date(now.getTime() + slaPolicy.escalationTime * 60000);
      
      return {
        impact,
        impactLabel: this.getImpactLabel(impact),
        urgency,
        urgencyLabel: this.getUrgencyLabel(urgency),
        basePriority,
        basePriorityLabel: this.getPriorityLabel(basePriority),
        priority: finalPriority,
        priorityLabel: this.getPriorityLabel(finalPriority),
        vipBoost,
        userType,
        slaPolicy,
        targets: {
          response: responseTarget,
          resolution: resolutionTarget,
          escalation: escalationTarget
        },
        calculatedAt: now
      };
    } catch (error) {
      logger.error('Error calculating ticket SLA:', error);
      throw new Error(`Failed to calculate SLA: ${error.message}`);
    }
  }

  /**
   * Get VIP identification information for agents/users
   * This allows agents to easily identify VIP users and their priority levels
   */
  static getVipIdentification(ticketData) {
    const { isVip, vipLevel, userId, requestedBy } = ticketData;
    
    if (!isVip) {
      return {
        isVip: false,
        identification: {
          badge: null,
          level: null,
          description: 'Standard User',
          priority: 'normal',
          icon: '👤',
          color: 'gray'
        }
      };
    }

    // VIP identification configuration
    const vipIdentificationMap = {
      'executive': {
        badge: 'EXEC VIP',
        level: 'Executive',
        description: 'Executive VIP - Immediate escalation required',
        priority: 'critical',
        icon: '👑',
        color: 'purple',
        slaHighlight: 'Executive SLA (2-30min response)'
      },
      'exec': {
        badge: 'EXEC VIP',
        level: 'Executive', 
        description: 'Executive VIP - Immediate escalation required',
        priority: 'critical',
        icon: '👑',
        color: 'purple',
        slaHighlight: 'Executive SLA (2-30min response)'
      },
      'gold': {
        badge: 'GOLD VIP',
        level: 'Gold',
        description: 'Gold VIP - Enhanced support with dedicated agent',
        priority: 'high',
        icon: '⭐',
        color: 'yellow',
        slaHighlight: 'VIP SLA (5min-2hr response)'
      },
      'priority': {
        badge: 'VIP',
        level: 'Priority',
        description: 'VIP User - Priority support',
        priority: 'elevated',
        icon: '🌟',
        color: 'blue',
        slaHighlight: 'VIP SLA (5min-2hr response)'
      }
    };

    const identification = vipIdentificationMap[vipLevel] || vipIdentificationMap['priority'];

    return {
      isVip: true,
      vipLevel,
      userId,
      requestedBy,
      identification: {
        ...identification,
        userId,
        assignedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Validate custom matrix configuration
   */
  static validateMatrix(matrix) {
    const requiredKeys = [
      "1,1", "1,2", "1,3", "1,4",
      "2,1", "2,2", "2,3", "2,4",
      "3,1", "3,2", "3,3", "3,4",
      "4,1", "4,2", "4,3", "4,4"
    ];
    
    for (const key of requiredKeys) {
      if (!matrix.matrix[key] || ![1, 2, 3, 4].includes(matrix.matrix[key])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get visual representation of the priority matrix for display
   */
  static getMatrixDisplay() {
    return {
      title: '📊 IMPACT vs URGENCY PRIORITY MATRIX (1-4 Scale)',
      separator: '-'.repeat(50),
      header: 'Impact/Urgency │ Crit │ High │ Med  │ Low  ',
      divider: '───────────────┼──────┼──────┼──────┼──────',
      rows: [
        'Critical       │ Crit │ Crit │ High │ High ',
        'High           │ Crit │ High │ High │ Med  ',
        'Medium         │ High │ High │ Med  │ Low  ',
        'Low            │ High │ Med  │ Low  │ Low  '
      ]
    };
  }

  /**
   * Validate custom SLA template
   */
  static validateSLATemplate(template) {
    if (!template.name || !template.policies) {
      return false;
    }
    
    for (const priority of [1, 2, 3, 4]) {
      const policy = template.policies[priority];
      if (!policy || !policy.responseTime || !policy.resolutionTime) {
        return false;
      }
    }
    
    return true;
  }
}