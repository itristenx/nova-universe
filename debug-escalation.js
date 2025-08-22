/**
 * Debug the failing AI escalation detection test
 */

import { CosmoTicketProcessor } from './apps/api/services/cosmo-ticket-processor.js';
import { v4 as uuidv4 } from 'uuid';

async function debugEscalationDetection() {
  console.log('Debugging AI escalation detection...');
  
  const ticketProcessor = new CosmoTicketProcessor({
    enableAI: true,
    enableTrendAnalysis: true,
    enableDuplicateDetection: true,
    duplicateThreshold: 0.8,
    autoClassifyPriority: true,
    autoMatchCustomers: true,
  });

  const testTicket = {
    id: uuidv4(),
    title: 'Critical Network Infrastructure Failure',
    description: 'Complete network outage affecting Buildings A, B, and C. All internet, WiFi, and VoIP services are down. Estimated 500+ users affected.',
    category: 'network',
    priority: 'critical',
    status: 'open',
    location: 'Buildings A, B, C',
    requesterEmail: 'test.tech@example.com',
    createdAt: Date.now(),
  };

  try {
    const processedTicket = await ticketProcessor.processTicket(testTicket);
    
    console.log('✅ Ticket processed');
    console.log('- aiClassification present:', !!processedTicket.aiClassification);
    
    if (processedTicket.aiClassification) {
      console.log('- category:', processedTicket.aiClassification.category);
      console.log('- priority:', processedTicket.aiClassification.priority);
      console.log('- confidence:', processedTicket.aiClassification.confidence || processedTicket.aiClassification.categoryConfidence);
      
      console.log('\nTest assertions:');
      console.log('- category === "network":', processedTicket.aiClassification.category === 'network');
      console.log('- priority in ["high", "critical"]:', ['high', 'critical'].includes(processedTicket.aiClassification.priority));
      
      const confidence = processedTicket.aiClassification.confidence || processedTicket.aiClassification.categoryConfidence;
      console.log('- confidence > 0.7:', confidence > 0.7, `(actual: ${confidence})`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugEscalationDetection();
