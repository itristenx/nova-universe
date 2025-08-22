/**
 * Quick debug test for CosmoTicketProcessor
 */

import { CosmoTicketProcessor } from './apps/api/services/cosmo-ticket-processor.js';

async function debugProcessor() {
  console.log('Debugging CosmoTicketProcessor...');
  
  try {
    const ticketProcessor = new CosmoTicketProcessor({
      enableAI: true,
      enableTrendAnalysis: true,
      enableDuplicateDetection: true,
      duplicateThreshold: 0.8,
      autoClassifyPriority: true,
      autoMatchCustomers: true,
    });

    console.log('✅ Processor initialized');

    const testTicket = {
      title: 'Critical Network Infrastructure Failure',
      description: 'Complete network outage affecting Buildings A, B, and C. All internet, WiFi, and VoIP services are down. Estimated 500+ users affected.',
      category: 'network',
      priority: 'critical',
      status: 'open',
      location: 'Buildings A, B, C',
      requesterEmail: 'test.tech@example.com',
      createdAt: Date.now(),
    };

    console.log('Processing test ticket...');
    const result = await ticketProcessor.processTicket(testTicket);
    
    console.log('✅ Processed ticket result:');
    console.log('- aiClassification:', result.aiClassification ? 'PRESENT' : 'MISSING');
    if (result.aiClassification) {
      console.log('  - category:', result.aiClassification.category);
      console.log('  - priority:', result.aiClassification.priority);
      console.log('  - confidence:', result.aiClassification.categoryConfidence);
    }
    
    console.log('Result keys:', Object.keys(result));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugProcessor();
