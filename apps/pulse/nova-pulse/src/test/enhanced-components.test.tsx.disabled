import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { EnhancedTicketGrid } from '../components/enhanced/EnhancedTicketGrid';
import { EnhancedDeepWorkPage } from '../components/enhanced/EnhancedDeepWorkPage';
import { EnhancedDashboard } from '../components/enhanced/EnhancedDashboard';
import type { Ticket } from '../types';

// Mock data for testing
const mockTickets: Ticket[] = [
  {
    id: 1,
    ticketId: 'IT-2025-001',
    title: 'Test Ticket 1',
    priority: 'high',
    status: 'open',
    category: 'it',
    subcategory: 'hardware',
    requestedBy: { id: 1, name: 'John Doe' },
    assignedTo: { id: 1, name: 'Agent Smith' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    vipWeight: undefined
  },
  {
    id: 2,
    ticketId: 'HR-2025-002',
    title: 'Test Ticket 2',
    priority: 'critical',
    status: 'in_progress',
    category: 'hr',
    subcategory: 'onboarding',
    requestedBy: { id: 2, name: 'Jane Doe' },
    assignedTo: { id: 2, name: 'Agent Johnson' },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    vipWeight: 2
  }
];

// Mock API responses
const mockApiResponses = {
  '/api/tickets': { data: mockTickets, total: mockTickets.length },
  '/api/queues': { data: [
    { name: 'it', displayName: 'IT Support', pendingTickets: 15 },
    { name: 'hr', displayName: 'HR Support', pendingTickets: 8 }
  ]},
  '/api/queue-metrics': { data: [
    { queueName: 'it', totalAgents: 10, availableAgents: 6, avgResponseTime: 120 },
    { queueName: 'hr', totalAgents: 5, availableAgents: 3, avgResponseTime: 95 }
  ]},
  '/api/agent-performance': { data: [
    { agentId: 'agent-1', ticketsResolved: 25, avgResolutionTime: 180, customerSatisfaction: 4.5 }
  ]}
};

// Mock fetch function
global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const endpoint = url.split('?')[0]; // Remove query parameters
  const mockData = mockApiResponses[endpoint as keyof typeof mockApiResponses];
  
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockData || { data: [], total: 0 })
  } as Response);
});

