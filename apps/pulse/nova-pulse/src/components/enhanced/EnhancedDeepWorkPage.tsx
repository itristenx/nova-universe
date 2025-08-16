import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { DeepWorkMode } from './DeepWorkMode';
import { EnhancedTicketLifecycle } from './EnhancedTicketLifecycle';
import { Tabs, Tab } from '@heroui/react';
import type { Ticket } from '../../types';

// Mock API function - replace with actual API call
const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
  // Mock ticket data
  const mockTickets: Ticket[] = [
    {
      id: 1,
      ticketId: 'T-001',
      title: 'Authentication service intermittent failures',
      priority: 'high',
      status: 'open',
      category: 'technical',
      subcategory: 'authentication',
      requestedBy: { id: 1, name: 'John Smith' },
      assignedTo: { id: 2, name: 'Current User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      slaRemaining: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
      vipWeight: 1,
    },
    {
      id: 2,
      ticketId: 'T-002',
      title: 'User cannot access dashboard after login',
      priority: 'medium',
      status: 'in-progress',
      category: 'access',
      subcategory: 'permissions',
      requestedBy: { id: 3, name: 'Jane Doe' },
      assignedTo: { id: 2, name: 'Current User' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
      slaRemaining: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    },
  ];

  return mockTickets.find((t) => t.ticketId === ticketId) || null;
};

interface DeepWorkSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  ticketsWorked: string[];
  notesCount: number;
  distractionsBlocked: number;
  productivityScore: number;
  focusBreaks: number;
  goalAchieved: boolean;
}

export const EnhancedDeepWorkPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => (ticketId ? getTicketById(ticketId) : null),
    enabled: !!ticketId,
  });

  const handleSessionEnd = (session: DeepWorkSession) => {
    console.log('Deep work session ended:', session);
    // Here you would typically save the session data to your backend
    // and potentially update productivity analytics
  };

  const handleStatusChange = (newStatus: string, comment?: string) => {
    console.log('Status change:', { ticketId: ticket?.ticketId, newStatus, comment });
    // Here you would update the ticket status via API
  };

  const handleCommentAdd = (comment: string) => {
    console.log('Comment added:', { ticketId: ticket?.ticketId, comment });
    // Here you would add the comment via API
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 14.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Error Loading Ticket</h3>
          <p className="text-gray-600">
            {error instanceof Error
              ? error.message
              : 'Something went wrong while loading the ticket.'}
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Ticket Not Found</h3>
          <p className="text-gray-600">The ticket with ID "{ticketId}" could not be found.</p>
        </div>
      </div>
    );
  }

  // If no ticketId provided, show standalone Deep Work Mode
  if (!ticketId) {
    return <DeepWorkMode onSessionEnd={handleSessionEnd} />;
  }

  // If ticketId provided, show tabbed interface with Deep Work + Lifecycle Management
  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <div className="flex items-center gap-3 px-6 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          title="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white/80 shadow-sm backdrop-blur dark:bg-gray-900/80"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">{ticket?.ticketId || 'Deep Work'}</h1>
      </div>
      <Tabs className="w-full p-6 pt-0">
        <Tab key="focus" title="Deep Work">
          <DeepWorkMode ticket={ticket} onSessionEnd={handleSessionEnd} />
        </Tab>
        <Tab key="lifecycle" title="Ticket Management">
          <div className="mx-auto max-w-4xl">
            <EnhancedTicketLifecycle
              ticket={ticket}
              onStatusChange={handleStatusChange}
              onCommentAdd={handleCommentAdd}
            />
          </div>
        </Tab>
      </Tabs>
    </motion.div>
  );
};
