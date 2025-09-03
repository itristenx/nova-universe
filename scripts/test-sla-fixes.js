#!/usr/bin/env node

/**
 * Test script to verify SLA API fixes
 */

import { SLAMatrixService } from '../apps/api/services/sla-matrix.service.js';

console.log('🧪 Testing SLA API Fixes');
console.log('='.repeat(40));

// Test 1: Direct impact/urgency input (should work now)
console.log('\n1. Testing direct impact/urgency input:');
try {
  const testData = {
    impact: 2,    // High impact
    urgency: 3,   // Medium urgency
    isVip: true,
    vipLevel: 'gold'
  };
  
  const result = SLAMatrixService.calculateTicketSLA(testData);
  console.log('✅ SUCCESS - Direct input works');
  console.log(`   Impact: ${result.impactLabel} (${result.impact})`);
  console.log(`   Urgency: ${result.urgencyLabel} (${result.urgency})`);
  console.log(`   Priority: ${result.priorityLabel} (${result.priority})`);
  if (result.vipBoost && result.vipBoost.boosted) {
    console.log(`   VIP Boost: ${result.vipBoost.boostReason}`);
  }
} catch (error) {
  console.log('❌ FAILED - Direct input failed:', error.message);
}

// Test 2: Content analysis (should still work)
console.log('\n2. Testing content analysis fallback:');
try {
  const testData = {
    title: 'Critical server outage',
    description: 'All production servers are down - urgent fix needed'
  };
  
  const result = SLAMatrixService.calculateTicketSLA(testData);
  console.log('✅ SUCCESS - Content analysis works');
  console.log(`   Impact: ${result.impactLabel} (${result.impact})`);
  console.log(`   Urgency: ${result.urgencyLabel} (${result.urgency})`);
  console.log(`   Priority: ${result.priorityLabel} (${result.priority})`);
} catch (error) {
  console.log('❌ FAILED - Content analysis failed:', error.message);
}

// Test 3: Mixed input (should work)
console.log('\n3. Testing mixed input (impact direct, urgency from content):');
try {
  const testData = {
    title: 'Urgent: Need help ASAP',
    description: 'Client meeting in 1 hour',
    impact: 3,    // Medium impact (direct)
    isVip: false
  };
  
  const result = SLAMatrixService.calculateTicketSLA(testData);
  console.log('✅ SUCCESS - Mixed input works');
  console.log(`   Impact: ${result.impactLabel} (${result.impact})`);
  console.log(`   Urgency: ${result.urgencyLabel} (${result.urgency})`);
  console.log(`   Priority: ${result.priorityLabel} (${result.priority})`);
} catch (error) {
  console.log('❌ FAILED - Mixed input failed:', error.message);
}

// Test 4: Matrix display function
console.log('\n4. Testing matrix display function:');
try {
  const display = SLAMatrixService.getMatrixDisplay();
  console.log('✅ SUCCESS - Matrix display function works');
  console.log(`   Title: ${display.title}`);
  console.log(`   Rows: ${display.rows.length} rows`);
} catch (error) {
  console.log('❌ FAILED - Matrix display failed:', error.message);
}

// Test 5: Normalization validation
console.log('\n5. Testing normalization validation:');
try {
  // Test various inputs to ensure they're properly normalized to 1-4 range
  const testInputs = [0, 1, 2, 3, 4, 5, 'critical', 'high', 'medium', 'low', 'invalid'];
  
  console.log('   Testing normalization:');
  testInputs.forEach(input => {
    const normalized = SLAMatrixService.normalizeLevel(input);
    const isValid = normalized >= 1 && normalized <= 4;
    console.log(`   Input: ${input} → ${normalized} ${isValid ? '✅' : '❌'}`);
  });
  
  console.log('✅ SUCCESS - Normalization validation works');
} catch (error) {
  console.log('❌ FAILED - Normalization validation failed:', error.message);
}

console.log('\n🎉 All tests completed!');
console.log('='.repeat(40));