import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../db.js', () => ({
  __esModule: true,
  default: {
    userExtended: { findUnique: jest.fn() },
    slaDefinition: { findFirst: jest.fn(), create: jest.fn(), groupBy: jest.fn() },
    enhancedSupportTicket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    slaBreach: { create: jest.fn() },
  },
}));

jest.mock('../logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.unstable_mockModule('../services/sla-matrix.service.js', () => ({
  __esModule: true,
  SLAMatrixService: {
    normalizeLevel: jest.fn(),
    calculatePriority: jest.fn(),
    calculateTicketSLA: jest.fn(),
    getPriorityLabel: jest.fn(),
    validateMatrix: jest.fn(),
  },
}));

const { SLAService } = await import('../services/sla.service.js');
const { SLAMatrixService } = await import('../services/sla-matrix.service.js');
const db = (await import('../db.js')).default;

describe('Enhanced SLA Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('VIP User Detection', () => {
    test('should correctly identify VIP users', async () => {
      const mockDb = db;
      
      mockDb.userExtended.findUnique.mockResolvedValue({
        vipLevel: 2 // Gold VIP
      });

      const isVip = await SLAService.isVipUser('test-user-123');
      expect(isVip).toBe(true);
      expect(mockDb.userExtended.findUnique).toHaveBeenCalledWith({
        where: { userId: 'test-user-123' },
        select: { vipLevel: true }
      });
    });

    test('should correctly identify non-VIP users', async () => {
      const mockDb = db;
      
      mockDb.userExtended.findUnique.mockResolvedValue({
        vipLevel: 0 // Not VIP
      });

      const isVip = await SLAService.isVipUser('regular-user-456');
      expect(isVip).toBe(false);
    });

    test('should handle missing user data', async () => {
      const mockDb = db;
      
      mockDb.userExtended.findUnique.mockResolvedValue(null);

      const isVip = await SLAService.isVipUser('nonexistent-user');
      expect(isVip).toBe(false);
    });

    test('should get VIP level correctly', async () => {
      const mockDb = db;
      
      mockDb.userExtended.findUnique.mockResolvedValue({
        vipLevel: 'executive'
      });

      const vipLevel = await SLAService.getVipLevel('exec-user-789');
      expect(vipLevel).toBe('executive');
    });
  });

  describe('Business Hours Detection', () => {
    test('should correctly identify business hours', () => {
      // Mock Date to be Tuesday 10 AM
      const mockDate = new Date('2025-01-07T10:00:00Z'); // Tuesday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      jest.spyOn(mockDate, 'getHours').mockReturnValue(10);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(2); // Tuesday

      const isBusinessHours = SLAService.isBusinessHours();
      expect(isBusinessHours).toBe(true);

      global.Date.mockRestore();
    });

    test('should correctly identify non-business hours', () => {
      // Mock Date to be Saturday 10 AM
      const mockDate = new Date('2025-01-04T10:00:00Z'); // Saturday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      jest.spyOn(mockDate, 'getHours').mockReturnValue(10);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(6); // Saturday

      const isBusinessHours = SLAService.isBusinessHours();
      expect(isBusinessHours).toBe(false);

      global.Date.mockRestore();
    });

    test('should correctly identify after hours weekday', () => {
      // Mock Date to be Tuesday 8 PM
      const mockDate = new Date('2025-01-07T20:00:00Z'); // Tuesday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      jest.spyOn(mockDate, 'getHours').mockReturnValue(20);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(2); // Tuesday

      const isBusinessHours = SLAService.isBusinessHours();
      expect(isBusinessHours).toBe(false);

      global.Date.mockRestore();
    });
  });

  describe('Enhanced Priority Calculation', () => {
    test('should use matrix calculation for priority', () => {
      SLAMatrixService.normalizeLevel = jest.fn()
        .mockReturnValueOnce(1) // impact
        .mockReturnValueOnce(2); // urgency
      
      SLAMatrixService.calculatePriority = jest.fn().mockReturnValue(2);

      const result = SLAService.calculatePriorityScore('high', 'medium', 'high');
      
      expect(SLAMatrixService.normalizeLevel).toHaveBeenCalledWith('medium'); // urgency
      expect(SLAMatrixService.normalizeLevel).toHaveBeenCalledWith('high'); // impact
      // Implementation expects (impact, urgency) => ('high' => 2, 'medium' => 1)
      expect(SLAMatrixService.calculatePriority).toHaveBeenCalledWith(2, 1);
      expect(result).toBe(2);
    });
  });

  describe('Enhanced SLA Determination', () => {
    test('should determine SLA using matrix calculation', async () => {
      const mockDb = db;
      // Mock VIP detection
      mockDb.userExtended.findUnique.mockResolvedValue({ vipLevel: 0 });
      
      // Mock SLA matrix calculation
      SLAMatrixService.calculateTicketSLA = jest.fn().mockReturnValue({
        impact: 2,
        urgency: 1,
        priority: 2,
        priorityLabel: 'High',
        userType: 'standard',
        slaPolicy: {
          responseTime: 60,
          resolutionTime: 480,
          escalationTime: 120,
          escalationLevel: 'supervisor'
        }
      });

      // Mock finding existing SLA
      mockDb.slaDefinition.findFirst.mockResolvedValue({
        id: 'sla-123',
        name: 'Standard SLA - High',
        priority: 'HIGH',
        responseTime: 60,
        resolutionTime: 480
      });

      const ticketData = {
        title: 'System performance issue',
        description: 'Application running slowly',
        userId: 'user-123',
        category: 'IT',
        priority: 'HIGH'
      };

      const result = await SLAService.determineSLA(ticketData);

      expect(SLAMatrixService.calculateTicketSLA).toHaveBeenCalledWith(
        expect.objectContaining({
          ...ticketData,
          isVip: false,
          vipLevel: null,
        }),
      );

      expect(result).toHaveProperty('calculation');
      expect(result.calculation.priorityLabel).toBe('High');
    });

    test('should create new SLA definition if not found', async () => {
      const mockDb = db;
      // Mock VIP detection
      mockDb.userExtended.findUnique.mockResolvedValue({ vipLevel: 1 });
      
      // Mock SLA matrix calculation
      SLAMatrixService.calculateTicketSLA = jest.fn().mockReturnValue({
        impact: 1,
        urgency: 1,
        priority: 1,
        priorityLabel: 'Critical',
        impactLabel: 'High',
        urgencyLabel: 'High',
        userType: 'vip',
        slaPolicy: {
          responseTime: 5,
          resolutionTime: 60,
          escalationTime: 10,
          escalationLevel: 'director',
          templateName: 'VIP SLA Policy'
        }
      });

      // Mock not finding existing SLA
      mockDb.slaDefinition.findFirst.mockResolvedValue(null);
      
      // Mock creating new SLA
      mockDb.slaDefinition.create.mockResolvedValue({
        id: 'new-sla-456',
        name: 'VIP SLA Policy - Critical',
        priority: 'CRITICAL',
        responseTime: 5,
        resolutionTime: 60
      });

      const ticketData = {
        title: 'Critical VIP issue',
        description: 'VIP user cannot access system',
        userId: 'vip-user-456',
        category: 'IT'
      };

      const result = await SLAService.determineSLA(ticketData);

      expect(mockDb.slaDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'VIP SLA Policy - Critical',
          priority: 'CRITICAL',
          responseTime: 5,
          resolutionTime: 60,
          isVipOnly: true,
          isActive: true
        })
      });

      expect(result.id).toBe('new-sla-456');
    });
  });

  describe('SLA Recommendations', () => {
    test('should provide comprehensive SLA recommendations', async () => {
      const mockDb = db;
      // Mock VIP detection
      mockDb.userExtended.findUnique.mockResolvedValue({ vipLevel: 'gold' });
      
      // Mock SLA matrix calculation
      SLAMatrixService.calculateTicketSLA = jest.fn().mockReturnValue({
        impact: 2,
        urgency: 1,
        priority: 2,
        priorityLabel: 'High',
        impactLabel: 'Medium',
        urgencyLabel: 'High',
        userType: 'vip',
        slaPolicy: {
          responseTime: 15,
          resolutionTime: 120,
          escalationTime: 30,
          escalationLevel: 'manager'
        }
      });

      const ticketData = {
        title: 'VIP user email issue',
        description: 'Cannot send emails',
        userId: 'vip-user-789'
      };

      const recommendations = await SLAService.getSLARecommendations(ticketData);

      expect(recommendations).toHaveProperty('calculation');
      expect(recommendations).toHaveProperty('recommendations');
      expect(recommendations).toHaveProperty('matrix');

      expect(recommendations.recommendations.priority).toBe('High');
      expect(recommendations.recommendations.responseTime).toBe('15 minutes');
      expect(recommendations.recommendations.userType).toBe('vip');

      expect(recommendations.matrix.impactLevel).toBe(2);
      expect(recommendations.matrix.urgencyLevel).toBe(1);
      expect(recommendations.matrix.matrixKey).toBe('2,1');
    });
  });

  describe('Standard SLA Policy Creation', () => {
    test('should create standard SLA policies from templates', async () => {
      const mockDb = db;
      // Mock no existing policies
      mockDb.slaDefinition.findFirst.mockResolvedValue(null);
      
      // Mock successful creation
      mockDb.slaDefinition.create.mockResolvedValue({
        id: 'new-policy-123',
        name: 'Standard SLA Policy - Critical',
        priority: 'CRITICAL'
      });

      SLAMatrixService.DEFAULT_SLA_TEMPLATES = {
        standard: {
          name: 'Standard SLA Policy',
          description: 'Default SLA policy for regular users',
          policies: {
            1: { responseTime: 15, resolutionTime: 240, escalationTime: 30, escalationLevel: 'manager' }
          }
        }
      };

      SLAMatrixService.getPriorityLabel = jest.fn().mockReturnValue('Critical');

      const createdPolicies = await SLAService.createStandardSLAPolicies();

      expect(mockDb.slaDefinition.create).toHaveBeenCalled();
      expect(createdPolicies).toBeInstanceOf(Array);
      expect(createdPolicies.length).toBeGreaterThan(0);
    });

    test('should skip existing policies', async () => {
      const mockDb = db;
      // Mock existing policy found
      mockDb.slaDefinition.findFirst.mockResolvedValue({
        id: 'existing-policy',
        name: 'Standard SLA Policy - Critical'
      });

      SLAMatrixService.DEFAULT_SLA_TEMPLATES = {
        standard: {
          name: 'Standard SLA Policy',
          description: 'Default SLA policy for regular users',
          policies: {
            1: { responseTime: 15, resolutionTime: 240, escalationTime: 30, escalationLevel: 'manager' }
          }
        }
      };

      SLAMatrixService.getPriorityLabel = jest.fn().mockReturnValue('Critical');

      const createdPolicies = await SLAService.createStandardSLAPolicies();

      expect(mockDb.slaDefinition.create).not.toHaveBeenCalled();
      expect(createdPolicies).toEqual([]);
    });
  });

  describe('SLA Dashboard Data', () => {
    test('should provide comprehensive dashboard data', async () => {
      const mockDb = db;
      // Mock metrics
      mockDb.enhancedSupportTicket.count
        .mockResolvedValueOnce(100) // total tickets
        .mockResolvedValueOnce(5)   // response breaches
        .mockResolvedValueOnce(3)   // resolution breaches
        .mockResolvedValueOnce(7);  // total breaches

      // Mock priority distribution
      mockDb.enhancedSupportTicket.groupBy.mockResolvedValueOnce([
        { priority: 'CRITICAL', _count: 5 },
        { priority: 'HIGH', _count: 15 },
        { priority: 'MEDIUM', _count: 50 },
        { priority: 'LOW', _count: 30 }
      ]);

      // Mock SLA usage
      mockDb.enhancedSupportTicket.groupBy.mockResolvedValueOnce([
        { slaId: 'sla-1', _count: 60 },
        { slaId: 'sla-2', _count: 25 },
        { slaId: 'sla-3', _count: 15 }
      ]);

      // Mock upcoming breaches
      mockDb.enhancedSupportTicket.findMany.mockResolvedValue([]);

      const dashboardData = await SLAService.getSLADashboardData();

      expect(dashboardData).toHaveProperty('compliance');
      expect(dashboardData).toHaveProperty('upcomingBreaches');
      expect(dashboardData).toHaveProperty('priorityDistribution');
      expect(dashboardData).toHaveProperty('slaUsage');
      expect(dashboardData).toHaveProperty('dashboardGeneratedAt');

      expect(dashboardData.compliance.totalTickets).toBe(100);
      expect(dashboardData.compliance.responseCompliance).toBe(95); // (100-5)/100 * 100
      expect(dashboardData.priorityDistribution).toHaveLength(4);
    });
  });

  describe('Custom Matrix Validation', () => {
    test('should validate correct custom matrix', async () => {
      const validMatrix = {
        matrix: {
          "1,1": 1, "1,2": 2, "1,3": 3,
          "2,1": 2, "2,2": 3, "2,3": 4,
          "3,1": 3, "3,2": 4, "3,3": 4
        }
      };

      SLAMatrixService.validateMatrix = jest.fn().mockReturnValue(true);

      const result = await SLAService.updateCustomSLAMatrix(validMatrix, 'tenant-123');

      expect(SLAMatrixService.validateMatrix).toHaveBeenCalledWith(validMatrix);
      expect(result.success).toBe(true);
      expect(result.matrix).toBe(validMatrix);
    });

    test('should reject invalid custom matrix', async () => {
      const invalidMatrix = {
        matrix: { "1,1": 1 } // Missing required keys
      };

      SLAMatrixService.validateMatrix = jest.fn().mockReturnValue(false);

      await expect(SLAService.updateCustomSLAMatrix(invalidMatrix, 'tenant-123'))
        .rejects.toThrow('Invalid matrix configuration');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const mockDb = db;
      mockDb.userExtended.findUnique.mockRejectedValue(new Error('Database error'));

      const isVip = await SLAService.isVipUser('error-user');
      expect(isVip).toBe(false);
    });

    test('should handle SLA calculation errors', async () => {
      const mockDb = db;
      mockDb.userExtended.findUnique.mockResolvedValue({ vipLevel: 0 });
      SLAMatrixService.calculateTicketSLA = jest.fn().mockImplementation(() => {
        throw new Error('Calculation error');
      });

      const result = await SLAService.determineSLA({
        title: 'Error ticket',
        userId: 'user-123'
      });

      expect(result).toBeNull();
    });

    test('should handle missing ticket data', async () => {
      const mockDb = db;
      mockDb.userExtended.findUnique.mockResolvedValue(null);

      await expect(SLAService.getTicketSLACalculation({}))
        .rejects.toThrow();
    });
  });
});
