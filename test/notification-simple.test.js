/**
 * Simple notification platform verification test
 */

import { strict as assert } from 'assert';
import { NovaUniversalNotificationPlatform } from '../src/lib/notification/nova-notification-platform.js';

// Mock Prisma clients for testing
const mockNotificationClient = {
  notificationEvent: {
    create: async (data) => ({
      id: 'test-event-123',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  },
  notificationDelivery: {
    createMany: async (data) => ({
      count: data.data.length
    })
  },
  notificationPreference: {
    findMany: async () => [
      {
        id: 'pref-1',
        userId: 'test-user',
        module: 'pulse.tickets',
        eventType: 'sla_breach',
        channels: ['EMAIL', 'IN_APP'],
        enabled: true
      }
    ],
    upsert: async (data) => ({
      id: 'pref-updated',
      ...data.create
    })
  }
};

const mockCoreClient = {
  user: {
    findMany: async () => [
      { id: 'user-1', email: 'user1@test.com', active: true },
      { id: 'user-2', email: 'user2@test.com', active: true }
    ]
  }
};

// Simple test function
async function testNotificationPlatform() {
  console.log('🧪 Testing Nova Universal Notification Platform...');
  
  try {
    // Create platform instance with mocked clients
    const platform = new NovaUniversalNotificationPlatform(
      mockNotificationClient,
      mockCoreClient
    );

    // Test 1: Send notification
    console.log('📤 Testing notification sending...');
    const payload = {
      module: 'pulse.tickets',
      eventType: 'sla_breach',
      title: 'SLA Breach Alert',
      message: 'Test notification message',
      priority: 'HIGH',
      recipientUsers: ['test-user'],
      createdBy: 'test-creator'
    };

    const eventId = await platform.sendNotification(payload);
    assert(eventId === 'test-event-123', 'Event ID should match mock response');
    console.log('✅ Notification sending works');

    // Test 2: Get user preferences
    console.log('⚙️ Testing user preferences...');
    const preferences = await platform.getUserPreferences('test-user');
    assert(Array.isArray(preferences), 'Preferences should be an array');
    assert(preferences.length > 0, 'Should return preferences');
    console.log('✅ User preferences retrieval works');

    // Test 3: Update user preferences
    console.log('📝 Testing preference updates...');
    const newPreferences = [
      {
        module: 'sentinel',
        eventType: 'system_alert',
        channels: ['EMAIL', 'SMS'],
        enabled: true,
        priority: 'CRITICAL'
      }
    ];

    await platform.updateUserPreferences('test-user', newPreferences);
    console.log('✅ User preferences update works');

    // Test 4: Batch notifications
    console.log('📦 Testing batch notifications...');
    const batchNotifications = [
      {
        module: 'test',
        eventType: 'batch1',
        title: 'Batch 1',
        message: 'First batch notification',
        recipientUsers: ['user-1']
      },
      {
        module: 'test',
        eventType: 'batch2',
        title: 'Batch 2',
        message: 'Second batch notification',
        recipientUsers: ['user-2']
      }
    ];

    const eventIds = await platform.sendBatch(batchNotifications);
    assert(Array.isArray(eventIds), 'Should return array of event IDs');
    console.log('✅ Batch notifications work');

    console.log('\n🎉 All tests passed! Nova Universal Notification Platform is working correctly.');
    
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run tests
await testNotificationPlatform()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
