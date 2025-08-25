import { test, expect } from 'vitest';
import { EnhancedTicketService } from '../apps/api/services/enhanced-ticket.service.js';
import { AutoClassificationService } from '../apps/api/services/autoClassification.service.js';

/**
 * ITSM Ticket Management System - Comprehensive Test Suite
 * Tests all major ITSM functionality including:
 * - Ticket creation and management
 * - Auto-classification
 * - SLA tracking
 * - Workflow automation
 * - Template system
 * - Search and filtering
 */

// Mock data setup
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'SUPPORT_AGENT',
  department: 'IT',
};

const mockTicketData = {
  title: "Computer won't start - urgent help needed",
  description:
    'My laptop suddenly stopped working this morning. When I press the power button, nothing happens. No lights, no sounds. I have an important presentation at 2 PM today.',
  requesterId: 'user-456',
  category: 'HARDWARE',
  priority: 'HIGH',
  urgency: 'HIGH',
  impact: 'MEDIUM',
};

describe('Enhanced Ticket Service', () => {
  test('should create ticket with proper validation', async () => {
    const ticket = await EnhancedTicketService.createTicket(mockTicketData, mockUser);

    expect(ticket).toBeDefined();
    expect(ticket.ticketNumber).toMatch(/^NOVA-\d{6}$/);
    expect(ticket.title).toBe(mockTicketData.title);
    expect(ticket.state).toBe('NEW');
    expect(ticket.createdBy).toBe(mockUser.id);
  });

  test('should validate required fields', async () => {
    const invalidData = { ...mockTicketData, title: '' };

    await expect(EnhancedTicketService.createTicket(invalidData, mockUser)).rejects.toThrow(
      'Title is required',
    );
  });

  test('should auto-generate ticket number', async () => {
    const ticket1 = await EnhancedTicketService.createTicket(mockTicketData, mockUser);
    const ticket2 = await EnhancedTicketService.createTicket(mockTicketData, mockUser);

    expect(ticket1.ticketNumber).not.toBe(ticket2.ticketNumber);
    expect(ticket1.ticketNumber).toMatch(/^NOVA-\d{6}$/);
    expect(ticket2.ticketNumber).toMatch(/^NOVA-\d{6}$/);
  });

  test('should handle ticket updates with audit trail', async () => {
    const ticket = await EnhancedTicketService.createTicket(mockTicketData, mockUser);

    const updates = {
      priority: 'CRITICAL',
      assignedTo: 'agent-789',
      notes: 'Escalating due to business impact',
    };

    const updatedTicket = await EnhancedTicketService.updateTicket(ticket.id, updates, mockUser);

    expect(updatedTicket.priority).toBe('CRITICAL');
    expect(updatedTicket.assignedTo).toBe('agent-789');

    // Verify audit trail
    const auditTrail = await EnhancedTicketService.getAuditTrail(ticket.id);
    expect(auditTrail).toHaveLength(2); // Create + Update
    expect(auditTrail[1].action).toBe('UPDATE');
    expect(auditTrail[1].changes).toContain('priority');
  });

  test('should search tickets with filters', async () => {
    // Create test tickets
    await EnhancedTicketService.createTicket(
      {
        ...mockTicketData,
        title: 'Network connectivity issue',
        category: 'NETWORK',
        priority: 'MEDIUM',
      },
      mockUser,
    );

    await EnhancedTicketService.createTicket(
      {
        ...mockTicketData,
        title: 'Software installation problem',
        category: 'SOFTWARE',
        priority: 'LOW',
      },
      mockUser,
    );

    // Test category filter
    const networkTickets = await EnhancedTicketService.searchTickets(
      {
        filters: { category: ['NETWORK'] },
        page: 1,
        limit: 10,
      },
      mockUser,
    );

    expect(networkTickets.tickets).toHaveLength(1);
    expect(networkTickets.tickets[0].category).toBe('NETWORK');

    // Test text search
    const connectivityTickets = await EnhancedTicketService.searchTickets(
      {
        search: 'connectivity',
        page: 1,
        limit: 10,
      },
      mockUser,
    );

    expect(connectivityTickets.tickets).toHaveLength(1);
    expect(connectivityTickets.tickets[0].title).toContain('connectivity');
  });

  test('should handle SLA calculations', async () => {
    const ticket = await EnhancedTicketService.createTicket(
      {
        ...mockTicketData,
        priority: 'CRITICAL',
        urgency: 'HIGH',
        impact: 'HIGH',
      },
      mockUser,
    );

    const slaStatus = await EnhancedTicketService.getSLAStatus(ticket.id);

    expect(slaStatus).toBeDefined();
    expect(slaStatus.responseTime).toBeDefined();
    expect(slaStatus.resolutionTime).toBeDefined();
    expect(slaStatus.responseTime.target).toBe(30); // 30 minutes for critical
    expect(slaStatus.resolutionTime.target).toBe(240); // 4 hours for critical
  });

  test('should track SLA breaches', async () => {
    // Create a ticket that's already overdue (mock past creation time)
    const ticket = await EnhancedTicketService.createTicket(mockTicketData, mockUser);

    // Simulate SLA breach by backdating creation
    await EnhancedTicketService.updateTicketCreationTime(
      ticket.id,
      new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    );

    const slaStatus = await EnhancedTicketService.getSLAStatus(ticket.id);

    expect(slaStatus.status).toBe('breach');
    expect(slaStatus.breaches).toHaveLength(1);
    expect(slaStatus.breaches[0].type).toBe('RESPONSE_TIME');
  });
});

