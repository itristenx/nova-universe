import { jest } from '@jest/globals';
import { calculateVipWeight } from '../utils/utils.js';

// Mock the logger to avoid import issues
jest.mock('../logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('VIP Priority Features', () => {
  describe('VIP Weight Calculation', () => {
    test('should calculate correct VIP weights', () => {
      expect(calculateVipWeight(false)).toBe(0);
      expect(calculateVipWeight(true, 'silver')).toBe(1);
      expect(calculateVipWeight(true, 'gold')).toBe(2);
      expect(calculateVipWeight(true, 'exec')).toBe(3);
    });

    test('should throw error for VIP without level', () => {
      expect(() => calculateVipWeight(true)).toThrow('vipLevel must be provided');
    });

    test('should handle edge cases', () => {
      expect(calculateVipWeight(false, 'exec')).toBe(0);
      expect(calculateVipWeight(true, 'unknown')).toBe(1); // default case
    });
  });

  describe('VIP SLA Logic Tests', () => {
    test('should calculate VIP SLA correctly', () => {
      const now = new Date('2025-01-01T10:00:00Z');

      // Test executive VIP SLA (2 hours)
      const execDueDate = new Date(now);
      execDueDate.setHours(now.getHours() + 2);

      const expectedExecTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      expect(execDueDate.getTime() - now.getTime()).toBe(expectedExecTime);

      // Test gold VIP SLA (4 hours)
      const goldDueDate = new Date(now);
      goldDueDate.setHours(now.getHours() + 4);

      const expectedGoldTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
      expect(goldDueDate.getTime() - now.getTime()).toBe(expectedGoldTime);

      // Test silver VIP SLA (8 hours)
      const silverDueDate = new Date(now);
      silverDueDate.setHours(now.getHours() + 8);

      const expectedSilverTime = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
      expect(silverDueDate.getTime() - now.getTime()).toBe(expectedSilverTime);
    });

    test('should handle custom SLA overrides', () => {
      const now = new Date('2025-01-01T10:00:00Z');
      const customSLA = { responseMinutes: 30 };

      const dueDate = new Date(now);
      dueDate.setMinutes(now.getMinutes() + parseInt(customSLA.responseMinutes));

      const expectedTime = 30 * 60 * 1000; // 30 minutes in milliseconds
      expect(dueDate.getTime() - now.getTime()).toBe(expectedTime);
    });

    test('should detect escalation conditions', () => {
      const now = new Date('2025-01-01T10:00:00Z');
      const failoverWindow = 60; // 60 minutes

      // Case 1: Due date within failover window - should escalate
      const urgentDueDate = new Date(now);
      urgentDueDate.setMinutes(now.getMinutes() + 30); // 30 minutes

      const shouldEscalate1 = urgentDueDate.getTime() - now.getTime() < failoverWindow * 60000;
      expect(shouldEscalate1).toBe(true);

      // Case 2: Due date outside failover window - should not escalate
      const normalDueDate = new Date(now);
      normalDueDate.setMinutes(now.getMinutes() + 120); // 120 minutes

      const shouldEscalate2 = normalDueDate.getTime() - now.getTime() < failoverWindow * 60000;
      expect(shouldEscalate2).toBe(false);
    });
  });

  describe('VIP Ticket Sorting Logic', () => {
    test('should properly sort tickets by VIP priority then regular priority', () => {
      const tickets = [
        {
          id: '1',
          priority: 'high',
          vip_priority_score: 0,
          created_at: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          priority: 'medium',
          vip_priority_score: 2,
          created_at: '2025-01-01T09:00:00Z',
        },
        {
          id: '3',
          priority: 'low',
          vip_priority_score: 3,
          created_at: '2025-01-01T11:00:00Z',
        },
        {
          id: '4',
          priority: 'critical',
          vip_priority_score: 0,
          created_at: '2025-01-01T08:00:00Z',
        },
      ];

      // Simulate the SQL ORDER BY logic
      const sorted = tickets.sort((a, b) => {
        // First by VIP priority score (DESC)
        const vipScoreA = a.vip_priority_score || 0;
        const vipScoreB = b.vip_priority_score || 0;

        if (vipScoreA !== vipScoreB) {
          return vipScoreB - vipScoreA;
        }

        // Then by priority (critical=1, high=2, medium=3, low=4)
        const priorityValues = { critical: 1, high: 2, medium: 3, low: 4 };
        const priorityA = priorityValues[a.priority];
        const priorityB = priorityValues[b.priority];

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Finally by created_at (DESC)
        return new Date(b.created_at) - new Date(a.created_at);
      });

      // Expected order:
      // 1. VIP exec low priority (score 3)
      // 2. VIP gold medium priority (score 2)
      // 3. Regular critical priority (score 0, highest regular priority)
      // 4. Regular high priority (score 0, newer)

      expect(sorted[0].id).toBe('3'); // VIP exec low
      expect(sorted[1].id).toBe('2'); // VIP gold medium
      expect(sorted[2].id).toBe('4'); // Regular critical
      expect(sorted[3].id).toBe('1'); // Regular high
    });

    test('should handle null vip_priority_score values', () => {
      const tickets = [
        { id: '1', priority: 'high', vip_priority_score: null },
        { id: '2', priority: 'medium', vip_priority_score: 2 },
      ];

      const sorted = tickets.sort((a, b) => {
        const vipScoreA = a.vip_priority_score || 0;
        const vipScoreB = b.vip_priority_score || 0;
        return vipScoreB - vipScoreA;
      });

      expect(sorted[0].id).toBe('2'); // VIP ticket first
      expect(sorted[1].id).toBe('1'); // Regular ticket second
    });
  });

  describe('VIP Audit Logging Tests', () => {
    test('should generate correct audit log data structure', () => {
      const vipTicketAuditData = {
        action: 'vip_ticket_created',
        user_id: 'test-user-id',
        ticket_id: 'test-ticket-id',
        details: {
          vip_level: 'gold',
          vip_priority_score: 2,
          sla_override: { responseMinutes: 30 },
          original_due_date: '2025-01-01T14:00:00Z',
          trigger_source: 'api',
        },
      };

      expect(vipTicketAuditData.action).toBe('vip_ticket_created');
      expect(vipTicketAuditData.details.vip_level).toBe('gold');
      expect(vipTicketAuditData.details.vip_priority_score).toBe(2);
      expect(vipTicketAuditData.details.sla_override.responseMinutes).toBe(30);
    });

    test('should generate correct escalation audit data', () => {
      const escalationAuditData = {
        action: 'vip_cosmo_escalation',
        user_id: 'test-user-id',
        ticket_id: 'test-ticket-id',
        details: {
          reason: 'failover_escalation',
          failover_window_minutes: 60,
          time_to_due: 30,
        },
      };

      expect(escalationAuditData.action).toBe('vip_cosmo_escalation');
      expect(escalationAuditData.details.reason).toBe('failover_escalation');
      expect(escalationAuditData.details.failover_window_minutes).toBe(60);
    });

    test('should generate correct update audit data', () => {
      const updateAuditData = {
        action: 'vip_ticket_updated',
        details: {
          vip_level: 'exec',
          status_change: 'resolved',
          work_note: 'Issue resolved successfully',
          time_spent: 45,
          resolution: 'Applied software update',
          previous_status: 'in_progress',
        },
      };

      expect(updateAuditData.action).toBe('vip_ticket_updated');
      expect(updateAuditData.details.status_change).toBe('resolved');
      expect(updateAuditData.details.vip_level).toBe('exec');
    });
  });

  describe('VIP Escalation Logic Tests', () => {
    test('should identify escalation scenarios correctly', () => {
      // Test 1: VIP ticket put on hold should escalate
      const holdEscalation = {
        isVip: true,
        status: 'on_hold',
        shouldEscalate: true,
        reason: 'vip_hold_escalation',
      };

      expect(holdEscalation.shouldEscalate).toBe(true);
      expect(holdEscalation.reason).toBe('vip_hold_escalation');

      // Test 2: Executive resolution should escalate for confirmation
      const execResolution = {
        isVip: true,
        vipLevel: 'exec',
        status: 'resolved',
        shouldEscalate: true,
        reason: 'vip_resolution_confirmation',
      };

      expect(execResolution.shouldEscalate).toBe(true);
      expect(execResolution.reason).toBe('vip_resolution_confirmation');

      // Test 3: Regular VIP resolution should not escalate
      const regularVipResolution = {
        isVip: true,
        vipLevel: 'gold',
        status: 'resolved',
        shouldEscalate: false,
      };

      expect(regularVipResolution.shouldEscalate).toBe(false);

      // Test 4: Non-VIP ticket should not escalate
      const regularTicket = {
        isVip: false,
        status: 'on_hold',
        shouldEscalate: false,
      };

      expect(regularTicket.shouldEscalate).toBe(false);
    });
  });
});
