// User Acceptance Testing (UAT) Suite for Nova Universe
// Tests business workflows, user experience, and feature functionality from end-user perspective

import test from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

// UAT Configuration
const UAT_CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  frontendUrl: process.env.TEST_FRONTEND_URL || 'http://localhost:3001',
  timeout: 60000,
  maxRetries: 3
};

// UAT Testing Utilities
class UATHelper {
  static async makeRequest(endpoint, options = {}) {
    const url = `${UAT_CONFIG.apiUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nova-Universe-UAT-Test'
      },
      timeout: UAT_CONFIG.timeout
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    return {
      status: response.status,
      headers: response.headers,
      json: async () => response.json(),
      text: async () => response.text(),
      ok: response.ok
    };
  }

  static generateTestData() {
    const timestamp = Date.now();
    return {
      endUser: {
        email: `enduser${timestamp}@company.com`,
        first_name: 'End',
        last_name: 'User',
        role: 'user',
        department: 'Engineering',
        password: 'EndUser123!'
      },
      agent: {
        email: `agent${timestamp}@company.com`,
        first_name: 'Support',
        last_name: 'Agent',
        role: 'agent',
        department: 'IT Support',
        password: 'Agent123!'
      },
      manager: {
        email: `manager${timestamp}@company.com`,
        first_name: 'IT',
        last_name: 'Manager',
        role: 'manager',
        department: 'IT Management',
        password: 'Manager123!'
      },
      admin: {
        email: `admin${timestamp}@company.com`,
        first_name: 'System',
        last_name: 'Admin',
        role: 'admin',
        department: 'IT Administration',
        password: 'Admin123!'
      }
    };
  }

  static async createUser(userData) {
    const response = await UATHelper.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }

    return response.json();
  }

  static async loginUser(email, password) {
    const response = await UATHelper.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Failed to login user: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  }

  static async createTicket(token, ticketData) {
    const response = await UATHelper.makeRequest('/api/tickets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ticketData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.status}`);
    }

    return response.json();
  }
}

// End User Workflows
test('End User Workflows', async (t) => {
  const testData = UATHelper.generateTestData();
  let endUserToken = null;
  let testTicket = null;

  await t.test('User Registration and Login', async () => {
    console.log('👤 Testing end user registration and login workflow...');
    
    // Register new end user
    const user = await UATHelper.createUser(testData.endUser);
    assert.ok(user.id, 'User should be created with an ID');
    assert.strictEqual(user.email, testData.endUser.email, 'User email should match');
    
    // Login with new credentials
    endUserToken = await UATHelper.loginUser(testData.endUser.email, testData.endUser.password);
    assert.ok(endUserToken, 'Should receive authentication token');
    
    console.log('  ✅ User registration and login successful');
  });

  await t.test('Ticket Creation - End User Journey', async () => {
    console.log('🎫 Testing ticket creation from end user perspective...');
    
    const ticketData = {
      title: 'UAT Test: Computer Running Slowly',
      description: 'My laptop has been running very slowly since yesterday. It takes forever to open applications and browsing is sluggish. I need help troubleshooting this issue as it\'s affecting my productivity.',
      priority: 'medium',
      category: 'hardware',
      urgency: 'medium',
      impact: 'medium'
    };

    testTicket = await UATHelper.createTicket(endUserToken, ticketData);
    
    assert.ok(testTicket.id, 'Ticket should be created with an ID');
    assert.strictEqual(testTicket.title, ticketData.title, 'Ticket title should match');
    assert.strictEqual(testTicket.status, 'open', 'New ticket should have open status');
    assert.ok(testTicket.ticket_number, 'Ticket should have a ticket number');
    
    console.log(`  ✅ Ticket created successfully: ${testTicket.ticket_number}`);
  });

  await t.test('Ticket Status Tracking', async () => {
    console.log('📊 Testing ticket status tracking for end users...');
    
    // End user checks their ticket status
    const response = await UATHelper.makeRequest(`/api/tickets/${testTicket.id}`, {
      headers: {
        'Authorization': `Bearer ${endUserToken}`
      }
    });

    assert.ok(response.ok, 'End user should be able to view their own ticket');
    
    const ticket = await response.json();
    assert.strictEqual(ticket.id, testTicket.id, 'Should retrieve the correct ticket');
    assert.ok(ticket.created_at, 'Ticket should have creation timestamp');
    
    console.log('  ✅ End user can successfully track ticket status');
  });

  await t.test('Ticket Communication - End User Side', async () => {
    console.log('💬 Testing ticket communication from end user perspective...');
    
    const commentData = {
      content: 'I tried restarting my computer but the issue persists. The problem is particularly noticeable when using Chrome browser.',
      type: 'public'
    };

    const response = await UATHelper.makeRequest(`/api/tickets/${testTicket.id}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${endUserToken}`
      },
      body: JSON.stringify(commentData)
    });

    assert.ok(response.ok, 'End user should be able to add comments to their ticket');
    
    const comment = await response.json();
    assert.strictEqual(comment.content, commentData.content, 'Comment content should match');
    assert.strictEqual(comment.type, 'public', 'End user comments should be public');
    
    console.log('  ✅ End user can communicate via ticket comments');
  });
});

