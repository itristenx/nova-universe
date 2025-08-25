import React from 'react';
import { IntelligentTicketClassification } from '@components/ai/IntelligentTicketClassification';

const mockTicketData = {
  id: 'TICKET-001',
  title: 'Unable to access company email',
  subject: 'Unable to access company email',
  description:
    'I cannot log into my Outlook account. Getting "invalid credentials" error message when trying to sign in. This started happening this morning after the system maintenance window.',
  requester: 'John Smith',
  requesterId: 'john.smith@company.com',
  channel: 'email' as const,
  createdAt: new Date(),
  status: 'new' as const,
  urgency: 'medium' as const,
  impact: 'high' as const,
};

const IntelligentClassificationPage: React.FC = () => {
  const handleClassificationComplete = (classification: any) => {
    console.log('Classification completed:', classification);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <IntelligentTicketClassification
          ticketData={mockTicketData}
          onClassificationComplete={handleClassificationComplete}
        />
      </div>
    </div>
  );
};

export default IntelligentClassificationPage;
