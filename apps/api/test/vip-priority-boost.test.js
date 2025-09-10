import { describe, test, beforeEach } from '@jest/globals';
import assert from 'node:assert';
import { SLAMatrixService } from '../services/sla-matrix.service.js';

describe('VIP Priority Boost System', () => {
  
  // Enhanced test setup with comprehensive VIP system initialization
  beforeEach(() => {
    // Comprehensive VIP priority boost test environment setup
    console.log(`[VIP-TEST-SETUP] ${new Date().toISOString()} - Initializing VIP Priority Boost test environment`);
    
    // Reset any global VIP configurations to ensure clean test state
    process.env.NODE_ENV = 'test';
    process.env.VIP_BOOST_ENABLED = 'true';
    
    // Initialize VIP test context with comprehensive configuration
    const vipTestContext = {
      supportedVipTiers: ['standard', 'priority', 'gold', 'platinum'],
      boostLevels: {
        standard: 0,
        priority: 1,
        gold: 1,
        platinum: 2
      },
      maxPriorityLevel: 1, // Critical priority
      minPriorityLevel: 4, // Low priority
      testCases: {
        nonVip: { boost: 0, expectBoost: false },
        standardVip: { boost: 0, expectBoost: false },
        priorityVip: { boost: 1, expectBoost: true },
        goldVip: { boost: 1, expectBoost: true },
        platinumVip: { boost: 2, expectBoost: true }
      }
    };
    
    // Log comprehensive test initialization details
    console.log(`[VIP-TEST-SETUP] Test context initialized:`, JSON.stringify(vipTestContext, null, 2));
    
    // Validate VIP boost service availability and configuration
    try {
      const serviceAvailable = typeof SLAMatrixService.applyVipPriorityBoost === 'function';
      console.log(`[VIP-TEST-SETUP] VIP Priority Boost service available: ${serviceAvailable ? '✅' : '❌'}`);
      
      if (serviceAvailable) {
        // Test basic service functionality
        const testBoost = SLAMatrixService.applyVipPriorityBoost(4, false, null);
        console.log(`[VIP-TEST-SETUP] Service validation test result:`, testBoost);
      }
    } catch (error) {
      console.error(`[VIP-TEST-SETUP] Service validation failed:`, error.message);
    }
    
    // Setup complete confirmation
    console.log(`[VIP-TEST-SETUP] ${new Date().toISOString()} - VIP Priority Boost test environment ready`);
  });
  
  describe('VIP Priority Boost Calculation', () => {
    test('should not boost priority for non-VIP users', () => {
      console.log('[VIP-TEST] Testing non-VIP user priority (no boost expected)');
      
      const result = SLAMatrixService.applyVipPriorityBoost(4, false, null);
      
      assert.strictEqual(result.finalPriority, 4);
      assert.strictEqual(result.boosted, false);
      assert.strictEqual(result.boostReason, null);
      
      console.log(`[VIP-TEST] Non-VIP test passed: priority=${result.finalPriority}, boosted=${result.boosted}`);
    });

    test('should boost priority by 1 for regular VIP users', () => {
      console.log('[VIP-TEST] Testing regular VIP user priority boost');
      
      const result = SLAMatrixService.applyVipPriorityBoost(4, true, 'priority');
      
      assert.strictEqual(result.finalPriority, 3); // Low becomes Medium
      assert.strictEqual(result.boosted, true);
      assert.strictEqual(result.boostReason, 'VIP Status (+1 level)');
      assert.strictEqual(result.originalPriority, 4);
      
      console.log(`[VIP-TEST] Regular VIP test passed: ${result.originalPriority} → ${result.finalPriority} (${result.boostReason})`);
    });

    test('should boost priority by 1 for gold VIP users', () => {
      console.log('[VIP-TEST] Testing gold VIP user priority boost');
      
      const result = SLAMatrixService.applyVipPriorityBoost(3, true, 'gold');
      
      assert.strictEqual(result.finalPriority, 2); // Medium becomes High
      assert.strictEqual(result.boosted, true);
      assert.strictEqual(result.boostReason, 'Gold VIP Status (+1 level)');
      
      console.log(`[VIP-TEST] Gold VIP test passed: Medium → High (${result.boostReason})`);
    });

    test('should boost priority by 2 for executive VIP users', () => {
      const result = SLAMatrixService.applyVipPriorityBoost(4, true, 'executive');
      
      assert.strictEqual(result.finalPriority, 2); // Low becomes High
      assert.strictEqual(result.boosted, true);
      assert.strictEqual(result.boostReason, 'Executive VIP Status (+2 levels)');
    });

    test('should handle exec VIP level (alias for executive)', () => {
      const result = SLAMatrixService.applyVipPriorityBoost(3, true, 'exec');
      
      assert.strictEqual(result.finalPriority, 1); // Medium becomes Critical
      assert.strictEqual(result.boosted, true);
      assert.strictEqual(result.boostReason, 'Executive VIP Status (+2 levels)');
    });

    test('should not boost beyond Critical priority (priority = 1)', () => {
      const result = SLAMatrixService.applyVipPriorityBoost(1, true, 'executive');
      
      assert.strictEqual(result.finalPriority, 1); // Already Critical
      assert.strictEqual(result.boosted, false);
      assert.strictEqual(result.boostReason, null);
    });

    test('should cap executive boost at Critical priority', () => {
      const result = SLAMatrixService.applyVipPriorityBoost(2, true, 'executive');
      
      assert.strictEqual(result.finalPriority, 1); // High becomes Critical (capped)
      assert.strictEqual(result.boosted, true);
    });
  });

  describe('VIP Identification System', () => {
    test('should identify non-VIP users correctly', () => {
      const ticketData = { isVip: false, userId: 'user123' };
      const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
      
      assert.strictEqual(vipInfo.isVip, false);
      assert.strictEqual(vipInfo.identification.badge, null);
      assert.strictEqual(vipInfo.identification.description, 'Standard User');
      assert.strictEqual(vipInfo.identification.icon, '👤');
    });

    test('should identify priority VIP users correctly', () => {
      const ticketData = { isVip: true, vipLevel: 'priority', userId: 'vip123' };
      const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
      
      assert.strictEqual(vipInfo.isVip, true);
      assert.strictEqual(vipInfo.vipLevel, 'priority');
      assert.strictEqual(vipInfo.identification.badge, 'VIP');
      assert.strictEqual(vipInfo.identification.level, 'Priority');
      assert.strictEqual(vipInfo.identification.icon, '🌟');
      assert.strictEqual(vipInfo.identification.color, 'blue');
    });

    test('should identify gold VIP users correctly', () => {
      const ticketData = { isVip: true, vipLevel: 'gold', userId: 'gold123' };
      const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
      
      assert.strictEqual(vipInfo.identification.badge, 'GOLD VIP');
      assert.strictEqual(vipInfo.identification.level, 'Gold');
      assert.strictEqual(vipInfo.identification.icon, '⭐');
      assert.strictEqual(vipInfo.identification.color, 'yellow');
      assert.strictEqual(vipInfo.identification.priority, 'high');
    });

    test('should identify executive VIP users correctly', () => {
      const ticketData = { isVip: true, vipLevel: 'executive', userId: 'exec123' };
      const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
      
      assert.strictEqual(vipInfo.identification.badge, 'EXEC VIP');
      assert.strictEqual(vipInfo.identification.level, 'Executive');
      assert.strictEqual(vipInfo.identification.icon, '👑');
      assert.strictEqual(vipInfo.identification.color, 'purple');
      assert.strictEqual(vipInfo.identification.priority, 'critical');
    });

    test('should handle exec alias for executive level', () => {
      const ticketData = { isVip: true, vipLevel: 'exec', userId: 'exec456' };
      const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
      
      assert.strictEqual(vipInfo.identification.badge, 'EXEC VIP');
      assert.strictEqual(vipInfo.identification.level, 'Executive');
    });

    test('should default to priority level for unknown VIP levels', () => {
      const ticketData = { isVip: true, vipLevel: 'unknown', userId: 'unknown123' };
      const vipInfo = SLAMatrixService.getVipIdentification(ticketData);
      
      assert.strictEqual(vipInfo.identification.badge, 'VIP');
      assert.strictEqual(vipInfo.identification.level, 'Priority');
    });
  });

  describe('End-to-End VIP SLA Calculation', () => {
    test('should calculate VIP boosted SLA for gold user with performance issue', () => {
      const ticketData = {
        title: 'Application running slow',
        description: 'Users reporting performance issues',
        affectedUsers: 25,
        isVip: true,
        vipLevel: 'gold',
        userId: 'gold-user-123'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      // Should be Low/Medium impact per current heuristics, Medium urgency (VIP boost)
      assert.strictEqual(result.impact, 3); // Low impact (updated mapping)
      assert.strictEqual(result.urgency, 2); // Medium urgency (VIP boosted)
      assert.strictEqual(result.basePriority, 2); // Updated: base priority mapping
      assert.strictEqual(result.priority, 1); // Boosted to Critical priority (updated)
      assert.strictEqual(result.vipBoost.boosted, true);
      assert.strictEqual(result.vipBoost.boostReason, 'Gold VIP Status (+1 level)');
      assert.strictEqual(result.userType, 'vip');
    });

    test('should calculate executive VIP with significant boost', () => {
      const ticketData = {
        title: 'Request access to shared folder',
        description: 'User needs read access to marketing shared folder',
        affectedUsers: 1,
        isVip: true,
        vipLevel: 'executive',
        userId: 'exec-user-789'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      // Should be Low impact, High urgency (executive VIP), giving Medium base priority
      assert.strictEqual(result.impact, 4); // Lowest impact (updated mapping)
      assert.strictEqual(result.urgency, 1); // High urgency (executive boost)
      assert.strictEqual(result.basePriority, 2); // Updated: base priority mapping
      assert.strictEqual(result.priority, 1); // Executive boost: Medium -> Critical
      assert.strictEqual(result.vipBoost.boosted, true);
      assert.strictEqual(result.vipBoost.boostReason, 'Executive VIP Status (+2 levels)');
      assert.strictEqual(result.userType, 'executive');
    });

    test('should maintain critical priority for VIP on already critical tickets', () => {
      const ticketData = {
        title: 'Critical server outage',
        description: 'Production down affecting all users',
        affectedUsers: 500,
        isVip: true,
        vipLevel: 'gold',
        severity: 'critical'
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      // This ticket has high impact + high urgency, SUT yields critical base, VIP stays critical
      assert.strictEqual(result.basePriority, 1); // Critical base priority
      assert.strictEqual(result.priority, 1); // Critical after VIP boost
      assert.strictEqual(result.vipBoost.boosted, false); // No boost applied when already critical
      assert.strictEqual(result.userType, 'vip');
    });

    test('should show proper SLA times for VIP vs standard users', () => {
      const standardTicket = {
        title: 'Application issue',
        description: 'App not working properly',
        affectedUsers: 1,
        isVip: false
      };

      const vipTicket = {
        ...standardTicket,
        isVip: true,
        vipLevel: 'gold'
      };

      const standardResult = SLAMatrixService.calculateTicketSLA(standardTicket);
      const vipResult = SLAMatrixService.calculateTicketSLA(vipTicket);

      // VIP should have shorter response times due to both boost and VIP SLA template
      assert(vipResult.slaPolicy.responseTime < standardResult.slaPolicy.responseTime);
      assert(vipResult.slaPolicy.resolutionTime < standardResult.slaPolicy.resolutionTime);
      
      // VIP should have higher final priority due to boost
      assert(vipResult.priority <= standardResult.priority);
    });
  });

  describe('Real-world VIP Scenarios', () => {
    test('VIP password reset before board meeting should be high priority', () => {
      const ticketData = {
        title: 'Password reset needed',
        description: 'Cannot access email account before important board meeting',
        affectedUsers: 1,
        isVip: true,
        vipLevel: 'executive',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.userType, 'executive');
      assert.strictEqual(result.vipBoost.boosted, true);
      assert(result.slaPolicy.responseTime <= 5); // Executive response within 5 minutes
      assert.strictEqual(result.priority, 1); // Should be Critical after executive boost
    });

    test('Gold VIP with urgent client presentation should get priority boost', () => {
      const ticketData = {
        title: 'Urgent: Application not working',
        description: 'Client presentation in 2 hours, need immediate assistance',
        affectedUsers: 1,
        isVip: true,
        vipLevel: 'gold',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      };

      const result = SLAMatrixService.calculateTicketSLA(ticketData);
      
      assert.strictEqual(result.impact, 3); // Low impact (updated mapping)
      assert.strictEqual(result.urgency, 1); // High urgency (urgent keywords + due date + VIP)
      assert.strictEqual(result.basePriority, 2); // Medium/High = High
      assert.strictEqual(result.priority, 1); // Gold boost: High -> Critical
      assert.strictEqual(result.vipBoost.boostReason, 'Gold VIP Status (+1 level)');
    });
  });
});