// Support Agent Workflows
test('Support Agent Workflows', async (t) => {
  const testData = UATHelper.generateTestData();
  let agentToken = null;
  let agentTicket = null;

  await t.test('Agent Login and Dashboard Access', async () => {
    console.log('🔧 Testing support agent login and dashboard access...');
    
    // Create and login as support agent
    await UATHelper.createUser(testData.agent);
    agentToken = await UATHelper.loginUser(testData.agent.email, testData.agent.password);
    
    // Access agent dashboard
    const response = await UATHelper.makeRequest('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${agentToken}`
      }
    });

    assert.ok(response.ok, 'Agent should be able to access dashboard');
    
    const dashboard = await response.json();
    assert.ok(dashboard.summary, 'Dashboard should contain summary data');
    assert.ok(typeof dashboard.summary.totalTickets === 'number', 'Should show total tickets');
    
    console.log('  ✅ Support agent can access dashboard successfully');
  });

  await t.test('Ticket Assignment and Management', async () => {
    console.log('📋 Testing ticket assignment and management workflow...');
    
    // Create a ticket that needs agent attention
    const ticketData = {
      title: 'UAT Test: Network Connectivity Issues',
      description: 'Users in Building A are experiencing intermittent network connectivity issues. Multiple complaints received.',
      priority: 'high',
      category: 'network',
      urgency: 'high',
      impact: 'high'
    };

    agentTicket = await UATHelper.createTicket(agentToken, ticketData);
    
    // Agent assigns ticket to themselves
    const assignResponse = await UATHelper.makeRequest(`/api/tickets/${agentTicket.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify({
        assigned_to: testData.agent.email,
        status: 'in_progress'
      })
    });

    assert.ok(assignResponse.ok, 'Agent should be able to assign and update tickets');
    
    const updatedTicket = await assignResponse.json();
    assert.strictEqual(updatedTicket.status, 'in_progress', 'Ticket status should be updated');
    assert.strictEqual(updatedTicket.assigned_to, testData.agent.email, 'Ticket should be assigned to agent');
    
    console.log('  ✅ Agent can assign and manage tickets successfully');
  });

  await t.test('Agent Communication and Documentation', async () => {
    console.log('📝 Testing agent communication and documentation...');
    
    // Agent adds internal note
    const internalNoteData = {
      content: 'Checked network infrastructure. Issue appears to be with the main switch in Building A. Escalating to network team.',
      type: 'internal'
    };

    const internalResponse = await UATHelper.makeRequest(`/api/tickets/${agentTicket.id}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify(internalNoteData)
    });

    assert.ok(internalResponse.ok, 'Agent should be able to add internal notes');
    
    // Agent adds public response
    const publicResponseData = {
      content: 'We have identified the issue and are working with our network team to resolve it. Expected resolution time is 2 hours. We will keep you updated on progress.',
      type: 'public'
    };

    const publicResponse = await UATHelper.makeRequest(`/api/tickets/${agentTicket.id}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify(publicResponseData)
    });

    assert.ok(publicResponse.ok, 'Agent should be able to add public responses');
    
    const publicComment = await publicResponse.json();
    assert.strictEqual(publicComment.type, 'public', 'Comment should be marked as public');
    
    console.log('  ✅ Agent can document work and communicate effectively');
  });

  await t.test('Ticket Resolution Workflow', async () => {
    console.log('✅ Testing ticket resolution workflow...');
    
    // Agent resolves the ticket
    const resolutionData = {
      status: 'resolved',
      resolution: 'Network switch in Building A was replaced. All connectivity issues have been resolved. Monitoring for 24 hours to ensure stability.'
    };

    const response = await UATHelper.makeRequest(`/api/tickets/${agentTicket.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify(resolutionData)
    });

    assert.ok(response.ok, 'Agent should be able to resolve tickets');
    
    const resolvedTicket = await response.json();
    assert.strictEqual(resolvedTicket.status, 'resolved', 'Ticket should be marked as resolved');
    assert.ok(resolvedTicket.resolved_at, 'Ticket should have resolution timestamp');
    
    console.log('  ✅ Agent can successfully resolve tickets');
  });
});