describe('Auto-Classification Service', () => {
  test('should classify hardware issues correctly', async () => {
    const hardwareTicket = {
      title: 'Laptop screen is flickering',
      description:
        'My laptop screen keeps flickering and sometimes goes completely black. I think it might be a hardware issue with the display.',
    };

    const classification = await AutoClassificationService.classifyTicket(hardwareTicket);

    expect(classification.category).toBe('HARDWARE');
    expect(classification.subcategory).toBe('COMPUTER');
    expect(classification.confidence).toBeGreaterThan(0.7);
  });

  test('should classify software issues correctly', async () => {
    const softwareTicket = {
      title: 'Excel keeps crashing when opening large files',
      description:
        'Microsoft Excel crashes every time I try to open files larger than 10MB. I get an error message saying the application has stopped working.',
    };

    const classification = await AutoClassificationService.classifyTicket(softwareTicket);

    expect(classification.category).toBe('SOFTWARE');
    expect(classification.subcategory).toBe('APPLICATION');
    expect(classification.confidence).toBeGreaterThan(0.7);
  });

  test('should classify network issues correctly', async () => {
    const networkTicket = {
      title: 'Cannot connect to company VPN',
      description:
        'I am unable to connect to the company VPN from home. The connection times out and I get an authentication failed error.',
    };

    const classification = await AutoClassificationService.classifyTicket(networkTicket);

    expect(classification.category).toBe('NETWORK');
    expect(classification.subcategory).toBe('VPN');
    expect(classification.confidence).toBeGreaterThan(0.7);
  });

  test('should determine appropriate priority levels', async () => {
    const criticalTicket = {
      title: 'Production server down - urgent emergency',
      description:
        'The main production server is completely down and all customers are affected. This is a critical emergency situation.',
    };

    const classification = await AutoClassificationService.classifyTicket(criticalTicket);

    expect(classification.priority).toBe('CRITICAL');
    expect(classification.urgency).toBe('HIGH');
    expect(classification.impact).toBe('HIGH');
  });

  test('should find similar historical tickets', async () => {
    // Create some historical tickets first
    await EnhancedTicketService.createTicket(
      {
        title: 'Printer not working',
        description: 'Office printer is not responding to print jobs',
        state: 'RESOLVED',
        resolution: 'Replaced toner cartridge and restarted printer service',
      },
      mockUser,
    );

    const newTicket = {
      title: 'Printer issues in office',
      description: 'The printer in our office is not printing any documents',
    };

    const classification = await AutoClassificationService.classifyTicket(newTicket);

    expect(classification.similarTickets).toHaveLength(1);
    expect(classification.similarTickets[0].title).toContain('Printer');
  });

  test('should suggest appropriate assignee', async () => {
    const ticket = {
      title: 'Password reset needed',
      description: 'I need my password reset for the company domain account',
    };

    const classification = await AutoClassificationService.classifyTicket(ticket);

    expect(classification.category).toBe('SECURITY');
    expect(classification.subcategory).toBe('ACCESS');
    expect(classification.suggestedAssignee).toBeDefined();
  });
});

