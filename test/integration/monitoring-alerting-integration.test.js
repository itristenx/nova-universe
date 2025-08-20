/**
 * Comprehensive Integration Test Suite
 * 
 * Tests the complete Nova Monitoring & Alerting Integration including:
 * - Database schema and migrations
 * - API gateway endpoints
 * - Real-time event synchronization
 * - Notification delivery
 * - External service integration
 * - Error handling and edge cases
 * 
 * Test Categories:
 * 1. Database Integration Tests
 * 2. API Endpoint Tests  
 * 3. Real-time Synchronization Tests
 * 4. Notification System Tests
 * 5. External Service Integration Tests
 * 6. Performance and Load Tests
 * 7. Security and Authorization Tests
 * 8. Edge Case and Error Handling Tests
 */

import { describe, beforeAll, afterAll, beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import supertest from 'supertest';
import { database } from '../../../apps/api/utils/database.js';
import { monitoringEventBridge } from '../../../apps/api/lib/monitoring-event-bridge.js';
import { unifiedNotificationService } from '../../../apps/api/lib/unified-notification-service.js';
import { monitoringIntegrationService } from '../../../apps/api/lib/monitoring-integration-service.js';

// Mock external services
jest.mock('../../../apps/api/lib/monitoring-integration-service.js');

describe('Nova Monitoring & Alerting Integration', () => {
  let app;
  let testTenantId;
  let testUserId;
  let testMonitorId;
  let testAlertId;
  let testScheduleId;

  beforeAll(async () => {
    // Initialize test application
    const { createApp } = await import('../../../apps/api/app.js');
    app = createApp();

    // Initialize test database
    await database.connect();
    
    // Run migrations
    await database.migrate();

    // Initialize services
    await monitoringEventBridge.start();
    await unifiedNotificationService.initialize();

    // Create test data
    const testData = await setupTestData();
    testTenantId = testData.testTenantId;
    testUserId = testData.testUserId;
    testMonitorId = testData.testMonitorId;
    testAlertId = testData.testAlertId;
    testScheduleId = testData.testScheduleId;
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData(testTenantId);

    // Stop services
    await monitoringEventBridge.stop();

    // Close database connections
    await database.disconnect();
  });

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup any test-specific data
  });

  // =============================================================================
  // DATABASE INTEGRATION TESTS
  // =============================================================================

  describe('Database Schema Integration', () => {
    test('should have all required tables created', async () => {
      const tables = await database.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%monitoring%' OR table_name LIKE '%alert%' OR table_name LIKE '%oncall%'
        ORDER BY table_name
      `);

      const expectedTables = [
        'monitoring_user_mappings',
        'integration_configurations',
        'nova_alerts',
        'oncall_schedules',
        'oncall_schedule_assignments',
        'integration_events',
        'integration_audit_log',
        'integration_sync_errors',
        'status_page_config',
        'notification_delivery_log'
      ];

      const tableNames = tables.rows.map(row => row.table_name);
      
      expectedTables.forEach(expectedTable => {
        expect(tableNames).toContain(expectedTable);
      });
    });

    test('should have proper indexes for performance', async () => {
      const indexes = await database.query(`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND (tablename LIKE '%monitoring%' OR tablename LIKE '%alert%' OR tablename LIKE '%oncall%')
        ORDER BY tablename, indexname
      `);

      expect(indexes.rows.length).toBeGreaterThan(10);
      
      // Check for critical indexes
      const indexNames = indexes.rows.map(row => `${row.tablename}.${row.indexname}`);
      expect(indexNames).toContain('nova_alerts.idx_nova_alerts_status_severity');
      expect(indexNames).toContain('nova_alerts.idx_nova_alerts_monitor_id');
      expect(indexNames).toContain('oncall_schedule_assignments.idx_oncall_assignments_schedule_time');
    });

    test('should handle database constraints properly', async () => {
      // Test unique constraints
      await expect(
        database.query(`
          INSERT INTO monitoring_user_mappings (tenant_id, nova_user_id, goalert_user_id, uptime_kuma_user_id)
          VALUES ($1, $2, 'duplicate_goalert_id', 'uk_id_1')
        `, [testTenantId, testUserId])
      ).resolves.toBeDefined();

      // Should fail on duplicate GoAlert user ID
      await expect(
        database.query(`
          INSERT INTO monitoring_user_mappings (tenant_id, nova_user_id, goalert_user_id, uptime_kuma_user_id)
          VALUES ($1, $2, 'duplicate_goalert_id', 'uk_id_2')
        `, [testTenantId, 'other-user-id'])
      ).rejects.toThrow();
    });

    test('should handle foreign key relationships', async () => {
      // Test monitor-alert relationship
      const alertResult = await database.query(`
        INSERT INTO nova_alerts (summary, severity, monitor_id, status)
        VALUES ('Test Alert', 'medium', $1, 'active')
        RETURNING id
      `, [testMonitorId]);

      expect(alertResult.rows[0].id).toBeDefined();

      // Should fail with invalid monitor_id
      await expect(
        database.query(`
          INSERT INTO nova_alerts (summary, severity, monitor_id, status)
          VALUES ('Invalid Alert', 'medium', '00000000-0000-0000-0000-000000000000', 'active')
        `)
      ).rejects.toThrow();
    });
  });

  // =============================================================================
  // API ENDPOINT TESTS
  // =============================================================================

  describe('Unified Monitoring API Endpoints', () => {
    let authToken;

    beforeEach(async () => {
      // Get authentication token
      authToken = await getTestAuthToken(testUserId);
    });

    describe('Monitor Management', () => {
      test('GET /api/v2/monitors should return paginated monitors', async () => {
        const response = await supertest(app)
          .get('/api/v2/monitors')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.monitors).toBeInstanceOf(Array);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
      });

      test('POST /api/v2/monitors should create monitor with external service integration', async () => {
        const monitorData = {
          name: 'Test API Monitor',
          description: 'Test monitor for API testing',
          type: 'http',
          url: 'https://api.example.com/health',
          interval: 300,
          timeout: 30,
          create_in_uptime_kuma: true,
          create_in_goalert: false
        };

        // Mock external service calls
        monitoringIntegrationService.createUptimeKumaMonitor.mockResolvedValue({
          id: 'uk_monitor_123',
          status: 'created'
        });

        const response = await supertest(app)
          .post('/api/v2/monitors')
          .set('Authorization', `Bearer ${authToken}`)
          .send(monitorData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.monitor.name).toBe(monitorData.name);
        expect(response.body.monitor.uptime_kuma_id).toBe('uk_monitor_123');
        expect(monitoringIntegrationService.createUptimeKumaMonitor).toHaveBeenCalledWith(
          expect.objectContaining({
            name: monitorData.name,
            type: monitorData.type,
            url: monitorData.url
          })
        );
      });

      test('PUT /api/v2/monitors/:id should update monitor and sync to external services', async () => {
        const updateData = {
          name: 'Updated Monitor Name',
          interval: 600,
          timeout: 45
        };

        monitoringIntegrationService.updateUptimeKumaMonitor.mockResolvedValue({
          success: true
        });

        const response = await supertest(app)
          .put(`/api/v2/monitors/${testMonitorId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.monitor.name).toBe(updateData.name);
        expect(response.body.monitor.interval).toBe(updateData.interval);
      });

      test('DELETE /api/v2/monitors/:id should remove monitor and cleanup external services', async () => {
        // Create a test monitor first
        const createResponse = await supertest(app)
          .post('/api/v2/monitors')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Monitor to Delete',
            type: 'http',
            url: 'https://example.com'
          })
          .expect(201);

        const monitorId = createResponse.body.monitor.id;

        monitoringIntegrationService.removeMonitorFromUptimeKuma.mockResolvedValue({
          success: true
        });

        const response = await supertest(app)
          .delete(`/api/v2/monitors/${monitorId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('deleted');
      });
    });

    describe('Alert Management', () => {
      test('GET /api/v2/alerts should return filtered and paginated alerts', async () => {
        const response = await supertest(app)
          .get('/api/v2/alerts')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ 
            severity: 'high',
            status: 'active',
            page: 1,
            limit: 20
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.alerts).toBeInstanceOf(Array);
        expect(response.body.summary).toBeDefined();
        expect(response.body.summary.by_severity).toBeDefined();
        expect(response.body.summary.by_status).toBeDefined();
      });

      test('POST /api/v2/alerts should create alert and integrate with GoAlert', async () => {
        const alertData = {
          summary: 'Test Critical Alert',
          description: 'This is a test critical alert',
          severity: 'critical',
          monitor_id: testMonitorId,
          escalate_immediately: true
        };

        monitoringIntegrationService.createGoAlertAlert.mockResolvedValue({
          id: 'goalert_alert_123',
          status: 'active'
        });

        const response = await supertest(app)
          .post('/api/v2/alerts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(alertData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.alert.summary).toBe(alertData.summary);
        expect(response.body.alert.severity).toBe(alertData.severity);
        expect(response.body.alert.goalert_alert_id).toBe('goalert_alert_123');
        expect(monitoringIntegrationService.createGoAlertAlert).toHaveBeenCalled();
      });

      test('PUT /api/v2/alerts/:id/acknowledge should acknowledge alert in both systems', async () => {
        const acknowledgeData = {
          message: 'Investigating the issue'
        };

        monitoringIntegrationService.acknowledgeGoAlertAlert.mockResolvedValue({
          success: true
        });

        const response = await supertest(app)
          .put(`/api/v2/alerts/${testAlertId}/acknowledge`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(acknowledgeData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.alert.status).toBe('acknowledged');
        expect(response.body.alert.acknowledged_by).toBeDefined();
        expect(response.body.alert.acknowledged_at).toBeDefined();
      });

      test('PUT /api/v2/alerts/:id/resolve should resolve alert in both systems', async () => {
        const resolveData = {
          resolution_notes: 'Issue was resolved by restarting the service',
          root_cause: 'Service memory leak'
        };

        monitoringIntegrationService.resolveGoAlertAlert.mockResolvedValue({
          success: true
        });

        const response = await supertest(app)
          .put(`/api/v2/alerts/${testAlertId}/resolve`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(resolveData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.alert.status).toBe('resolved');
        expect(response.body.alert.resolved_by).toBeDefined();
        expect(response.body.alert.resolved_at).toBeDefined();
      });
    });

    describe('On-Call Management', () => {
      test('GET /api/v2/oncall/schedules should return schedules with current assignments', async () => {
        const response = await supertest(app)
          .get('/api/v2/oncall/schedules')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.schedules).toBeInstanceOf(Array);
        expect(response.body.summary).toBeDefined();
      });

      test('POST /api/v2/oncall/schedules should create schedule with GoAlert integration', async () => {
        const scheduleData = {
          name: 'Test On-Call Schedule',
          description: 'Test schedule for API testing',
          timezone: 'America/New_York',
          rotation_type: 'weekly',
          rotation_config: {
            rotation_start: '2024-01-01T00:00:00Z',
            participants: [testUserId]
          },
          create_in_goalert: true
        };

        monitoringIntegrationService.createGoAlertSchedule.mockResolvedValue({
          id: 'goalert_schedule_123',
          status: 'created'
        });

        const response = await supertest(app)
          .post('/api/v2/oncall/schedules')
          .set('Authorization', `Bearer ${authToken}`)
          .send(scheduleData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.schedule.name).toBe(scheduleData.name);
        expect(response.body.schedule.goalert_schedule_id).toBe('goalert_schedule_123');
      });

      test('GET /api/v2/oncall/current should return current on-call assignments', async () => {
        const response = await supertest(app)
          .get('/api/v2/oncall/current')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ include_upcoming: true })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.current_oncall).toBeInstanceOf(Array);
        expect(response.body.upcoming_oncall).toBeInstanceOf(Array);
        expect(response.body.summary).toBeDefined();
      });

      test('POST /api/v2/oncall/override should create emergency override', async () => {
        const overrideData = {
          schedule_id: testScheduleId,
          user_id: testUserId,
          start_time: '2024-12-20T12:00:00Z',
          end_time: '2024-12-20T20:00:00Z',
          reason: 'Emergency coverage needed'
        };

        const response = await supertest(app)
          .post('/api/v2/oncall/override')
          .set('Authorization', `Bearer ${authToken}`)
          .send(overrideData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.override.reason).toBe(overrideData.reason);
        expect(response.body.override.is_override).toBe(true);
      });
    });

    describe('Status Page Management', () => {
      test('GET /api/v2/status/public/:tenantId should return public status page', async () => {
        const response = await supertest(app)
          .get(`/api/v2/status/public/${testTenantId}`)
          .query({ include_history: true, days: 30 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.status_page).toBeDefined();
        expect(response.body.overall_status).toBeDefined();
        expect(response.body.services).toBeInstanceOf(Array);
        expect(response.body.summary).toBeDefined();
      });

      test('POST /api/v2/status/incidents should create public incident', async () => {
        const incidentData = {
          summary: 'API Service Degradation',
          description: 'We are experiencing issues with our API service',
          severity: 'high',
          status: 'investigating',
          affected_services: [testMonitorId],
          is_public: true
        };

        const response = await supertest(app)
          .post('/api/v2/status/incidents')
          .set('Authorization', `Bearer ${authToken}`)
          .send(incidentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.incident.summary).toBe(incidentData.summary);
        expect(response.body.incident.is_public).toBe(true);
      });

      test('PUT /api/v2/status/incidents/:id/update should update incident status', async () => {
        // Create incident first
        const createResponse = await supertest(app)
          .post('/api/v2/status/incidents')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            summary: 'Test Incident for Update',
            severity: 'medium',
            status: 'investigating',
            affected_services: [testMonitorId]
          })
          .expect(201);

        const incidentId = createResponse.body.incident.id;

        const updateData = {
          status: 'resolved',
          message: 'Issue has been resolved. All services are operational.'
        };

        const response = await supertest(app)
          .put(`/api/v2/status/incidents/${incidentId}/update`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.incident.status).toBe('resolved');
      });
    });
  });

  // =============================================================================
  // REAL-TIME SYNCHRONIZATION TESTS
  // =============================================================================

  describe('Real-time Event Synchronization', () => {
    test('should emit events when monitors are created', async () => {
      const eventSpy = jest.spyOn(monitoringEventBridge, 'emit');

      await supertest(app)
        .post('/api/v2/monitors')
        .set('Authorization', `Bearer ${await getTestAuthToken(testUserId)}`)
        .send({
          name: 'Event Test Monitor',
          type: 'http',
          url: 'https://example.com'
        })
        .expect(201);

      expect(eventSpy).toHaveBeenCalledWith('monitor.created', expect.objectContaining({
        monitor: expect.objectContaining({
          name: 'Event Test Monitor'
        }),
        user: expect.any(Object),
        timestamp: expect.any(String)
      }));
    });

    test('should handle external GoAlert events', async () => {
      const goalertEventData = {
        alert: {
          id: 'goalert_123',
          summary: 'Test GoAlert Alert',
          status: 'acknowledged',
          service_id: 'service_123',
          acknowledged_by: 'test@example.com',
          updated_at: new Date().toISOString()
        },
        action: 'acknowledged',
        timestamp: new Date().toISOString()
      };

      // Simulate external GoAlert event
      await monitoringEventBridge.handleGoAlertEvent(goalertEventData);

      // Verify Nova alert was updated
      const alertResult = await database.query(`
        SELECT * FROM nova_alerts 
        WHERE goalert_alert_id = $1
      `, [goalertEventData.alert.id]);

      if (alertResult.rows.length > 0) {
        expect(alertResult.rows[0].status).toBe('acknowledged');
      }
    });

    test('should handle external Uptime Kuma events', async () => {
      const uptimeKumaEventData = {
        monitor: {
          id: 'uk_monitor_123',
          name: 'Test Monitor'
        },
        status: 'down',
        response_time: 5000,
        timestamp: new Date().toISOString()
      };

      // Mock monitor lookup
      await database.query(`
        UPDATE monitors 
        SET uptime_kuma_id = $1 
        WHERE id = $2
      `, ['uk_monitor_123', testMonitorId]);

      await monitoringEventBridge.handleUptimeKumaEvent(uptimeKumaEventData);

      // Verify monitor status was updated
      const monitorResult = await database.query(`
        SELECT status FROM monitors WHERE id = $1
      `, [testMonitorId]);

      expect(monitorResult.rows[0].status).toBe('down');
    });

    test('should handle sync conflicts appropriately', async () => {
      const conflictData = {
        resource_type: 'alert',
        nova_data: {
          id: 'nova_alert_123',
          status: 'active',
          updated_at: '2024-12-20T10:00:00Z'
        },
        external_data: {
          id: 'goalert_alert_123',
          status: 'acknowledged',
          updated_at: '2024-12-20T11:00:00Z'
        },
        source: 'goalert'
      };

      const resolution = await monitoringEventBridge.handleSyncConflict(conflictData);

      // External data should win because it's newer
      expect(resolution.status).toBe('acknowledged');
      expect(resolution.resolution).toBe('external_wins');
    });
  });

  // =============================================================================
  // NOTIFICATION SYSTEM TESTS
  // =============================================================================

  describe('Unified Notification System', () => {
    test('should send alert notifications through multiple channels', async () => {
      const alertData = {
        id: 'test_alert_123',
        summary: 'Test Critical Alert',
        severity: 'critical',
        status: 'active',
        monitor_id: testMonitorId,
        created_at: new Date().toISOString()
      };

      const options = {
        recipients: [testUserId],
        channels: ['email', 'sms', 'slack'],
        priority: 'critical',
        tenant_id: testTenantId,
        escalate: true
      };

      const result = await unifiedNotificationService.sendAlertNotification(alertData, options);

      expect(result.success).toBe(true);
      expect(result.notification_id).toBeDefined();
      expect(result.delivery_results).toHaveLength(3); // email, sms, slack
    });

    test('should render notification templates correctly', async () => {
      const template = unifiedNotificationService.getTemplate('alert_created');
      expect(template).toBeDefined();

      const alertData = {
        alert: {
          id: 'test_alert_123',
          summary: 'Database Connection Failed',
          severity: 'critical',
          created_at: '2024-12-20T12:00:00Z'
        },
        monitor: {
          name: 'Production Database'
        }
      };

      const notification = await unifiedNotificationService.buildNotification(
        template, 
        alertData, 
        { tenant_id: testTenantId, type: 'alert_created' }
      );

      expect(notification.subject).toContain('Database Connection Failed');
      expect(notification.content.email.html).toContain('Production Database');
      expect(notification.content.sms).toContain('Database Connection Failed');
    });

    test('should respect user notification preferences', async () => {
      // Set user preferences to disable SMS
      await database.query(`
        INSERT INTO user_contact_preferences (user_id, email_enabled, sms_enabled, push_enabled)
        VALUES ($1, true, false, true)
        ON CONFLICT (user_id) 
        DO UPDATE SET sms_enabled = false
      `, [testUserId]);

      const recipients = await unifiedNotificationService.getEffectiveRecipients(
        [testUserId], 
        testTenantId, 
        'alert_created'
      );

      expect(recipients).toHaveLength(1);
      expect(recipients[0].sms_enabled).toBe(false);
      expect(recipients[0].email_enabled).toBe(true);
    });

    test('should handle notification delivery failures gracefully', async () => {
      // Mock a delivery failure
      const originalSendEmail = unifiedNotificationService.sendEmail;
      unifiedNotificationService.sendEmail = jest.fn().mockRejectedValue(
        new Error('SMTP server unavailable')
      );

      const alertData = {
        id: 'test_alert_456',
        summary: 'Test Alert with Delivery Failure',
        severity: 'high'
      };

      const result = await unifiedNotificationService.sendAlertNotification(alertData, {
        recipients: [testUserId],
        channels: ['email'],
        tenant_id: testTenantId
      });

      expect(result.success).toBe(true); // Should still succeed overall
      expect(result.delivery_results[0].success).toBe(false);
      expect(result.delivery_results[0].error).toContain('SMTP server unavailable');

      // Restore original method
      unifiedNotificationService.sendEmail = originalSendEmail;
    });
  });

  // =============================================================================
  // PERFORMANCE AND LOAD TESTS
  // =============================================================================

  describe('Performance and Load Tests', () => {
    test('should handle concurrent monitor creation', async () => {
      const authToken = await getTestAuthToken(testUserId);
      const concurrentRequests = 10;
      
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        supertest(app)
          .post('/api/v2/monitors')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Concurrent Monitor ${i}`,
            type: 'http',
            url: `https://example${i}.com`
          })
      );

      const results = await Promise.allSettled(requests);
      const successfulRequests = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);

      expect(successfulRequests.length).toBe(concurrentRequests);
    });

    test('should handle large result sets with pagination', async () => {
      const authToken = await getTestAuthToken(testUserId);

      // Test with large page size
      const response = await supertest(app)
        .get('/api/v2/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100 })
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
      expect(response.header['content-length']).toBeDefined();
      
      // Response should be returned within reasonable time
      expect(response.header['x-response-time']).toBeDefined();
    });

    test('should maintain performance under high event load', async () => {
      const startTime = Date.now();
      const eventCount = 100;

      // Emit many events rapidly
      const eventPromises = Array.from({ length: eventCount }, (_, i) =>
        monitoringEventBridge.handleMonitorCheckResult({
          monitor_id: testMonitorId,
          status: i % 2 === 0 ? 'up' : 'down',
          response_time: Math.random() * 1000,
          checked_at: new Date().toISOString(),
          details: { test: `event_${i}` }
        })
      );

      await Promise.all(eventPromises);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  // =============================================================================
  // SECURITY AND AUTHORIZATION TESTS
  // =============================================================================

  describe('Security and Authorization', () => {
    test('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v2/monitors' },
        { method: 'post', path: '/api/v2/monitors' },
        { method: 'get', path: '/api/v2/alerts' },
        { method: 'post', path: '/api/v2/alerts' },
        { method: 'get', path: '/api/v2/oncall/schedules' }
      ];

      for (const endpoint of endpoints) {
        const response = await supertest(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });

    test('should enforce tenant isolation', async () => {
      const authToken = await getTestAuthToken(testUserId);
      const otherTenantId = 'other-tenant-id';

      // Try to access monitors from another tenant
      const response = await supertest(app)
        .get('/api/v2/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ tenant_id: otherTenantId })
        .expect(200);

      // Should return empty results or only user's tenant data
      expect(response.body.monitors).toBeInstanceOf(Array);
      expect(response.body.monitors.every(m => m.tenant_id === testTenantId)).toBe(true);
    });

    test('should validate input data properly', async () => {
      const authToken = await getTestAuthToken(testUserId);

      // Test invalid monitor data
      const invalidMonitorData = {
        name: '', // Empty name
        type: 'invalid_type',
        url: 'not_a_url',
        interval: -1, // Negative interval
        timeout: 'not_a_number'
      };

      const response = await supertest(app)
        .post('/api/v2/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMonitorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should prevent SQL injection attacks', async () => {
      const authToken = await getTestAuthToken(testUserId);

      // Attempt SQL injection in query parameters
      const maliciousQuery = "'; DROP TABLE monitors; --";

      const response = await supertest(app)
        .get('/api/v2/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: maliciousQuery })
        .expect(200);

      // Should handle gracefully without errors
      expect(response.body.success).toBe(true);

      // Verify table still exists
      const tableCheck = await database.query(`
        SELECT COUNT(*) FROM monitors WHERE tenant_id = $1
      `, [testTenantId]);

      expect(tableCheck.rows[0].count).toBeDefined();
    });

    test('should implement rate limiting', async () => {
      const authToken = await getTestAuthToken(testUserId);
      const rapidRequests = 50;

      // Make many requests rapidly
      const requests = Array.from({ length: rapidRequests }, () =>
        supertest(app)
          .get('/api/v2/monitors')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const results = await Promise.allSettled(requests);
      const rateLimitedRequests = results.filter(
        r => r.status === 'fulfilled' && r.value.status === 429
      );

      // Should have some rate limited requests
      expect(rateLimitedRequests.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // EDGE CASES AND ERROR HANDLING
  // =============================================================================

  describe('Edge Cases and Error Handling', () => {
    test('should handle external service unavailability', async () => {
      const authToken = await getTestAuthToken(testUserId);

      // Mock external service failure
      monitoringIntegrationService.createUptimeKumaMonitor.mockRejectedValue(
        new Error('Uptime Kuma service unavailable')
      );

      const response = await supertest(app)
        .post('/api/v2/monitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Monitor with Service Failure',
          type: 'http',
          url: 'https://example.com',
          create_in_uptime_kuma: true
        })
        .expect(201); // Should still succeed

      expect(response.body.success).toBe(true);
      expect(response.body.monitor.uptime_kuma_id).toBeUndefined();
    });

    test('should handle database connection failures gracefully', async () => {
      // Mock database failure
      const originalQuery = database.query;
      database.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const authToken = await getTestAuthToken(testUserId);

      const response = await supertest(app)
        .get('/api/v2/monitors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Database');

      // Restore original method
      database.query = originalQuery;
    });

    test('should handle malformed webhook data', async () => {
      const malformedData = {
        // Missing required fields
        incomplete: 'data'
      };

      // Should not crash the application
      expect(async () => {
        await monitoringEventBridge.handleGoAlertEvent(malformedData);
      }).not.toThrow();
    });

    test('should handle very large payload sizes', async () => {
      const authToken = await getTestAuthToken(testUserId);

      const largeDescription = 'x'.repeat(10000); // 10KB description

      const response = await supertest(app)
        .post('/api/v2/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          summary: 'Large Payload Test',
          description: largeDescription,
          severity: 'medium',
          monitor_id: testMonitorId
        });

      // Should either accept it or return appropriate error
      expect([201, 413]).toContain(response.status);
    });

    test('should handle concurrent modifications gracefully', async () => {
      const authToken = await getTestAuthToken(testUserId);

      // Create concurrent updates to the same alert
      const updateRequests = Array.from({ length: 5 }, () =>
        supertest(app)
          .put(`/api/v2/alerts/${testAlertId}/acknowledge`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ message: 'Concurrent acknowledgment' })
      );

      const results = await Promise.allSettled(updateRequests);
      
      // At least one should succeed
      const successfulRequests = results.filter(
        r => r.status === 'fulfilled' && r.value.status === 200
      );
      
      expect(successfulRequests.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function setupTestData() {
  // These will be set by the main test suite
  let testTenantId, testUserId, testMonitorId, testAlertId, testScheduleId;
  
  // Create test tenant
  const tenantResult = await database.query(`
    INSERT INTO tenants (name, subdomain, plan_type)
    VALUES ('Test Tenant', 'test', 'enterprise')
    RETURNING id
  `);
  testTenantId = tenantResult.rows[0].id;

  // Create test user
  const userResult = await database.query(`
    INSERT INTO users (email, first_name, last_name, tenant_id, role)
    VALUES ('test@example.com', 'Test', 'User', $1, 'admin')
    RETURNING id
  `, [testTenantId]);
  testUserId = userResult.rows[0].id;

  // Create test monitor
  const monitorResult = await database.query(`
    INSERT INTO monitors (name, type, url, tenant_id, created_by)
    VALUES ('Test Monitor', 'http', 'https://example.com', $1, $2)
    RETURNING id
  `, [testTenantId, testUserId]);
  testMonitorId = monitorResult.rows[0].id;

  // Create test alert
  const alertResult = await database.query(`
    INSERT INTO nova_alerts (summary, severity, status, monitor_id, created_by)
    VALUES ('Test Alert', 'medium', 'active', $1, $2)
    RETURNING id
  `, [testMonitorId, testUserId]);
  testAlertId = alertResult.rows[0].id;

  // Create test schedule
  const scheduleResult = await database.query(`
    INSERT INTO oncall_schedules (name, timezone, rotation_type, tenant_id, created_by)
    VALUES ('Test Schedule', 'UTC', 'weekly', $1, $2)
    RETURNING id
  `, [testTenantId, testUserId]);
  testScheduleId = scheduleResult.rows[0].id;

  return {
    testTenantId,
    testUserId,
    testMonitorId,
    testAlertId,
    testScheduleId
  };
}

async function cleanupTestData(testTenantId) {
  if (testTenantId) {
    // Cleanup all test data (cascade should handle most of it)
    await database.query('DELETE FROM tenants WHERE id = $1', [testTenantId]);
  }
}

async function getTestAuthToken(testUserId) {
  // Mock authentication token generation
  // In real implementation, this would call the auth service
  return 'test_auth_token_' + testUserId;
}

// Export test utilities for use in other test files
export {
  setupTestData,
  cleanupTestData,
  getTestAuthToken
};