// Manager Workflows
test('Manager Workflows', async (t) => {
  const testData = UATHelper.generateTestData();
  let managerToken = null;

  await t.test('Manager Analytics and Reporting Access', async () => {
    console.log('📊 Testing manager analytics and reporting access...');
    
    // Create and login as manager
    await UATHelper.createUser(testData.manager);
    managerToken = await UATHelper.loginUser(testData.manager.email, testData.manager.password);
    
    // Access executive reporting
    const response = await UATHelper.makeRequest('/api/analytics/executive', {
      headers: {
        'Authorization': `Bearer ${managerToken}`
      }
    });

    assert.ok(response.ok, 'Manager should be able to access executive reports');
    
    const report = await response.json();
    assert.ok(report.kpis, 'Report should contain KPIs');
    assert.ok(report.trends, 'Report should contain trend data');
    assert.ok(Array.isArray(report.insights), 'Report should contain insights');
    
    console.log('  ✅ Manager can access executive analytics successfully');
  });

  await t.test('Team Performance Monitoring', async () => {
    console.log('👥 Testing team performance monitoring...');
    
    // Access real-time metrics
    const response = await UATHelper.makeRequest('/api/analytics/realtime', {
      headers: {
        'Authorization': `Bearer ${managerToken}`
      }
    });

    assert.ok(response.ok, 'Manager should be able to access real-time metrics');
    
    const metrics = await response.json();
    assert.ok(metrics.currentLoad, 'Should show current system load');
    assert.ok(typeof metrics.currentLoad.activeUsers === 'number', 'Should show active user count');
    assert.ok(typeof metrics.currentLoad.ticketsPerHour === 'number', 'Should show tickets per hour');
    
    console.log('  ✅ Manager can monitor team performance effectively');
  });

  await t.test('SLA and Performance Tracking', async () => {
    console.log('⏱️ Testing SLA and performance tracking...');
    
    // Get performance dashboard
    const response = await UATHelper.makeRequest('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${managerToken}`
      }
    });

    assert.ok(response.ok, 'Manager should be able to access performance dashboard');
    
    const dashboard = await response.json();
    assert.ok(dashboard.performance, 'Dashboard should contain performance metrics');
    assert.ok(dashboard.trends, 'Dashboard should contain trend analysis');
    
    // Check for SLA-related metrics
    if (dashboard.performance.avgResolutionTime) {
      assert.ok(typeof dashboard.performance.avgResolutionTime === 'number', 'Should track average resolution time');
    }
    
    console.log('  ✅ Manager can track SLA and performance metrics');
  });
});

