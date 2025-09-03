import { logger } from '../logger.js';

/**
 * SLA Matrix Service - Industry standard Impact vs Urgency matrix for priority calculation
 * Following ServiceNow and ITIL best practices
 */
export class SLAMatrixService {
  /**
   * Standard Impact vs Urgency matrix for priority calculation
   * Follows ServiceNow convention where lower numbers = higher priority
   */
  static DEFAULT_PRIORITY_MATRIX = {
    // Impact levels (High=1, Medium=2, Low=3)
    // Urgency levels (High=1, Medium=2, Low=3)
    // Result: Priority (Critical=1, High=2, Medium=3, Low=4)
    matrix: {
      "1,1": 1, // High Impact, High Urgency = Critical
      "1,2": 2, // High Impact, Medium Urgency = High
      "1,3": 3, // High Impact, Low Urgency = Medium
      "2,1": 2, // Medium Impact, High Urgency = High
      "2,2": 3, // Medium Impact, Medium Urgency = Medium
      "2,3": 4, // Medium Impact, Low Urgency = Low
      "3,1": 3, // Low Impact, High Urgency = Medium
      "3,2": 4, // Low Impact, Medium Urgency = Low
      "3,3": 4  // Low Impact, Low Urgency = Low
    },
    impactLevels: {
      1: "High",
      2: "Medium", 
      3: "Low"
    },
    urgencyLevels: {
      1: "High",
      2: "Medium",
      3: "Low"
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
   * Analyze ticket content to determine impact level
   */
  static analyzeImpact(ticketData) {
    try {
      const { 
        category, 
        subcategory, 
        title, 
        description, 
        affectedUsers, 
        businessService,
        severity 
      } = ticketData;

      let impactScore = 3; // Default to Low impact

      // High impact indicators
      const highImpactKeywords = [
        'outage', 'down', 'critical', 'emergency', 'production', 'server down',
        'network down', 'system crash', 'data loss', 'security breach', 'virus'
      ];
      
      // Medium impact indicators  
      const mediumImpactKeywords = [
        'slow', 'performance', 'error', 'issue', 'problem', 'malfunction',
        'not working', 'unable to', 'connection', 'timeout'
      ];

      const content = `${title} ${description}`.toLowerCase();
      
      // Check for high impact keywords
      if (highImpactKeywords.some(keyword => content.includes(keyword))) {
        impactScore = 1; // High impact
      }
      // Check for medium impact keywords
      else if (mediumImpactKeywords.some(keyword => content.includes(keyword))) {
        impactScore = 2; // Medium impact
      }

      // Adjust based on affected users
      if (affectedUsers > 100) {
        impactScore = Math.min(impactScore, 1); // High impact
      } else if (affectedUsers > 10) {
        impactScore = Math.min(impactScore, 2); // Medium impact
      }

      // Adjust based on business service criticality
      if (businessService?.criticality === 'Critical') {
        impactScore = Math.min(impactScore, 1);
      } else if (businessService?.criticality === 'High') {
        impactScore = Math.min(impactScore, 2);
      }

      // Override with explicit severity if provided
      if (severity) {
        const severityMap = {
          'critical': 1,
          'high': 1,
          'medium': 2,
          'low': 3
        };
        if (severityMap[severity.toLowerCase()]) {
          impactScore = severityMap[severity.toLowerCase()];
        }
      }

      return impactScore;
    } catch (error) {
      logger.error('Error analyzing impact:', error);
      return 3; // Default to Low impact
    }
  }

  /**
   * Analyze ticket to determine urgency level
   */
  static analyzeUrgency(ticketData) {
    try {
      const { 
        isVip, 
        vipLevel, 
        requestedBy, 
        dueDate, 
        businessHours, 
        title, 
        description,
        urgency 
      } = ticketData;

      let urgencyScore = 3; // Default to Low urgency

      // High urgency indicators
      const highUrgencyKeywords = [
        'urgent', 'asap', 'immediately', 'now', 'emergency', 'deadline',
        'meeting', 'presentation', 'demo', 'client', 'customer'
      ];

      const content = `${title} ${description}`.toLowerCase();

      // Check for high urgency keywords
      if (highUrgencyKeywords.some(keyword => content.includes(keyword))) {
        urgencyScore = 1; // High urgency
      }

      // VIP user urgency boost
      if (isVip) {
        if (vipLevel === 'executive' || vipLevel === 'exec') {
          urgencyScore = Math.min(urgencyScore, 1); // High urgency for executives
        } else if (vipLevel === 'gold') {
          urgencyScore = Math.min(urgencyScore, 2); // Medium urgency for gold VIPs
        } else {
          urgencyScore = Math.min(urgencyScore, 2); // Medium urgency for VIPs
        }
      }

      // Due date urgency
      if (dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const hoursUntilDue = (due - now) / (1000 * 60 * 60);
        
        if (hoursUntilDue <= 0) {
          urgencyScore = Math.min(urgencyScore, 1); // High urgency for overdue
        } else if (hoursUntilDue <= 4) {
          urgencyScore = Math.min(urgencyScore, 1); // High urgency
        } else if (hoursUntilDue <= 24) {
          urgencyScore = Math.min(urgencyScore, 2); // Medium urgency
        }
        // For far future dates (> 24 hours), don't boost urgency - keep default
      }

      // Business hours consideration - only reduce high urgency outside business hours
      if (businessHours === false && urgencyScore < 3) {
        urgencyScore = Math.max(urgencyScore, 2); // Don't go below medium urgency outside business hours
      }

      // Override with explicit urgency if provided
      if (urgency) {
        const urgencyMap = {
          'high': 1,
          'medium': 2,
          'low': 3
        };
        if (urgencyMap[urgency.toLowerCase()]) {
          urgencyScore = urgencyMap[urgency.toLowerCase()];
        }
      }

      return urgencyScore;
    } catch (error) {
      logger.error('Error analyzing urgency:', error);
      return 3; // Default to Low urgency
    }
  }

  /**
   * Normalize level input to numeric value
   */
  static normalizeLevel(level) {
    if (typeof level === 'number') {
      return Math.max(1, Math.min(3, level)); // Ensure 1-3 range
    }
    
    const levelMap = {
      'high': 1,
      'medium': 2,
      'low': 3,
      'critical': 1,
      '1': 1,
      '2': 2,
      '3': 3
    };
    
    return levelMap[String(level).toLowerCase()] || 3;
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
   * Calculate complete SLA policy for a ticket
   */
  static calculateTicketSLA(ticketData) {
    try {
      // Analyze impact and urgency
      const impact = this.analyzeImpact(ticketData);
      const urgency = this.analyzeUrgency(ticketData);
      
      // Calculate priority using matrix
      const priority = this.calculatePriority(impact, urgency);
      
      // Determine user type for SLA template
      let userType = 'standard';
      if (ticketData.isVip) {
        if (ticketData.vipLevel === 'executive' || ticketData.vipLevel === 'exec') {
          userType = 'executive';
        } else {
          userType = 'vip';
        }
      }
      
      // Get SLA policy
      const slaPolicy = this.getSLAPolicy(priority, userType);
      
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
        priority,
        priorityLabel: this.getPriorityLabel(priority),
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
   * Validate custom matrix configuration
   */
  static validateMatrix(matrix) {
    const requiredKeys = [
      "1,1", "1,2", "1,3",
      "2,1", "2,2", "2,3", 
      "3,1", "3,2", "3,3"
    ];
    
    for (const key of requiredKeys) {
      if (!matrix.matrix[key] || ![1, 2, 3, 4].includes(matrix.matrix[key])) {
        return false;
      }
    }
    
    return true;
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