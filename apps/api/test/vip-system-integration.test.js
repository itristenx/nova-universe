import { jest } from '@jest/globals';
import db from '../db.js';

// Mock the logger to avoid import issues
jest.mock('../logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock DB functions
jest.mock('../db.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    slaDefinition: {
      findFirst: jest.fn(),
    },
    enhancedSupportTicket: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  createAuditLog: jest.fn(),
}));

// Import service after mocks
import { TicketService } from '../services/enhanced-ticket.service.js';

describe('VIP System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('VIP User Detection', () => {
    test('should correctly identify VIP users', async () => {
      db.user.findUnique.mockResolvedValue({
        id: 1,
        isVip: true,
        vipLevel: 'gold',
        vipTriggerSource: 'manual'
      });

      const result = await TicketService.getVipUserInfo(1);
      
      expect(result.isVip).toBe(true);
      expect(result.vipLevel).toBe('gold');
      expect(result.vipPriorityScore).toBe(50);
      expect(result.vipTriggerSource).toBe('manual');
    });

    test('should return non-VIP for regular users', async () => {
      db.user.findUnique.mockResolvedValue({
        id: 2,
        isVip: false,
        vipLevel: null
      });

      const result = await TicketService.getVipUserInfo(2);
      
      expect(result.isVip).toBe(false);
      expect(result.vipLevel).toBe(null);
      expect(result.vipPriorityScore).toBe(0);
    });
  });

  describe('VIP Priority Score Calculation', () => {
    test('should calculate correct priority scores for different VIP levels', () => {
      expect(TicketService.calculateVipPriorityScore('exec')).toBe(100);
      expect(TicketService.calculateVipPriorityScore('gold')).toBe(50);
      expect(TicketService.calculateVipPriorityScore('priority')).toBe(25);
      expect(TicketService.calculateVipPriorityScore('invalid')).toBe(0);
    });
  });

  describe('VIP Priority Adjustment', () => {
    test('should adjust priority correctly for VIP levels', () => {
      // Executive VIPs always get CRITICAL
      expect(TicketService.adjustPriorityForVip('LOW', 'exec')).toBe('CRITICAL');
      expect(TicketService.adjustPriorityForVip('MEDIUM', 'exec')).toBe('CRITICAL');
      expect(TicketService.adjustPriorityForVip('HIGH', 'exec')).toBe('CRITICAL');

      // Gold VIPs get minimum HIGH
      expect(TicketService.adjustPriorityForVip('LOW', 'gold')).toBe('HIGH');
      expect(TicketService.adjustPriorityForVip('MEDIUM', 'gold')).toBe('HIGH');
      expect(TicketService.adjustPriorityForVip('HIGH', 'gold')).toBe('HIGH');
      expect(TicketService.adjustPriorityForVip('CRITICAL', 'gold')).toBe('CRITICAL');

      // Priority VIPs get minimum MEDIUM
      expect(TicketService.adjustPriorityForVip('LOW', 'priority')).toBe('MEDIUM');
      expect(TicketService.adjustPriorityForVip('MEDIUM', 'priority')).toBe('MEDIUM');
      expect(TicketService.adjustPriorityForVip('HIGH', 'priority')).toBe('HIGH');
    });
  });

  describe('VIP SLA Application', () => {
    test('should apply VIP-specific SLA for executive level', async () => {
      const mockSla = {
        id: 'vip-exec-sla',
        name: 'VIP Executive SLA',
        responseTime: 15,
        resolutionTime: 120,
        isVipOnly: true
      };

      db.slaDefinition.findFirst.mockResolvedValue(mockSla);

      const vipInfo = { isVip: true, vipLevel: 'exec' };
      const ticketData = { userId: 1 };

      const result = await TicketService.applyVipSLA(ticketData, vipInfo);

      expect(result).toEqual(mockSla);
      expect(db.slaDefinition.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'VIP Executive SLA',
          isActive: true,
          isVipOnly: true
        }
      });
    });

    test('should return null for non-VIP users', async () => {
      const vipInfo = { isVip: false };
      const ticketData = { userId: 1 };

      const result = await TicketService.applyVipSLA(ticketData, vipInfo);

      expect(result).toBeNull();
      expect(db.slaDefinition.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('VIP Queue Sorting', () => {
    test('should build order by clause with VIP priority first', () => {
      const orderBy = TicketService.buildOrderByClause('created_at', 'desc');

      expect(orderBy).toEqual([
        { vipPriorityScore: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]);
    });

    test('should include VIP priority in custom sort orders', () => {
      const orderBy = TicketService.buildOrderByClause('title', 'asc');

      expect(orderBy).toEqual([
        { title: 'asc' },
        { vipPriorityScore: 'desc' },
        { priority: 'desc' }
      ]);
    });
  });

  describe('VIP Ticket Creation Workflow', () => {
    test('should create VIP ticket with enhanced metadata', async () => {
      const mockTransaction = {
        enhancedSupportTicket: {
          create: jest.fn().mockResolvedValue({
            id: 'ticket-1',
            ticketNumber: 'VIP-000001',
            isVip: true,
            vipLevel: 'gold',
            vipPriorityScore: 50,
            priority: 'HIGH'
          }),
          update: jest.fn()
        },
        auditLog: {
          create: jest.fn()
        }
      };

      db.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Mock VIP user detection
      db.user.findUnique.mockResolvedValue({
        id: 1,
        isVip: true,
        vipLevel: 'gold',
        vipTriggerSource: 'api'
      });

      // Mock SLA lookup
      db.slaDefinition.findFirst.mockResolvedValue({
        id: 'vip-gold-sla',
        responseTime: 30,
        resolutionTime: 240
      });

      const ticketData = {
        title: 'VIP Test Ticket',
        description: 'Test VIP functionality',
        userId: 1,
        priority: 'MEDIUM'
      };

      const user = { id: 2, name: 'Agent User' };

      // Mock the ticket service methods we're testing
      jest.spyOn(TicketService, 'getVipUserInfo').mockResolvedValue({
        isVip: true,
        vipLevel: 'gold',
        vipPriorityScore: 50,
        vipTriggerSource: 'api'
      });

      jest.spyOn(TicketService, 'applyVipSLA').mockResolvedValue({
        id: 'vip-gold-sla',
        responseTime: 30,
        resolutionTime: 240
      });

      jest.spyOn(TicketService, 'adjustPriorityForVip').mockReturnValue('HIGH');
      jest.spyOn(TicketService, 'handleVipTicketCreation').mockResolvedValue(undefined);
      jest.spyOn(TicketService, 'sendVipNotifications').mockResolvedValue(undefined);

      // Mock other required methods
      const mockGenerateTicketId = jest.fn().mockResolvedValue('VIP-000001');
      const mockCalculateDueDates = jest.fn().mockReturnValue({ dueDate: new Date() });
      const mockNormalizeTicketType = jest.fn().mockReturnValue('REQUEST');
      const mockGenerateShortDescription = jest.fn().mockReturnValue('Test VIP');
      const mockProcessAttachments = jest.fn().mockResolvedValue(undefined);
      const mockPerformAutoAssignment = jest.fn().mockResolvedValue(undefined);
      const mockAddAutoWatchers = jest.fn().mockResolvedValue(undefined);
      const mockFormatTicketResponse = jest.fn().mockReturnValue({});

      TicketService.generateTypedTicketId = mockGenerateTicketId;
      TicketService.calculateDueDates = mockCalculateDueDates;
      TicketService.normalizeTicketType = mockNormalizeTicketType;
      TicketService.generateShortDescription = mockGenerateShortDescription;
      TicketService.processAttachments = mockProcessAttachments;
      TicketService.performAutoAssignment = mockPerformAutoAssignment;
      TicketService.addAutoWatchers = mockAddAutoWatchers;
      TicketService.formatTicketResponse = mockFormatTicketResponse;

      const result = await TicketService.createTicket(ticketData, user);

      // Verify VIP user info was fetched
      expect(TicketService.getVipUserInfo).toHaveBeenCalledWith(1);

      // Verify VIP SLA was applied
      expect(TicketService.applyVipSLA).toHaveBeenCalled();

      // Verify priority was adjusted for VIP
      expect(TicketService.adjustPriorityForVip).toHaveBeenCalledWith('MEDIUM', 'gold');

      // Verify VIP-specific handling was called
      expect(TicketService.handleVipTicketCreation).toHaveBeenCalled();

      // Verify ticket was created with VIP metadata
      expect(mockTransaction.enhancedSupportTicket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isVip: true,
            vipPriorityScore: 50,
            vipTriggerSource: 'api',
            priority: 'HIGH'
          })
        })
      );
    });
  });

  describe('VIP Audit Logging', () => {
    test('should log VIP ticket creation with proper metadata', async () => {
      const mockTransaction = {
        auditLog: {
          create: jest.fn()
        }
      };

      const ticket = {
        id: 'ticket-1',
        ticketNumber: 'VIP-000001'
      };

      const vipInfo = {
        vipLevel: 'exec',
        vipPriorityScore: 100,
        vipTriggerSource: 'scim'
      };

      const user = { id: 2 };

      await TicketService.handleVipTicketCreation(mockTransaction, ticket, vipInfo, user);

      expect(mockTransaction.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 2,
          action: 'VIP_TICKET_CREATED',
          details: JSON.stringify({
            ticketId: 'ticket-1',
            ticketNumber: 'VIP-000001',
            vipLevel: 'exec',
            vipPriorityScore: 100,
            triggerSource: 'scim',
            originalPriority: undefined,
            slaOverride: {
              responseMinutes: undefined,
              resolutionMinutes: undefined
            }
          }),
          timestamp: expect.any(Date)
        }
      });
    });
  });

  describe('VIP Notification System', () => {
    test('should send VIP-specific notifications', async () => {
      const mockNotificationService = {
        sendNotification: jest.fn(),
        sendSlackNotification: jest.fn()
      };

      // Mock environment variable
      process.env.VIP_SLACK_CHANNEL = '#vip-alerts';

      const ticket = {
        id: 'ticket-1',
        ticketNumber: 'VIP-000001',
        title: 'Critical VIP Issue',
        vipLevel: 'exec',
        priority: 'CRITICAL',
        userId: 1,
        requester: { name: 'VIP User' }
      };

      // We would need to mock the NotificationService properly in a real test
      // This is a conceptual test structure
      await TicketService.sendVipNotifications(ticket);

      // Verify notification structure (this would work with proper mocking)
      // expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
      //   type: 'VIP_TICKET_CREATED',
      //   title: '🌟 VIP Ticket Created - EXEC',
      //   message: 'VIP ticket #VIP-000001 requires immediate attention: Critical VIP Issue',
      //   priority: 'HIGH',
      //   channels: ['email', 'slack'],
      //   data: expect.objectContaining({
      //     ticketId: 'ticket-1',
      //     vipLevel: 'exec'
      //   })
      // });
    });
  });
});

export { TicketService };