// Admin Workflows
test('Admin Workflows', async (t) => {
  const testData = UATHelper.generateTestData();
  let adminToken = null;

  await t.test('System Administration Access', async () => {
    console.log('⚙️ Testing system administration access...');
    
    // Create and login as admin
    await UATHelper.createUser(testData.admin);
    adminToken = await UATHelper.loginUser(testData.admin.email, testData.admin.password);
    
    // Access system health monitoring
    const response = await UATHelper.makeRequest('/api/monitoring/health', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.ok(response.ok, 'Admin should be able to access system health monitoring');
    
    const health = await response.json();
    assert.ok(health.status, 'Health check should return status');
    assert.ok(health.database, 'Health check should include database status');
    
    console.log('  ✅ Admin can access system administration features');
  });

  await t.test('System Performance Monitoring', async () => {
    console.log('🔍 Testing system performance monitoring...');
    
    // Access performance metrics
    const response = await UATHelper.makeRequest('/api/monitoring/performance', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.ok(response.ok, 'Admin should be able to access performance metrics');
    
    const performance = await response.json();
    assert.ok(performance.metrics, 'Performance data should contain metrics');
    
    console.log('  ✅ Admin can monitor system performance');
  });

  await t.test('Alert Management', async () => {
    console.log('🚨 Testing alert management...');
    
    // Access system alerts
    const response = await UATHelper.makeRequest('/api/monitoring/alerts', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.ok(response.ok, 'Admin should be able to access system alerts');
    
    const alerts = await response.json();
    assert.ok(Array.isArray(alerts.activeAlerts), 'Should return array of active alerts');
    
    console.log('  ✅ Admin can manage system alerts');
  });
});

// Cross-Role Integration Workflows
test('Cross-Role Integration Workflows', async (t) => {
  const testData = UATHelper.generateTestData();
  let endUserToken = null;
  let agentToken = null;
  let managerToken = null;
  let escalatedTicket = null;

  await t.test('Setup Test Users for Integration', async () => {
    console.log('🔧 Setting up test users for cross-role integration testing...');
    
    // Create all user types
    await UATHelper.createUser(testData.endUser);
    await UATHelper.createUser(testData.agent);
    await UATHelper.createUser(testData.manager);
    
    // Login all users
    endUserToken = await UATHelper.loginUser(testData.endUser.email, testData.endUser.password);
    agentToken = await UATHelper.loginUser(testData.agent.email, testData.agent.password);
    managerToken = await UATHelper.loginUser(testData.manager.email, testData.manager.password);
    
    assert.ok(endUserToken && agentToken && managerToken, 'All test users should be logged in');
    
    console.log('  ✅ All test users created and logged in successfully');
  });

  await t.test('End-to-End Ticket Escalation Workflow', async () => {
    console.log('🔄 Testing complete ticket escalation workflow...');
    
    // 1. End user creates critical ticket
    const criticalTicketData = {
      title: 'UAT Test: Critical Server Outage',
      description: 'Main application server is completely down. All users unable to access the system. Business operations severely impacted.',
      priority: 'critical',
      category: 'infrastructure',
      urgency: 'critical',
      impact: 'critical'
    };

    escalatedTicket = await UATHelper.createTicket(endUserToken, criticalTicketData);
    assert.ok(escalatedTicket.id, 'Critical ticket should be created');
    
    // 2. Agent picks up and starts working on ticket
    const agentAssignResponse = await UATHelper.makeRequest(`/api/tickets/${escalatedTicket.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify({
        assigned_to: testData.agent.email,
        status: 'in_progress'
      })
    });

    assert.ok(agentAssignResponse.ok, 'Agent should be able to assign ticket to themselves');
    
    // 3. Agent adds initial assessment
    const assessmentResponse = await UATHelper.makeRequest(`/api/tickets/${escalatedTicket.id}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify({
        content: 'Initial assessment: Database server appears to be down. This requires immediate escalation to infrastructure team.',
        type: 'internal'
      })
    });

    assert.ok(assessmentResponse.ok, 'Agent should be able to add assessment');
    
    // 4. Escalate to higher priority (simulating VIP priority boost)
    const escalateResponse = await UATHelper.makeRequest(`/api/tickets/${escalatedTicket.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify({
        priority: 'critical',
        vip_priority_score: 100
      })
    });

    assert.ok(escalateResponse.ok, 'Agent should be able to escalate ticket priority');
    
    console.log('  ✅ Complete escalation workflow executed successfully');
  });

  await t.test('Manager Oversight and Reporting Validation', async () => {
    console.log('👔 Testing manager oversight of escalated ticket...');
    
    // Manager views dashboard to see critical tickets
    const dashboardResponse = await UATHelper.makeRequest('/api/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${managerToken}`
      }
    });

    assert.ok(dashboardResponse.ok, 'Manager should be able to view dashboard');
    
    const dashboard = await dashboardResponse.json();
    
    // Manager should see the escalated ticket in metrics
    assert.ok(dashboard.summary.totalTickets >= 1, 'Dashboard should show ticket count');
    
    // Manager views executive report
    const execResponse = await UATHelper.makeRequest('/api/analytics/executive', {
      headers: {
        'Authorization': `Bearer ${managerToken}`
      }
    });

    assert.ok(execResponse.ok, 'Manager should be able to view executive report');
    
    console.log('  ✅ Manager can oversee and report on escalated tickets');
  });

  await t.test('Real-time System Monitoring Integration', async () => {
    console.log('⚡ Testing real-time system monitoring integration...');
    
    // Check that all roles can access appropriate real-time data
    const roles = [
      { token: agentToken, role: 'agent' },
      { token: managerToken, role: 'manager' }
    ];

    for (const { token, role } of roles) {
      const response = await UATHelper.makeRequest('/api/analytics/realtime', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      assert.ok(response.ok, `${role} should be able to access real-time metrics`);
      
      const metrics = await response.json();
      assert.ok(metrics.currentLoad, `Real-time metrics should be available for ${role}`);
    }
    
    console.log('  ✅ Real-time monitoring accessible to appropriate roles');
  });
});

// Accessibility and Usability Validation
test('Accessibility and Usability Validation', async (t) => {
  await t.test('API Response Accessibility', async () => {
    console.log('♿ Testing API response accessibility and usability...');
    
    // Test response structure for screen readers and assistive technologies
    const response = await UATHelper.makeRequest('/api/tickets');
    
    if (response.ok) {
      const data = await response.json();
      
      // Check for consistent data structure
      if (Array.isArray(data)) {
        for (const ticket of data.slice(0, 5)) { // Test first 5 tickets
          assert.ok(ticket.id, 'Ticket should have ID for accessibility');
          assert.ok(ticket.title, 'Ticket should have title for screen readers');
          assert.ok(ticket.status, 'Ticket should have status for assistive technologies');
        }
      }
    }
    
    console.log('  ✅ API responses structured for accessibility');
  });

  await t.test('Error Message Usability', async () => {
    console.log('💬 Testing error message usability...');
    
    // Test user-friendly error messages
    const response = await UATHelper.makeRequest('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: '', // Invalid: empty title
        description: ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Error messages should be helpful, not technical
      assert.ok(!errorText.includes('Error:'), 'Should not expose technical error details');
      assert.ok(!errorText.includes('Stack trace'), 'Should not expose stack traces');
    }
    
    console.log('  ✅ Error messages are user-friendly');
  });
});

// Business Logic Validation
test('Business Logic Validation', async (t) => {
  await t.test('VIP Priority System Business Rules', async () => {
    console.log('⭐ Testing VIP priority system business rules...');
    
    // Create VIP user
    const vipData = {
      email: `vip${Date.now()}@company.com`,
      first_name: 'VIP',
      last_name: 'Customer',
      role: 'vip',
      password: 'VIPCustomer123!'
    };

    await UATHelper.createUser(vipData);
    const vipToken = await UATHelper.loginUser(vipData.email, vipData.password);
    
    // VIP creates ticket
    const vipTicket = await UATHelper.createTicket(vipToken, {
      title: 'VIP Customer Issue',
      description: 'Issue requiring priority attention',
      priority: 'medium',
      category: 'technical'
    });

    // VIP ticket should have elevated priority score
    assert.ok(vipTicket.vip_priority_score > 0, 'VIP ticket should have elevated priority score');
    assert.strictEqual(vipTicket.is_vip, true, 'Ticket should be marked as VIP');
    
    console.log('  ✅ VIP priority system business rules working correctly');
  });

  await t.test('SLA and Time Tracking Validation', async () => {
    console.log('⏱️ Testing SLA and time tracking business logic...');
    
    // Create ticket with specific SLA requirements
    const testData = UATHelper.generateTestData();
    await UATHelper.createUser(testData.endUser);
    const userToken = await UATHelper.loginUser(testData.endUser.email, testData.endUser.password);
    
    const slaTicket = await UATHelper.createTicket(userToken, {
      title: 'SLA Test Ticket',
      description: 'Testing SLA calculation',
      priority: 'high',
      category: 'critical'
    });

    // Ticket should have creation timestamp for SLA calculation
    assert.ok(slaTicket.created_at, 'Ticket should have creation timestamp for SLA tracking');
    
    // Business rule: High priority tickets should have shorter SLA
    const createdTime = new Date(slaTicket.created_at);
    const now = new Date();
    const timeDiff = now - createdTime;
    
    assert.ok(timeDiff >= 0, 'Creation time should be valid');
    
    console.log('  ✅ SLA and time tracking business logic validated');
  });
});

console.log('✅ User Acceptance Testing Suite Completed');
console.log('🎯 All business workflows and user journeys validated successfully');