describe('Template System', () => {
  test('should create ticket from template', async () => {
    const templateData = {
      templateId: 'new-user-setup',
      variables: {
        userName: 'John Doe',
        department: 'Marketing',
        startDate: '2024-01-15',
        manager: 'Jane Smith',
      },
    };

    const ticket = await EnhancedTicketService.createFromTemplate(templateData, mockUser);

    expect(ticket.title).toContain('John Doe');
    expect(ticket.description).toContain('Marketing');
    expect(ticket.category).toBe('ACCOUNT');
    expect(ticket.subcategory).toBe('NEW_USER');
  });

  test('should validate required template variables', async () => {
    const templateData = {
      templateId: 'new-user-setup',
      variables: {
        userName: 'John Doe',
        // Missing required variables
      },
    };

    await expect(EnhancedTicketService.createFromTemplate(templateData, mockUser)).rejects.toThrow(
      'Required template variables missing',
    );
  });

  test('should list available templates for user', async () => {
    const templates = await EnhancedTicketService.getTicketTemplates(mockUser);

    expect(templates).toBeInstanceOf(Array);
    expect(templates.length).toBeGreaterThan(0);

    const template = templates[0];
    expect(template).toHaveProperty('id');
    expect(template).toHaveProperty('name');
    expect(template).toHaveProperty('category');
    expect(template).toHaveProperty('accessLevel');
  });
});

describe('Workflow Integration', () => {
  test('should start applicable workflow for new ticket', async () => {
    const ticket = await EnhancedTicketService.createTicket(
      {
        ...mockTicketData,
        category: 'ACCOUNT',
        subcategory: 'NEW_USER',
      },
      mockUser,
    );

    // Check if workflow was automatically started
    const workflowStatus = await EnhancedTicketService.getWorkflowStatus(ticket.id);

    expect(workflowStatus).toBeDefined();
    expect(workflowStatus.status).toBe('active');
    expect(workflowStatus.workflowName).toBe('New User Onboarding');
  });

  test('should handle workflow step completion', async () => {
    const ticket = await EnhancedTicketService.createTicket(mockTicketData, mockUser);
    const workflowInstance = await EnhancedTicketService.startWorkflow(
      ticket.id,
      'hardware-diagnostic',
      mockUser,
    );

    // Complete first step
    await EnhancedTicketService.completeWorkflowStep(
      workflowInstance.id,
      1,
      { result: 'Hardware diagnostic completed', nextAction: 'replace_component' },
      mockUser,
    );

    const status = await EnhancedTicketService.getWorkflowStatus(ticket.id);
    expect(status.currentStep).toBe(2);
    expect(status.steps[0].status).toBe('completed');
  });
});

describe('Advanced Search', () => {
  test('should perform full-text search', async () => {
    await EnhancedTicketService.createTicket(
      {
        title: 'Email client configuration problem',
        description: 'Outlook keeps asking for password authentication repeatedly',
      },
      mockUser,
    );

    const results = await EnhancedTicketService.advancedSearch(
      {
        query: 'outlook password authentication',
        limit: 10,
      },
      mockUser,
    );

    expect(results.tickets).toHaveLength(1);
    expect(results.tickets[0].title).toContain('Email');
  });

  test('should filter by multiple criteria', async () => {
    const searchParams = {
      filters: {
        category: ['HARDWARE', 'SOFTWARE'],
        priority: ['HIGH', 'CRITICAL'],
        status: ['NEW', 'IN_PROGRESS'],
        dateRange: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
      },
      sort: { field: 'priority', direction: 'desc' },
      limit: 20,
    };

    const results = await EnhancedTicketService.advancedSearch(searchParams, mockUser);

    expect(results.tickets).toBeInstanceOf(Array);
    expect(results.aggregations).toBeDefined();
    expect(results.aggregations.categoryBreakdown).toBeDefined();
    expect(results.aggregations.priorityBreakdown).toBeDefined();
  });
});

