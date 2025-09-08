import React from 'react';
import { IntelligentTicketClassification } from '@components/ai/IntelligentTicketClassification';

// This is a demo/preview page - in production this would receive real ticket data
const IntelligentClassificationPage: React.FC = () => {
  const handleClassificationComplete = (classification: any) => {
    console.log('Classification completed:', classification);
  };

  // In production, this would get real ticket data from props or API
  const sampleTicketData = {
    id: 'SAMPLE',
    title: 'Sample Ticket for AI Classification Demo',
    subject: 'Sample Ticket for AI Classification Demo',
    description: 'This is a sample ticket to demonstrate AI classification capabilities.',
    requester: 'Demo User',
    requesterId: 'demo@example.com',
    channel: 'demo' as const,
    createdAt: new Date(),
    status: 'new' as const,
    urgency: 'medium' as const,
    impact: 'medium' as const,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This is a preview of the AI ticket classification feature. In production, 
            this would process real ticket data using machine learning models.
          </p>
        </div>
        <IntelligentTicketClassification
          ticketData={sampleTicketData}
          onClassificationComplete={handleClassificationComplete}
        />
      </div>
    </div>
  );
};

export default IntelligentClassificationPage;
