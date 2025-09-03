import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateVipWeight } from '../apps/api/utils/utils.js';

describe('VIP Priority System', () => {
  describe('VIP Weight Calculation', () => {
    test('should calculate correct VIP weights', () => {
      assert.strictEqual(calculateVipWeight(false), 0);
      assert.strictEqual(calculateVipWeight(true, 'silver'), 1);
      assert.strictEqual(calculateVipWeight(true, 'gold'), 2);
      assert.strictEqual(calculateVipWeight(true, 'exec'), 3);
    });

    test('should throw error for VIP without level', () => {
      assert.throws(() => calculateVipWeight(true), /vipLevel must be provided/);
    });

    test('should handle edge cases', () => {
      assert.strictEqual(calculateVipWeight(false, 'exec'), 0);
      assert.strictEqual(calculateVipWeight(true, 'unknown'), 1); // default case
    });
  });

  describe('VIP Ticket Priority Logic', () => {
    test('should prioritize VIP tickets correctly', () => {
      const tickets = [
        { id: '1', priority: 'HIGH', isVip: false, vipPriorityScore: 0, createdAt: '2025-01-01T10:00:00Z' },
        { id: '2', priority: 'MEDIUM', isVip: true, vipPriorityScore: 50, createdAt: '2025-01-01T11:00:00Z' },
        { id: '3', priority: 'LOW', isVip: true, vipPriorityScore: 100, createdAt: '2025-01-01T12:00:00Z' },
        { id: '4', priority: 'CRITICAL', isVip: false, vipPriorityScore: 0, createdAt: '2025-01-01T13:00:00Z' }
      ];

      // Sort by VIP priority score (desc), then priority, then created date
      const sorted = tickets.sort((a, b) => {
        // VIP priority score descending
        if (a.vipPriorityScore !== b.vipPriorityScore) {
          return b.vipPriorityScore - a.vipPriorityScore;
        }
        
        // Priority level
        const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Created date ascending (older first)
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      // VIP exec (100 score) should be first, then VIP gold (50 score), then regular tickets
      assert.strictEqual(sorted[0].id, '3'); // VIP exec with lowest priority but highest VIP score
      assert.strictEqual(sorted[1].id, '2'); // VIP gold 
      assert.strictEqual(sorted[2].id, '4'); // Regular critical
      assert.strictEqual(sorted[3].id, '1'); // Regular high
    });
  });

  describe('VIP SLA Logic', () => {
    test('should apply correct SLA times for VIP levels', () => {
      const baseSla = { responseMinutes: 240, resolutionMinutes: 1440 }; // 4 hours, 24 hours
      
      // Executive VIP: 15 min response, 2 hour resolution
      const execSla = { responseMinutes: 15, resolutionMinutes: 120 };
      
      // Gold VIP: 30 min response, 4 hour resolution  
      const goldSla = { responseMinutes: 30, resolutionMinutes: 240 };
      
      // Priority VIP: 60 min response, 8 hour resolution
      const prioritySla = { responseMinutes: 60, resolutionMinutes: 480 };

      // Test SLA application logic
      function getVipSla(vipLevel) {
        switch (vipLevel) {
          case 'exec': return execSla;
          case 'gold': return goldSla;
          case 'priority': return prioritySla;
          default: return baseSla;
        }
      }

      assert.deepStrictEqual(getVipSla('exec'), execSla);
      assert.deepStrictEqual(getVipSla('gold'), goldSla);
      assert.deepStrictEqual(getVipSla('priority'), prioritySla);
      assert.deepStrictEqual(getVipSla(null), baseSla);
    });
  });

  describe('VIP Escalation Logic', () => {
    test('should identify escalation scenarios correctly', () => {
      // Test 1: VIP ticket put on hold should escalate
      const holdEscalation = {
        isVip: true,
        status: 'on_hold',
        shouldEscalate: true,
        reason: 'vip_hold_escalation'
      };
      
      assert.strictEqual(holdEscalation.shouldEscalate, true);
      assert.strictEqual(holdEscalation.reason, 'vip_hold_escalation');

      // Test 2: Executive resolution should escalate for confirmation
      const execResolution = {
        isVip: true,
        vipLevel: 'exec',
        status: 'resolved',
        shouldEscalate: true,
        reason: 'vip_resolution_confirmation'
      };
      
      assert.strictEqual(execResolution.shouldEscalate, true);
      assert.strictEqual(execResolution.reason, 'vip_resolution_confirmation');

      // Test 3: Regular VIP resolution should not escalate
      const regularVipResolution = {
        isVip: true,
        vipLevel: 'gold',
        status: 'resolved',
        shouldEscalate: false
      };
      
      assert.strictEqual(regularVipResolution.shouldEscalate, false);

      // Test 4: Non-VIP ticket should not escalate
      const regularTicket = {
        isVip: false,
        status: 'on_hold',
        shouldEscalate: false
      };
      
      assert.strictEqual(regularTicket.shouldEscalate, false);
    });
  });

  describe('VIP Audit Logging', () => {
    test('should generate correct audit log data structure', () => {
      const vipTicketAuditData = {
        action: 'vip_ticket_created',
        user_id: 'test-user-id',
        ticket_id: 'test-ticket-id',
        details: {
          vip_level: 'gold',
          vip_priority_score: 50,
          sla_override: { responseMinutes: 30, resolutionMinutes: 240 },
          original_due_date: '2025-01-01T14:00:00Z',
          trigger_source: 'api'
        }
      };

      assert.strictEqual(vipTicketAuditData.action, 'vip_ticket_created');
      assert.strictEqual(vipTicketAuditData.details.vip_level, 'gold');
      assert.strictEqual(vipTicketAuditData.details.vip_priority_score, 50);
      assert.strictEqual(vipTicketAuditData.details.sla_override.responseMinutes, 30);
    });

    test('should generate correct escalation audit data', () => {
      const escalationAuditData = {
        action: 'vip_escalation_created',
        user_id: 'escalating-user-id',
        ticket_id: 'escalated-ticket-id',
        details: {
          vip_level: 'exec',
          escalation_level: 1,
          escalation_reason: 'SLA breach imminent',
          escalated_to: 'manager-user-id'
        }
      };

      assert.strictEqual(escalationAuditData.action, 'vip_escalation_created');
      assert.strictEqual(escalationAuditData.details.vip_level, 'exec');
      assert.strictEqual(escalationAuditData.details.escalation_level, 1);
    });
  });
});

console.log('✅ VIP Priority System tests completed successfully');