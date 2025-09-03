import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SLAMatrixService } from '../services/sla-matrix.service.js';

// Mock the logger to avoid import issues
const mockLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
};

describe('SLA Matrix Service', () => {
  describe('Priority Matrix Calculation', () => {
    test('should calculate priority correctly using default matrix', () => {
      // High Impact, High Urgency = Critical (1)
      assert.strictEqual(SLAMatrixService.calculatePriority(1, 1), 1);
      
      // High Impact, Medium Urgency = High (2)
      assert.strictEqual(SLAMatrixService.calculatePriority(1, 2), 2);
      
      // Medium Impact, High Urgency = High (2)
      assert.strictEqual(SLAMatrixService.calculatePriority(2, 1), 2);
      
      // Low Impact, Low Urgency = Low (4)
      assert.strictEqual(SLAMatrixService.calculatePriority(3, 3), 4);
    });

    test('should handle string inputs correctly', () => {
      assert.strictEqual(SLAMatrixService.calculatePriority('high', 'high'), 1);
      assert.strictEqual(SLAMatrixService.calculatePriority('medium', 'low'), 4);
      assert.strictEqual(SLAMatrixService.calculatePriority('low', 'medium'), 4);
    });

    test('should default to low priority for invalid inputs', () => {
      assert.strictEqual(SLAMatrixService.calculatePriority('invalid', 'invalid'), 4);
      assert.strictEqual(SLAMatrixService.calculatePriority(null, undefined), 4);
    });
  });

  describe('Impact Analysis', () => {
    test('should detect high impact from content keywords', () => {
      const ticketData = {
        title: 'Critical server outage',
        description: 'Production server is down affecting all users',
        affectedUsers: 150
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 1); // High impact
    });

    test('should detect medium impact from performance issues', () => {
      const ticketData = {
        title: 'Application running slow',
        description: 'Users reporting performance issues with the main application',
        affectedUsers: 50
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 2); // Medium impact
    });

    test('should default to low impact for routine requests', () => {
      const ticketData = {
        title: 'Password reset request',
        description: 'User needs password reset for email account',
        affectedUsers: 1
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 3); // Low impact
    });

    test('should consider business service criticality', () => {
      const ticketData = {
        title: 'Minor email issue',
        description: 'Single user email problem',
        affectedUsers: 1,
        businessService: { criticality: 'Critical' }
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 1); // High impact due to critical service
    });

    test('should override with explicit severity', () => {
      const ticketData = {
        title: 'Simple request',
        description: 'Basic user request',
        severity: 'critical'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 1); // High impact due to explicit severity
    });
  });

  describe('Urgency Analysis', () => {
    test('should detect high urgency from content keywords', () => {
      const ticketData = {
        title: 'Urgent: Client meeting in 1 hour',
        description: 'Need immediate assistance for important client presentation',
        isVip: false
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // High urgency
    });

    test('should boost urgency for VIP users', () => {
      const ticketData = {
        title: 'Regular request',
        description: 'Standard user request',
        isVip: true,
        vipLevel: 'executive'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // High urgency for executive
    });

    test('should consider due dates', () => {
      const now = new Date();
      const dueDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      
      const ticketData = {
        title: 'Regular task',
        description: 'Standard request',
        dueDate: dueDate.toISOString(),
        isVip: false
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // High urgency due to close deadline
    });

    test('should reduce urgency outside business hours', () => {
      const ticketData = {
        title: 'Regular request',
        description: 'Standard user request',
        businessHours: false,
        isVip: false
      };
      
      const urgency = SLAMatrixService.analyzeUrgency(ticketData);
      assert(urgency >= 2); // Should not be high urgency outside business hours
    });
  });

  describe('SLA Policy Templates', () => {
    test('should return correct standard SLA policy', () => {
      const policy = SLAMatrixService.getSLAPolicy(1, 'standard'); // Critical priority, standard user
      
      assert.strictEqual(policy.responseTime, 15); // 15 minutes
      assert.strictEqual(policy.resolutionTime, 240); // 4 hours
      assert.strictEqual(policy.escalationLevel, 'manager');
    });

    test('should return correct VIP SLA policy', () => {
      const policy = SLAMatrixService.getSLAPolicy(1, 'vip'); // Critical priority, VIP user
      
      assert.strictEqual(policy.responseTime, 5); // 5 minutes
      assert.strictEqual(policy.resolutionTime, 60); // 1 hour
      assert.strictEqual(policy.escalationLevel, 'director');
    });

    test('should return correct executive SLA policy', () => {
      const policy = SLAMatrixService.getSLAPolicy(2, 'executive'); // High priority, executive user
      
      assert.strictEqual(policy.responseTime, 5); // 5 minutes
      assert.strictEqual(policy.resolutionTime, 60); // 1 hour
      assert.strictEqual(policy.escalationLevel, 'director');
    });

    test('should default to low priority policy for invalid priority', () => {
      const policy = SLAMatrixService.getSLAPolicy(999, 'standard');
      
      assert.strictEqual(policy.responseTime, 480); // 8 hours (low priority)
      assert.strictEqual(policy.resolutionTime, 2880); // 48 hours
    });
  });

  describe('Complete Ticket SLA Calculation', () => {
    test('should calculate complete SLA for high impact, high urgency ticket', () => {
      const ticketData = {
        title: 'Critical production outage',
        description: 'All systems down, urgent fix needed',
        affectedUsers: 200,
        isVip: false,
        userId: 'test-user-123'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.impact, 1); // High impact
      assert.strictEqual(result.urgency, 1); // High urgency
      assert.strictEqual(result.priority, 1); // Critical priority
      assert.strictEqual(result.priorityLabel, 'Critical');
      assert.strictEqual(result.userType, 'standard');
      assert.strictEqual(result.slaPolicy.responseTime, 15); // 15 minutes
    });

    test('should calculate complete SLA for VIP user ticket', () => {
      const ticketData = {
        title: 'Password reset needed',
        description: 'User cannot access email',
        affectedUsers: 1,
        isVip: true,
        vipLevel: 'gold',
        userId: 'vip-user-456'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.userType, 'vip');
      assert(result.urgency <= 2); // VIP boost should improve urgency
      assert(result.slaPolicy.responseTime < 480); // Should be faster than standard low priority
    });

    test('should calculate complete SLA for executive user ticket', () => {
      const ticketData = {
        title: 'Minor issue',
        description: 'Small technical problem',
        affectedUsers: 1,
        isVip: true,
        vipLevel: 'executive',
        userId: 'exec-user-789'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.userType, 'executive');
      assert.strictEqual(result.urgency, 1); // Executive should get high urgency
      assert(result.slaPolicy.responseTime <= 30); // Executive gets fastest response
    });

    test('should include proper target times', () => {
      const ticketData = {
        title: 'Test ticket',
        description: 'Test description',
        isVip: false
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert(result.targets.response instanceof Date);
      assert(result.targets.resolution instanceof Date);
      assert(result.targets.escalation instanceof Date);
      assert(result.calculatedAt instanceof Date);
      
      // Response target should be before resolution target
      assert(result.targets.response.getTime() < result.targets.resolution.getTime());
    });
  });

  describe('Label and Utility Functions', () => {
    test('should return correct priority labels', () => {
      assert.strictEqual(SLAMatrixService.getPriorityLabel(1), 'Critical');
      assert.strictEqual(SLAMatrixService.getPriorityLabel(2), 'High');
      assert.strictEqual(SLAMatrixService.getPriorityLabel(3), 'Medium');
      assert.strictEqual(SLAMatrixService.getPriorityLabel(4), 'Low');
      assert.strictEqual(SLAMatrixService.getPriorityLabel(999), 'Low'); // Default
    });

    test('should return correct impact labels', () => {
      assert.strictEqual(SLAMatrixService.getImpactLabel(1), 'High');
      assert.strictEqual(SLAMatrixService.getImpactLabel(2), 'Medium');
      assert.strictEqual(SLAMatrixService.getImpactLabel(3), 'Low');
    });

    test('should return correct urgency labels', () => {
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(1), 'High');
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(2), 'Medium');
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(3), 'Low');
    });

    test('should normalize levels correctly', () => {
      assert.strictEqual(SLAMatrixService.normalizeLevel(1), 1);
      assert.strictEqual(SLAMatrixService.normalizeLevel('high'), 1);
      assert.strictEqual(SLAMatrixService.normalizeLevel('CRITICAL'), 1);
      assert.strictEqual(SLAMatrixService.normalizeLevel('medium'), 2);
      assert.strictEqual(SLAMatrixService.normalizeLevel('low'), 3);
      assert.strictEqual(SLAMatrixService.normalizeLevel('invalid'), 3); // Default to low
    });
  });

  describe('Matrix and Template Validation', () => {
    test('should validate correct matrix configuration', () => {
      const validMatrix = {
        matrix: {
          "1,1": 1, "1,2": 2, "1,3": 3,
          "2,1": 2, "2,2": 3, "2,3": 4,
          "3,1": 3, "3,2": 4, "3,3": 4
        }
      };
      
      assert.strictEqual(SLAMatrixService.validateMatrix(validMatrix), true);
    });

    test('should reject invalid matrix configuration', () => {
      const invalidMatrix = {
        matrix: {
          "1,1": 1, "1,2": 2 // Missing required keys
        }
      };
      
      assert.strictEqual(SLAMatrixService.validateMatrix(invalidMatrix), false);
    });

    test('should validate correct SLA template', () => {
      const validTemplate = {
        name: "Test Template",
        policies: {
          1: { responseTime: 15, resolutionTime: 240 },
          2: { responseTime: 60, resolutionTime: 480 },
          3: { responseTime: 240, resolutionTime: 1440 },
          4: { responseTime: 480, resolutionTime: 2880 }
        }
      };
      
      assert.strictEqual(SLAMatrixService.validateSLATemplate(validTemplate), true);
    });

    test('should reject invalid SLA template', () => {
      const invalidTemplate = {
        name: "Test Template",
        policies: {
          1: { responseTime: 15 } // Missing resolutionTime
        }
      };
      
      assert.strictEqual(SLAMatrixService.validateSLATemplate(invalidTemplate), false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null/undefined ticket data gracefully', () => {
      assert.doesNotThrow(() => SLAMatrixService.analyzeImpact({}));
      assert.doesNotThrow(() => SLAMatrixService.analyzeUrgency({}));
      assert.doesNotThrow(() => SLAMatrixService.calculateTicketSLA({}));
    });

    test('should handle empty strings in ticket data', () => {
      const ticketData = {
        title: '',
        description: '',
        category: '',
        isVip: false
      };
      
      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      assert.strictEqual(result.priority, 4); // Should default to low priority
    });

    test('should handle very large affected user counts', () => {
      const ticketData = {
        title: 'System issue',
        description: 'Problem affecting users',
        affectedUsers: 999999
      };
      
      const impact = SLAMatrixService.analyzeImpact(ticketData);
      assert.strictEqual(impact, 1); // Should be high impact
    });

    test('should handle future and past due dates', () => {
      const pastDate = new Date('2020-01-01T10:00:00Z');
      const futureDate = new Date('2030-01-01T10:00:00Z');
      
      const pastTicket = {
        title: 'Past due ticket',
        description: 'Test',
        dueDate: pastDate.toISOString(),
        isVip: false
      };
      
      const futureTicket = {
        title: 'Future due ticket',
        description: 'Test',
        dueDate: futureDate.toISOString(),
        isVip: false
      };
      
      // Past due should be high urgency
      assert.strictEqual(SLAMatrixService.analyzeUrgency(pastTicket), 1);
      
      // Far future should be low urgency
      assert.strictEqual(SLAMatrixService.analyzeUrgency(futureTicket), 3);
    });
  });
});