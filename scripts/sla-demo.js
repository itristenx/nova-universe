#!/usr/bin/env node

/**
 * SLA Management System Demo
 * Demonstrates the new industry-standard Impact vs Urgency matrix calculations
 */

import { SLAMatrixService } from '../apps/api/services/sla-matrix.service.js';

console.log('🎯 NOVA UNIVERSE - ENHANCED SLA MANAGEMENT DEMO');
console.log('='.repeat(60));
console.log();

// Test scenarios
const testScenarios = [
  {
    name: '🚨 Critical Production Outage',
    data: {
      title: 'Critical: All servers down',
      description: 'Production outage affecting all users. Emergency response needed.',
      affectedUsers: 500,
      severity: 'critical',
      isVip: false
    }
  },
  {
    name: '👑 Executive VIP Request',
    data: {
      title: 'Password reset needed',
      description: 'Cannot access email account before important board meeting',
      affectedUsers: 1,
      isVip: true,
      vipLevel: 'executive',
      userId: 'ceo-user-123'
    }
  },
  {
    name: '⚡ VIP Gold Urgent Issue',
    data: {
      title: 'Urgent: Application not working',
      description: 'Client presentation in 2 hours, need immediate assistance',
      affectedUsers: 1,
      isVip: true,
      vipLevel: 'gold',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    name: '🐌 Standard Performance Issue',
    data: {
      title: 'Application running slow',
      description: 'Users reporting performance issues with the CRM application',
      affectedUsers: 25,
      isVip: false
    }
  },
  {
    name: '🔑 Routine Access Request',
    data: {
      title: 'Request access to shared folder',
      description: 'User needs read access to marketing shared folder',
      affectedUsers: 1,
      isVip: false
    }
  },
  {
    name: '🔥 VIP Priority Boost Demo - Regular User becomes Critical via VIP',
    data: {
      title: 'Application running slow',
      description: 'Users reporting performance issues with the CRM application',
      affectedUsers: 25,
      isVip: true,
      vipLevel: 'gold',
      userId: 'vip-gold-user-456'
    }
  },
  {
    name: '👑 Executive Priority Boost Demo - Low Priority becomes Critical',
    data: {
      title: 'Request access to shared folder',
      description: 'User needs read access to marketing shared folder',
      affectedUsers: 1,
      isVip: true,
      vipLevel: 'executive',
      userId: 'exec-user-789'
    }
  }
];

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getUrgencyIcon(urgency) {
  return urgency === 1 ? '🔴' : urgency === 2 ? '🟡' : '🟢';
}

function getImpactIcon(impact) {
  return impact === 1 ? '💥' : impact === 2 ? '⚠️' : '💬';
}

function getPriorityIcon(priority) {
  return priority === 1 ? '🚨' : priority === 2 ? '🔥' : priority === 3 ? '📋' : '📝';
}

// Display priority matrix
console.log('📊 IMPACT vs URGENCY PRIORITY MATRIX');
console.log('-'.repeat(40));
console.log('Impact/Urgency │ High  │ Med   │ Low   ');
console.log('───────────────┼───────┼───────┼───────');
console.log('High           │ Crit  │ High  │ Med   ');
console.log('Medium         │ High  │ Med   │ Low   ');
console.log('Low            │ Med   │ Low   │ Low   ');
console.log();

// Run test scenarios
console.log('🧪 TEST SCENARIOS');
console.log('-'.repeat(40));

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log('   ' + '─'.repeat(scenario.name.length - 2));
  
  try {
    const result = SLAMatrixService.calculateTicketSLA(scenario.data);
    
    console.log(`   📥 Input: "${scenario.data.title}"`);
    if (scenario.data.affectedUsers > 1) {
      console.log(`   👥 Affected Users: ${scenario.data.affectedUsers}`);
    }
    if (scenario.data.isVip) {
      console.log(`   👑 VIP Level: ${scenario.data.vipLevel}`);
    }
    if (scenario.data.businessService?.criticality) {
      console.log(`   🏢 Business Service: ${scenario.data.businessService.criticality}`);
    }
    
    console.log(`   ${getImpactIcon(result.impact)} Impact: ${result.impactLabel} (${result.impact})`);
    console.log(`   ${getUrgencyIcon(result.urgency)} Urgency: ${result.urgencyLabel} (${result.urgency})`);
    
    // Show VIP priority boost details
    if (result.vipBoost && result.vipBoost.boosted) {
      console.log(`   📊 Base Priority: ${result.basePriorityLabel} (${result.basePriority})`);
      console.log(`   🚀 VIP Boost: ${result.vipBoost.boostReason}`);
      console.log(`   ${getPriorityIcon(result.priority)} Final Priority: ${result.priorityLabel} (${result.priority})`);
    } else {
      console.log(`   ${getPriorityIcon(result.priority)} Priority: ${result.priorityLabel} (${result.priority})`);
    }
    
    console.log(`   👥 User Type: ${result.userType}`);
    console.log(`   ⏱️  Response Time: ${formatTime(result.slaPolicy.responseTime)}`);
    console.log(`   🔧 Resolution Time: ${formatTime(result.slaPolicy.resolutionTime)}`);
    console.log(`   📈 Escalation: ${formatTime(result.slaPolicy.escalationTime)} → ${result.slaPolicy.escalationLevel}`);
    
    // Show target times
    const now = new Date();
    const responseTime = Math.round((result.targets.response - now) / (1000 * 60));
    const resolutionTime = Math.round((result.targets.resolution - now) / (1000 * 60));
    
    console.log(`   🎯 Response Due: ${formatTime(responseTime)} from now`);
    console.log(`   🏁 Resolution Due: ${formatTime(resolutionTime)} from now`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

// Show SLA templates summary
console.log('\n📋 SLA POLICY TEMPLATES');
console.log('-'.repeat(40));

const templates = SLAMatrixService.DEFAULT_SLA_TEMPLATES;
Object.entries(templates).forEach(([key, template]) => {
  console.log(`\n${template.name} (${key}):`);
  console.log(`   ${template.description}`);
  
  Object.entries(template.policies).forEach(([priority, policy]) => {
    const priorityLabel = SLAMatrixService.getPriorityLabel(parseInt(priority));
    console.log(`   ${getPriorityIcon(parseInt(priority))} ${priorityLabel}: ${formatTime(policy.responseTime)} response, ${formatTime(policy.resolutionTime)} resolution`);
  });
});

// VIP Priority Boost Examples
console.log('\n🚀 VIP PRIORITY BOOST EXAMPLES');
console.log('-'.repeat(40));

const boostExamples = [
  { basePriority: 4, isVip: false, vipLevel: null, description: 'Standard User - Low Priority' },
  { basePriority: 4, isVip: true, vipLevel: 'priority', description: 'VIP User - Low becomes Medium' },
  { basePriority: 4, isVip: true, vipLevel: 'gold', description: 'Gold VIP - Low becomes Medium' },
  { basePriority: 4, isVip: true, vipLevel: 'executive', description: 'Executive VIP - Low becomes High' },
  { basePriority: 3, isVip: true, vipLevel: 'gold', description: 'Gold VIP - Medium becomes High' },
  { basePriority: 2, isVip: true, vipLevel: 'executive', description: 'Executive VIP - High becomes Critical' }
];

boostExamples.forEach((example, index) => {
  const boost = SLAMatrixService.applyVipPriorityBoost(example.basePriority, example.isVip, example.vipLevel);
  const basePriorityLabel = SLAMatrixService.getPriorityLabel(example.basePriority);
  const finalPriorityLabel = SLAMatrixService.getPriorityLabel(boost.finalPriority);
  
  console.log(`\n${index + 1}. ${example.description}`);
  console.log(`   📊 Base: ${basePriorityLabel} (${example.basePriority}) → Final: ${finalPriorityLabel} (${boost.finalPriority})`);
  if (boost.boosted) {
    console.log(`   🚀 Boost: ${boost.boostReason}`);
    
    // Show the SLA impact
    const standardSla = SLAMatrixService.getSLAPolicy(example.basePriority, 'standard');
    const boostedSla = SLAMatrixService.getSLAPolicy(boost.finalPriority, example.isVip && example.vipLevel === 'executive' ? 'executive' : example.isVip ? 'vip' : 'standard');
    console.log(`   ⏱️  SLA Impact: ${formatTime(standardSla.responseTime)} → ${formatTime(boostedSla.responseTime)} response`);
  } else {
    console.log(`   📝 No boost applied`);
  }
});

// Performance test
console.log('\n⚡ PERFORMANCE TEST');
console.log('-'.repeat(40));

const performanceTestData = {
  title: 'Performance test ticket',
  description: 'Testing calculation speed',
  affectedUsers: 10,
  isVip: false
};

const iterations = 1000;
console.log(`Running ${iterations} SLA calculations...`);

const startTime = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
  SLAMatrixService.calculateTicketSLA(performanceTestData);
}
const endTime = process.hrtime.bigint();

const durationMs = Number(endTime - startTime) / 1000000;
const avgTimeMs = durationMs / iterations;

console.log(`✅ Completed ${iterations} calculations in ${durationMs.toFixed(2)}ms`);
console.log(`📊 Average: ${avgTimeMs.toFixed(3)}ms per calculation`);
console.log(`🚀 Throughput: ${Math.round(1000 / avgTimeMs)} calculations/second`);

// Matrix validation test
console.log('\n🔍 MATRIX VALIDATION TEST');
console.log('-'.repeat(40));

const validMatrix = {
  matrix: {
    "1,1": 1, "1,2": 2, "1,3": 3,
    "2,1": 2, "2,2": 3, "2,3": 4,
    "3,1": 3, "3,2": 4, "3,3": 4
  }
};

const invalidMatrix = {
  matrix: {
    "1,1": 1, "1,2": 2 // Missing keys
  }
};

console.log(`Valid matrix: ${SLAMatrixService.validateMatrix(validMatrix) ? '✅' : '❌'}`);
console.log(`Invalid matrix: ${SLAMatrixService.validateMatrix(invalidMatrix) ? '✅' : '❌'}`);

console.log('\n🎉 DEMO COMPLETE!');
console.log('For more information, see: docs/SLA_MANAGEMENT_GUIDE.md');
console.log('='.repeat(60));