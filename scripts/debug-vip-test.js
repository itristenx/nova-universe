#!/usr/bin/env node

/**
 * Debug the failing VIP test scenario
 */

import { SLAMatrixService } from '../apps/api/services/sla-matrix.service.js';

console.log('🔍 Debugging VIP Test Scenario');
console.log('='.repeat(40));

// Reproduce the failing test case
const ticketData = {
  title: 'Performance issue with CRM',
  description: 'Users reporting performance issues',
  affectedUsers: 25,
  isVip: true,
  vipLevel: 'gold',
  userId: 'gold-user-123'
};

console.log('📥 Input data:');
console.log(JSON.stringify(ticketData, null, 2));

const result = SLAMatrixService.calculateTicketSLA(ticketData);

console.log('\n📊 Analysis Results:');
console.log(`Impact: ${result.impactLabel} (${result.impact}) - Expected: High (2), Got: ${result.impact}`);
console.log(`Urgency: ${result.urgencyLabel} (${result.urgency}) - Expected: High (2), Got: ${result.urgency}`);
console.log(`Base Priority: ${result.basePriorityLabel} (${result.basePriority}) - Expected: Medium (3), Got: ${result.basePriority}`);
console.log(`Final Priority: ${result.priorityLabel} (${result.priority}) - Expected: High (2), Got: ${result.priority}`);
console.log(`VIP Boost: ${result.vipBoost.boosted ? result.vipBoost.boostReason : 'None'}`);

console.log('\n🔍 Analysis:');
console.log('The test expects:');
console.log('  1. Impact: High (2) from "performance issues" keywords');
console.log('  2. Urgency: High (2) from VIP status boost');
console.log('  3. Base Priority: Medium (3) from High/High matrix');
console.log('  4. Final Priority: High (2) from VIP boost');

console.log('\nActual behavior:');
console.log(`  1. Impact: ${result.impactLabel} (${result.impact})`);
console.log(`  2. Urgency: ${result.urgencyLabel} (${result.urgency})`);
console.log(`  3. Base Priority: ${result.basePriorityLabel} (${result.basePriority})`);
console.log(`  4. Final Priority: ${result.priorityLabel} (${result.priority})`);

// Let's also test the urgency analysis specifically
const urgencyOnly = SLAMatrixService.analyzeUrgency(ticketData);
console.log(`\nUrgency analysis only: ${SLAMatrixService.getUrgencyLabel(urgencyOnly)} (${urgencyOnly})`);

console.log('\n📋 Matrix Lookup:');
const matrixKey = `${result.impact},${result.urgency}`;
const matrixPriority = SLAMatrixService.DEFAULT_PRIORITY_MATRIX.matrix[matrixKey];
console.log(`Matrix[${result.impact},${result.urgency}] = ${matrixPriority} (${SLAMatrixService.getPriorityLabel(matrixPriority)})`);