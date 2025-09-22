import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IntelligentTicketClassification } from '@components/ai/IntelligentTicketClassification';

const IntelligentClassificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ticketId = searchParams.get('ticketId');

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId) {
        setError('No ticket ID provided');
        setLoading(false);
        return;
      }

      try {
        // In production, fetch the actual ticket data
        const response = await fetch(`/api/v1/tickets/${ticketId}`);
        if (response.ok) {
          const ticket = await response.json();
          setTicketData(ticket);
        } else {
          throw new Error('Ticket not found');
        }
      } catch (err) {
        console.error('Failed to fetch ticket:', err);
        setError('Failed to load ticket data');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketId]);

  const handleClassificationComplete = (classification: any) => {
    console.log('Classification completed:', classification);
    // In production, this would update the ticket with the classification
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">Loading ticket data...</div>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-red-600">
            {error || 'No ticket data available'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <IntelligentTicketClassification
          ticketData={ticketData}
          onClassificationComplete={handleClassificationComplete}
        />
      </div>
    </div>
  );
};

export default IntelligentClassificationPage;