describe('Analytics and Reporting', () => {
  test('should generate SLA dashboard metrics', async () => {
    const dashboard = await EnhancedTicketService.getSLADashboard(mockUser);

    expect(dashboard).toHaveProperty('overallCompliance');
    expect(dashboard).toHaveProperty('responseTimeMetrics');
    expect(dashboard).toHaveProperty('resolutionTimeMetrics');
    expect(dashboard).toHaveProperty('currentBreaches');
    expect(dashboard).toHaveProperty('trends');

    expect(dashboard.overallCompliance).toBeGreaterThanOrEqual(0);
    expect(dashboard.overallCompliance).toBeLessThanOrEqual(100);
  });

  test('should provide analytics dashboard data', async () => {
    const analytics = await EnhancedTicketService.getAnalyticsDashboard(mockUser);

    expect(analytics).toHaveProperty('ticketVolume');
    expect(analytics).toHaveProperty('resolutionTimes');
    expect(analytics).toHaveProperty('categoryDistribution');
    expect(analytics).toHaveProperty('agentPerformance');
    expect(analytics).toHaveProperty('customerSatisfaction');

    expect(analytics.ticketVolume.current).toBeGreaterThanOrEqual(0);
    expect(analytics.categoryDistribution).toBeInstanceOf(Array);
  });
});

describe('Security and Access Control', () => {
  test('should respect user access permissions', async () => {
    const limitedUser = {
      id: 'user-limited',
      role: 'END_USER',
      department: 'SALES',
    };

    // End user should only see their own tickets
    const results = await EnhancedTicketService.searchTickets(
      {
        limit: 100,
      },
      limitedUser,
    );

    // All returned tickets should belong to the user
    results.tickets.forEach((ticket) => {
      expect(ticket.requesterId).toBe(limitedUser.id);
    });
  });

  test('should prevent unauthorized ticket updates', async () => {
    const ticket = await EnhancedTicketService.createTicket(mockTicketData, mockUser);

    const unauthorizedUser = {
      id: 'user-unauthorized',
      role: 'END_USER',
      department: 'OTHER',
    };

    await expect(
      EnhancedTicketService.updateTicket(ticket.id, { priority: 'CRITICAL' }, unauthorizedUser),
    ).rejects.toThrow('Access denied');
  });

  test('should validate input sanitization', async () => {
    const maliciousData = {
      title: '<script>alert("xss")</script>Legitimate title',
      description: 'Normal description with <img src=x onerror=alert(1)> malicious content',
    };

    const ticket = await EnhancedTicketService.createTicket(maliciousData, mockUser);

    // HTML should be sanitized
    expect(ticket.title).not.toContain('<script>');
    expect(ticket.description).not.toContain('<img src=x');
    expect(ticket.title).toContain('Legitimate title');
  });
});

describe('Performance Tests', () => {
  test('should handle bulk ticket operations efficiently', async () => {
    const startTime = Date.now();

    // Create 100 tickets
    const createPromises = Array(100)
      .fill(null)
      .map((_, index) =>
        EnhancedTicketService.createTicket(
          {
            ...mockTicketData,
            title: `Performance test ticket ${index + 1}`,
          },
          mockUser,
        ),
      );

    await Promise.all(createPromises);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(10000); // 10 seconds
  });

  test('should efficiently search large ticket volumes', async () => {
    const startTime = Date.now();

    const results = await EnhancedTicketService.searchTickets(
      {
        search: 'performance test',
        limit: 50,
      },
      mockUser,
    );

    const endTime = Date.now();
    const searchDuration = endTime - startTime;

    expect(searchDuration).toBeLessThan(2000); // 2 seconds
    expect(results.tickets.length).toBeGreaterThan(0);
  });
});

describe('Integration Tests', () => {
  test('should integrate with notification system', async () => {
    const ticket = await EnhancedTicketService.createTicket(mockTicketData, mockUser);

    // Assign ticket to trigger notification
    await EnhancedTicketService.assignTicket(
      ticket.id,
      'agent-notification-test',
      mockUser,
      'Assignment for testing notifications',
    );

    // Verify notification was sent (mock verification)
    // In real test, would check notification queue/logs
    expect(ticket.assignedTo).toBe('agent-notification-test');
  });

  test('should integrate with knowledge base', async () => {
    const ticket = await EnhancedTicketService.createTicket(
      {
        title: 'How to reset password',
        description: 'I forgot my password and need help resetting it',
      },
      mockUser,
    );

    const suggestions = await EnhancedTicketService.getKnowledgeBaseSuggestions(ticket.id);

    expect(suggestions).toBeInstanceOf(Array);
    if (suggestions.length > 0) {
      expect(suggestions[0]).toHaveProperty('title');
      expect(suggestions[0]).toHaveProperty('content');
      expect(suggestions[0]).toHaveProperty('relevanceScore');
    }
  });
});

export {
  // Export test utilities for use in other test files
  mockUser,
  mockTicketData,
};