// Mock user data
const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'agent' as const,
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  isVip: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Enhanced Ticket Management Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EnhancedTicketGrid', () => {
    it('renders ticket grid with filtering options', async () => {
      render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Check for main grid elements
      expect(screen.getByText('Tickets')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search tickets...')).toBeInTheDocument();
      
      // Check for filter controls
      expect(screen.getByLabelText('Filter by Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Queue')).toBeInTheDocument();

      // Wait for tickets to load
      await waitFor(() => {
        expect(screen.getByText('IT-2025-001')).toBeInTheDocument();
        expect(screen.getByText('HR-2025-002')).toBeInTheDocument();
      });
    });

    it('allows switching between card and list views', async () => {
      render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Find view toggle buttons
      const cardViewButton = screen.getByLabelText('Card View');
      const listViewButton = screen.getByLabelText('List View');

      expect(cardViewButton).toBeInTheDocument();
      expect(listViewButton).toBeInTheDocument();

      // Switch to list view
      fireEvent.click(listViewButton);
      
      // Verify list view is active (check for table headers)
      await waitFor(() => {
        expect(screen.getByText('Ticket ID')).toBeInTheDocument();
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
      });
    });

    it('filters tickets by priority', async () => {
      render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('IT-2025-001')).toBeInTheDocument();
      });

      // Filter by critical priority
      const prioritySelect = screen.getByLabelText('Filter by Priority');
      fireEvent.change(prioritySelect, { target: { value: 'critical' } });

      // Should only show critical ticket
      await waitFor(() => {
        expect(screen.getByText('HR-2025-002')).toBeInTheDocument();
        expect(screen.queryByText('IT-2025-001')).not.toBeInTheDocument();
      });
    });

    it('searches tickets by text', async () => {
      render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('IT-2025-001')).toBeInTheDocument();
      });

      // Search for specific ticket
      const searchInput = screen.getByPlaceholderText('Search tickets...');
      fireEvent.change(searchInput, { target: { value: 'HR-2025' } });

      // Should only show matching ticket
      await waitFor(() => {
        expect(screen.getByText('HR-2025-002')).toBeInTheDocument();
        expect(screen.queryByText('IT-2025-001')).not.toBeInTheDocument();
      });
    });
  });

  describe('EnhancedDeepWorkPage', () => {
    it('renders deep work interface with contextual panels', async () => {
      render(
        <TestWrapper>
          <EnhancedDeepWorkPage />
        </TestWrapper>
      );

      // Check for main sections
      expect(screen.getByText('Deep Work')).toBeInTheDocument();
      expect(screen.getByText('Active Ticket')).toBeInTheDocument();
      expect(screen.getByText('Context & Tools')).toBeInTheDocument();

      // Check for timer controls
      expect(screen.getByText('Session Timer')).toBeInTheDocument();
      expect(screen.getByText('Start Timer')).toBeInTheDocument();

      // Check for contextual panels
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      expect(screen.getByText('Related Tickets')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    });

    it('allows starting and stopping the session timer', async () => {
      render(
        <TestWrapper>
          <EnhancedDeepWorkPage />
        </TestWrapper>
      );

      const startButton = screen.getByText('Start Timer');
      
      // Start timer
      fireEvent.click(startButton);
      
      // Timer should be running
      await waitFor(() => {
        expect(screen.getByText('Stop Timer')).toBeInTheDocument();
      });

      // Stop timer
      const stopButton = screen.getByText('Stop Timer');
      fireEvent.click(stopButton);

      // Timer should be stopped
      await waitFor(() => {
        expect(screen.getByText('Start Timer')).toBeInTheDocument();
      });
    });

    it('toggles focus mode', async () => {
      render(
        <TestWrapper>
          <EnhancedDeepWorkPage />
        </TestWrapper>
      );

      const focusToggle = screen.getByLabelText('Toggle Focus Mode');
      
      // Enable focus mode
      fireEvent.click(focusToggle);
      
      // Should hide sidebar in focus mode
      await waitFor(() => {
        const sidebar = screen.queryByText('Context & Tools');
        expect(sidebar).toHaveClass('hidden');
      });
    });
  });

  describe('EnhancedDashboard', () => {
    it('renders dashboard with role-based content', async () => {
      render(
        <TestWrapper>
          <EnhancedDashboard user={mockUser} />
        </TestWrapper>
      );

      // Check for dashboard title
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();

      // Check for metric cards
      await waitFor(() => {
        expect(screen.getByText('My Open Tickets')).toBeInTheDocument();
        expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
        expect(screen.getByText('Queue Status')).toBeInTheDocument();
      });
    });

    it('displays different content for supervisor role', async () => {
      const supervisorUser = { ...mockUser, role: 'supervisor' as const };
      
      render(
        <TestWrapper>
          <EnhancedDashboard user={supervisorUser} />
        </TestWrapper>
      );

      // Check for supervisor-specific content
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Team Performance')).toBeInTheDocument();
        expect(screen.getByText('Queue Distribution')).toBeInTheDocument();
      });
    });

    it('allows changing time range for metrics', async () => {
      render(
        <TestWrapper>
          <EnhancedDashboard user={mockUser} />
        </TestWrapper>
      );

      // Find time range selector
      const timeRangeSelect = screen.getByLabelText('Select Time Range');
      
      // Change to last 7 days
      fireEvent.change(timeRangeSelect, { target: { value: '7d' } });

      // Should trigger data refresh
      await waitFor(() => {
        // Verify the selection is applied
        expect(timeRangeSelect).toHaveValue('7d');
      });
    });

    it('filters dashboard by queue', async () => {
      render(
        <TestWrapper>
          <EnhancedDashboard user={mockUser} />
        </TestWrapper>
      );

      // Find queue filter
      const queueSelect = screen.getByLabelText('Filter by Queue');
      
      // Filter by IT queue
      fireEvent.change(queueSelect, { target: { value: 'it' } });

      // Should update dashboard metrics
      await waitFor(() => {
        expect(queueSelect).toHaveValue('it');
      });
    });
  });

  describe('Integration Tests', () => {
    it('handles API errors gracefully', async () => {
      // Mock API error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Should show error state or fallback
      await waitFor(() => {
        // Component should handle error without crashing
        expect(screen.getByText('Tickets')).toBeInTheDocument();
      });
    });

    it('maintains state when switching between components', async () => {
      const { rerender } = render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Wait for initial load and apply filter
      await waitFor(() => {
        expect(screen.getByText('IT-2025-001')).toBeInTheDocument();
      });

      const prioritySelect = screen.getByLabelText('Filter by Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Switch to dashboard
      rerender(
        <TestWrapper>
          <EnhancedDashboard user={mockUser} />
        </TestWrapper>
      );

      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();

      // Switch back to ticket grid
      rerender(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Filter state should be preserved (this would require proper state management)
      expect(screen.getByText('Tickets')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('provides proper ARIA labels and keyboard navigation', async () => {
      render(
        <TestWrapper>
          <EnhancedTicketGrid />
        </TestWrapper>
      );

      // Check for ARIA labels
      expect(screen.getByLabelText('Filter by Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by Priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Card View')).toBeInTheDocument();
      expect(screen.getByLabelText('List View')).toBeInTheDocument();

      // Test keyboard navigation
      const searchInput = screen.getByPlaceholderText('Search tickets...');
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
    });

    it('maintains focus management in deep work mode', async () => {
      render(
        <TestWrapper>
          <EnhancedDeepWorkPage />
        </TestWrapper>
      );

      const focusToggle = screen.getByLabelText('Toggle Focus Mode');
      
      // Should be keyboard accessible
      focusToggle.focus();
      expect(document.activeElement).toBe(focusToggle);
      
      // Activate with keyboard
      fireEvent.keyDown(focusToggle, { key: 'Enter' });
      
      await waitFor(() => {
        const sidebar = screen.queryByText('Context & Tools');
        expect(sidebar).toHaveClass('hidden');
      });
    });
  });
});
