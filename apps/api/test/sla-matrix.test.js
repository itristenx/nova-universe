import { describe, test, beforeEach } from '@jest/globals';
import assert from 'node:assert';
import { SLAMatrixService } from '../services/sla-matrix.service.js';

// Enhanced mock logger with comprehensive testing support
const mockLogger = {
  info: (message, data) => {
    // Enhanced logging for test debugging and audit trails
    console.log(`[TEST-INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message, data) => {
    // Enhanced error logging for comprehensive test failure analysis
    console.error(`[TEST-ERROR] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warn: (message, data) => {
    // Enhanced warning logging for test validation issues
    console.warn(`[TEST-WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  debug: (message, data) => {
    // Enhanced debug logging for detailed test analysis
    console.debug(`[TEST-DEBUG] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

describe('SLA Matrix Service', () => {
  
  // Enhanced test setup with comprehensive initialization
  beforeEach(() => {
    // Comprehensive test environment setup with enhanced logging
    mockLogger.info('Setting up SLA Matrix Service test environment', {
      testSuite: 'SLA-Matrix-Service',
      timestamp: new Date().toISOString(),
      environment: 'test',
      initializationPhase: 'beforeEach-setup'
    });
    
    // Reset any global state or configurations
    process.env.NODE_ENV = 'test';
    
    // Enhanced test data preparation
    const testContext = {
      defaultMatrix: SLAMatrixService.getDefaultMatrix?.() || 'not-available',
      supportedImpactLevels: ['critical', 'high', 'medium', 'low'],
      supportedUrgencyLevels: ['critical', 'high', 'medium', 'low'],
      expectedPriorityRange: [1, 2, 3, 4]
    };
    
    mockLogger.info('Test environment initialized successfully', {
      context: testContext,
      readiness: 'ready',
      timestamp: new Date().toISOString()
    });
  });
  
  describe('Priority Matrix Calculation', () => {
    test('should calculate priority correctly using default matrix', () => {
      mockLogger.info('Starting priority matrix calculation test', {
        testType: 'priority-calculation',
        matrixType: 'default',
        testCases: 4
      });
      
      // Critical Impact, Critical Urgency = Critical (1)
      const result1 = SLAMatrixService.calculatePriority(1, 1);
      assert.strictEqual(result1, 1);
      mockLogger.debug('Priority calculation verified', { impact: 1, urgency: 1, result: result1, expected: 1 });
      
      // Critical Impact, High Urgency = Critical (1)
      const result2 = SLAMatrixService.calculatePriority(1, 2);
      assert.strictEqual(result2, 1);
      mockLogger.debug('Priority calculation verified', { impact: 1, urgency: 2, result: result2, expected: 1 });
      
      // High Impact, Critical Urgency = Critical (1)
      const result3 = SLAMatrixService.calculatePriority(2, 1);
      assert.strictEqual(result3, 1);
      mockLogger.debug('Priority calculation verified', { impact: 2, urgency: 1, result: result3, expected: 1 });
      
      // Low Impact, Low Urgency = Low (4)
      const result4 = SLAMatrixService.calculatePriority(4, 4);
      assert.strictEqual(result4, 4);
      mockLogger.debug('Priority calculation verified', { impact: 4, urgency: 4, result: result4, expected: 4 });
      
      mockLogger.info('Priority matrix calculation test completed successfully', {
        testsPassed: 4,
        totalAssertions: 4,
        status: 'success'
      });
    });

    test('should handle string inputs correctly', () => {
      mockLogger.info('Starting string input handling test', {
        testType: 'string-input-validation',
        inputTypes: ['string-critical', 'string-medium', 'string-low']
      });
      
      const result1 = SLAMatrixService.calculatePriority('critical', 'critical');
      assert.strictEqual(result1, 1);
      mockLogger.debug('String input verified', { impact: 'critical', urgency: 'critical', result: result1, expected: 1 });
      
      const result2 = SLAMatrixService.calculatePriority('medium', 'low');
      assert.strictEqual(result2, 4);
      mockLogger.debug('String input verified', { impact: 'medium', urgency: 'low', result: result2, expected: 4 });
      
      const result3 = SLAMatrixService.calculatePriority('low', 'medium');
      assert.strictEqual(result3, 4);
      mockLogger.debug('String input verified', { impact: 'low', urgency: 'medium', result: result3, expected: 4 });
      
      mockLogger.info('String input handling test completed successfully', {
        testsPassed: 3,
        stringConversionSupported: true,
        status: 'success'
      });
    });

    test('should default to low priority for invalid inputs', () => {
      mockLogger.info('Starting invalid input handling test', {
        testType: 'invalid-input-validation',
        errorHandling: 'graceful-degradation'
      });
      
      const result1 = SLAMatrixService.calculatePriority('invalid', 'invalid');
      assert.strictEqual(result1, 4);
      mockLogger.debug('Invalid input handled gracefully', { impact: 'invalid', urgency: 'invalid', result: result1, expected: 4 });
      
      const result2 = SLAMatrixService.calculatePriority(null, undefined);
      assert.strictEqual(result2, 4);
      mockLogger.debug('Null/undefined input handled gracefully', { impact: null, urgency: undefined, result: result2, expected: 4 });
      
      mockLogger.info('Invalid input handling test completed successfully', {
        testsPassed: 2,
        errorHandling: 'verified',
        defaultBehavior: 'low-priority-fallback',
        status: 'success'
      });
    });
  });

  describe('Impact Analysis', () => {
    test('should use direct impact input when provided', () => {
      const ticketData = {
        title: 'Test ticket',
        description: 'Test description',
        impact: 2 // Direct high impact input
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 2); // High impact
    });

    test('should detect critical impact from content keywords', () => {
      const ticketData = {
        title: 'Critical: Complete system crash',
        description: 'Production emergency with data loss affecting all users'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 1); // Critical impact
    });

    test('should detect high impact from content keywords', () => {
      const ticketData = {
        title: 'Major server outage',
        description: 'Production server is down affecting all users'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 2); // High impact
    });

    test('should detect medium impact from performance issues', () => {
      const ticketData = {
        title: 'Application running slow',
        description: 'Users reporting performance issues with the main application'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 3); // Medium impact
    });

    test('should default to low impact for routine requests', () => {
      const ticketData = {
        title: 'Password reset request',
        description: 'User needs password reset for email account'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 4); // Low impact
    });

    test('should consider business service criticality', () => {
      const ticketData = {
        title: 'Minor email issue',
        description: 'Single user email problem',
        businessService: { criticality: 'Critical' }
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 1); // Critical impact due to critical service
    });

    test('should override with explicit severity', () => {
      const ticketData = {
        title: 'Simple request',
        description: 'Basic user request',
        severity: 'critical'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeImpact(ticketData), 1); // Critical impact due to explicit severity
    });
  });

  describe('Urgency Analysis', () => {
    test('should use direct urgency input when provided', () => {
      const ticketData = {
        title: 'Test ticket',
        description: 'Test description',
        urgency: 1 // Direct critical urgency input
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // Critical urgency
    });

    test('should detect critical urgency from content keywords', () => {
      const ticketData = {
        title: 'Emergency: Client meeting in 30 minutes',
        description: 'Need immediate assistance for critical client presentation',
        isVip: false
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // Critical urgency
    });

    test('should detect high urgency from content keywords', () => {
      const ticketData = {
        title: 'Urgent: Client presentation tomorrow',
        description: 'Need assistance for important client presentation',
        isVip: false
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 2); // High urgency
    });

    test('should boost urgency for VIP users', () => {
      const ticketData = {
        title: 'Regular request',
        description: 'Standard user request',
        isVip: true,
        vipLevel: 'executive'
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // Critical urgency for executive
    });

    test('should consider due dates', () => {
      const now = new Date();
      const dueDate = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
      
      const ticketData = {
        title: 'Regular task',
        description: 'Standard request',
        dueDate: dueDate.toISOString(),
        isVip: false
      };
      
      assert.strictEqual(SLAMatrixService.analyzeUrgency(ticketData), 1); // Critical urgency due to close deadline
    });

    test('should reduce urgency outside business hours', () => {
      const ticketData = {
        title: 'Regular request',
        description: 'Standard user request',
        businessHours: false,
        isVip: false
      };
      
      const urgency = SLAMatrixService.analyzeUrgency(ticketData);
      assert(urgency >= 3); // Should not be high urgency outside business hours
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
    test('should calculate complete SLA for critical impact, critical urgency ticket', () => {
      const ticketData = {
        title: 'Critical production outage',
        description: 'All systems down, urgent fix needed',
        impact: 1, // Critical impact (direct input)
        urgency: 1, // Critical urgency (direct input)
        isVip: false,
        userId: 'test-user-123'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.impact, 1); // Critical impact
      assert.strictEqual(result.urgency, 1); // Critical urgency
      assert.strictEqual(result.priority, 1); // Critical priority
      assert.strictEqual(result.priorityLabel, 'Critical');
      assert.strictEqual(result.userType, 'standard');
      assert.strictEqual(result.slaPolicy.responseTime, 15); // 15 minutes
    });

    test('should calculate complete SLA for VIP user ticket', () => {
      const ticketData = {
        title: 'Password reset needed',
        description: 'User cannot access email',
        impact: 4, // Low impact (direct input)
        urgency: 3, // Medium urgency (direct input)
        isVip: true,
        vipLevel: 'gold',
        userId: 'vip-user-456'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.userType, 'vip');
      assert.strictEqual(result.impact, 4); // Low impact
      assert.strictEqual(result.urgency, 3); // Medium urgency
      assert(result.slaPolicy.responseTime < 480); // Should be faster than standard low priority
    });

    test('should calculate complete SLA for executive user ticket', () => {
      const ticketData = {
        title: 'Minor issue',
        description: 'Small technical problem',
        impact: 4, // Low impact (direct input)
        urgency: 4, // Low urgency (direct input)
        isVip: true,
        vipLevel: 'executive',
        userId: 'exec-user-789'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.userType, 'executive');
      assert.strictEqual(result.impact, 4); // Low impact
      assert.strictEqual(result.urgency, 4); // Low urgency
      // VIP boost should improve the final priority
      assert(result.priority < 4); // Priority should be boosted from Low (4)
      assert(result.slaPolicy.responseTime <= 30); // Executive gets fastest response
    });

    test('should include proper target times', () => {
      const ticketData = {
        title: 'Test ticket',
        description: 'Test description',
        impact: 3, // Medium impact (direct input)
        urgency: 3, // Medium urgency (direct input)
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
      assert.strictEqual(SLAMatrixService.getImpactLabel(1), 'Critical');
      assert.strictEqual(SLAMatrixService.getImpactLabel(2), 'High');
      assert.strictEqual(SLAMatrixService.getImpactLabel(3), 'Medium');
      assert.strictEqual(SLAMatrixService.getImpactLabel(4), 'Low');
    });

    test('should return correct urgency labels', () => {
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(1), 'Critical');
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(2), 'High');
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(3), 'Medium');
      assert.strictEqual(SLAMatrixService.getUrgencyLabel(4), 'Low');
    });

    test('should normalize levels correctly', () => {
      assert.strictEqual(SLAMatrixService.normalizeLevel(1), 1);
      assert.strictEqual(SLAMatrixService.normalizeLevel('critical'), 1);
      assert.strictEqual(SLAMatrixService.normalizeLevel('CRITICAL'), 1);
      assert.strictEqual(SLAMatrixService.normalizeLevel('high'), 2);
      assert.strictEqual(SLAMatrixService.normalizeLevel('medium'), 3);
      assert.strictEqual(SLAMatrixService.normalizeLevel('low'), 4);
      assert.strictEqual(SLAMatrixService.normalizeLevel('invalid'), 4); // Default to low
    });
  });

  describe('Matrix and Template Validation', () => {
    test('should validate correct matrix configuration', () => {
      const validMatrix = {
        matrix: {
          "1,1": 1, "1,2": 1, "1,3": 2, "1,4": 2,
          "2,1": 1, "2,2": 2, "2,3": 2, "2,4": 3,
          "3,1": 2, "3,2": 2, "3,3": 3, "3,4": 4,
          "4,1": 2, "4,2": 3, "4,3": 4, "4,4": 4
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
        impact: 4, // Low impact (direct input)
        urgency: 4, // Low urgency (direct input)
        isVip: false
      };
      
      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      assert.strictEqual(result.priority, 4); // Should default to low priority
    });

    test('should handle missing impact/urgency by using content analysis', () => {
      const ticketData = {
        title: 'System issue',
        description: 'Problem affecting users'
        // No direct impact/urgency provided - should analyze from content
      };
      
      const impact = SLAMatrixService.analyzeImpact(ticketData);
      assert(impact >= 1 && impact <= 4); // Should return valid impact level
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
      
      // Past due should be critical urgency
      assert.strictEqual(SLAMatrixService.analyzeUrgency(pastTicket), 1);
      
      // Far future should be low urgency
      assert.strictEqual(SLAMatrixService.analyzeUrgency(futureTicket), 4);
    });
  });
});
