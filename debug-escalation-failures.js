/**
 * Debug Script for Escalation Test Failures
 * 
 * This script helps diagnose the 3 failing escalation tests by running them individually
 * and providing detailed output to understand what's going wrong.
 */

import { v4 as uuidv4 } from 'uuid';
import { CosmoTicketProcessor } from './apps/api/services/cosmo-ticket-processor.js';

console.log('🔍 Debugging Escalation Test Failures...\n');

const ticketProcessor = new CosmoTicketProcessor();

// Test 1: Urgency levels classification
console.log('=== TEST 1: Different Urgency Levels ===');
const urgencyScenarios = [
  {
    title: 'My computer is running slow',
    description: 'Computer has been slower than usual for the past few days',
    expectedCategory: 'hardware',
    expectedPriorityRange: ['low', 'medium'],
  },
  {
    title: 'Cannot access shared folder',
    description: 'Unable to connect to network drive with important files',
    expectedCategory: 'network',
    expectedPriorityRange: ['medium', 'high'],
  },
  {
    title: 'Security breach detected',
    description: 'Suspicious network activity and unauthorized access attempts',
    expectedCategory: 'security',
    expectedPriorityRange: ['high', 'critical'],
  },
];

for (const scenario of urgencyScenarios) {
  try {
    const ticket = {
      id: uuidv4(),
      title: scenario.title,
      description: scenario.description,
      createdAt: Date.now(),
    };

    console.log(`\n📝 Processing: "${scenario.title}"`);
    const result = await ticketProcessor.processTicket(ticket);
    
    console.log('Result:', {
      hasAiClassification: !!result.aiClassification,
      category: result.aiClassification?.category,
      priority: result.aiClassification?.priority,
      confidence: result.aiClassification?.confidence,
    });
    
    console.log('Expected:', {
      category: scenario.expectedCategory,
      priorityRange: scenario.expectedPriorityRange,
    });
    
    const categoryMatch = result.aiClassification?.category === scenario.expectedCategory;
    const priorityMatch = scenario.expectedPriorityRange.includes(result.aiClassification?.priority);
    
    console.log('Validation:', {
      categoryMatch,
      priorityMatch,
      valid: categoryMatch && priorityMatch
    });
    
  } catch (error) {
    console.error(`❌ Error processing "${scenario.title}":`, error.message);
  }
}

// Test 2: Similar tickets detection
console.log('\n\n=== TEST 2: Similar Tickets Detection ===');
try {
  // Create network tickets first
  const networkTickets = [
    { title: 'WiFi issues Building A', description: 'Wireless network connectivity problems' },
    { title: 'Internet slow Building A', description: 'Very slow internet speeds reported' },
    { title: 'Network printer offline Building A', description: 'Cannot connect to network printer' },
  ];

  console.log('Adding reference tickets to vector store...');
  for (const ticket of networkTickets) {
    const processed = await ticketProcessor.processTicket({
      id: uuidv4(),
      ...ticket,
      category: 'network',
      createdAt: Date.now(),
    });
    console.log(`Added: "${ticket.title}" - Success:`, !!processed);
  }

  // Process new related ticket
  const newTicket = {
    id: uuidv4(),
    title: 'Network connectivity issues Building A',
    description: 'Users unable to access network resources in Building A',
    category: 'network',
  };

  console.log('\nProcessing new ticket to find similar ones...');
  const result = await ticketProcessor.processTicket(newTicket);
  
  console.log('Result:', {
    hasDuplicateAnalysis: !!result.duplicateAnalysis,
    hasSimilarTickets: !!result.duplicateAnalysis?.similarTickets,
    similarTicketsCount: result.duplicateAnalysis?.similarTickets?.length || 0,
    similarTickets: result.duplicateAnalysis?.similarTickets
  });
  
} catch (error) {
  console.error('❌ Error in similar tickets test:', error.message);
}

// Test 3: Production readiness validation
console.log('\n\n=== TEST 3: Production Readiness Validation ===');
try {
  const productionValidationTicket = {
    id: uuidv4(),
    title: 'PRODUCTION VALIDATION: Critical System Failure',
    description: 'This is a comprehensive test to validate that Nova Synth AI escalation system is ready for production deployment. Testing all AI capabilities including classification, priority detection, duplicate analysis, and trend recognition.',
    category: 'software',
    priority: 'critical',
    location: 'Production Environment',
    requesterEmail: 'admin@novaverse.com',
    requesterName: 'System Administrator',
    createdAt: Date.now(),
    status: 'open',
  };

  console.log('Processing production validation ticket...');
  const startTime = Date.now();
  const result = await ticketProcessor.processTicket(productionValidationTicket);
  const endTime = Date.now();
  const processingTime = endTime - startTime;

  const validations = {
    'Ticket Processing': !!result,
    'AI Classification': !!result.aiClassification,
    'Category Detection': !!result.aiClassification?.category,
    'Priority Assignment': !!result.aiClassification?.priority,
    'Confidence Scoring': typeof result.aiClassification?.confidence === 'number',
    'Duplicate Analysis': result.duplicateAnalysis !== undefined,
    'Performance (<1s)': processingTime < 1000,
    'High Confidence': result.aiClassification?.confidence > 0.8,
  };

  console.log('\nProduction Validation Results:');
  Object.entries(validations).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });

  console.log('\nDetailed Results:', {
    processingTime: processingTime + 'ms',
    category: result.aiClassification?.category,
    priority: result.aiClassification?.priority,
    confidence: result.aiClassification?.confidence,
    duplicateAnalysis: !!result.duplicateAnalysis,
  });
  
  const allPassed = Object.values(validations).every(v => v);
  console.log(`\nOverall Production Readiness: ${allPassed ? '✅ READY' : '❌ NOT READY'}`);
  
} catch (error) {
  console.error('❌ Error in production readiness test:', error.message);
}

console.log('\n🔍 Debug analysis complete!');
