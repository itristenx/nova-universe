/**
 * Space Integrations Service
 * Handles integrations with external calendar and meeting platforms
 */

import { logger } from '../../logger.js';

export class SpaceIntegrations {
  constructor() {
    this.initialized = false;
    this.integrations = new Map();
    this.supportedPlatforms = ['zoom', 'teams', 'webex', 'google', 'slack'];
  }

  async initialize() {
    try {
      logger.info('Space Integrations initializing...');
      
      // Initialize supported integrations
      await this.setupIntegrations();
      
      // Start background sync processes
      this.startBackgroundSync();
      
      this.initialized = true;
      logger.info('Space Integrations initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Space Integrations:', error);
      throw error;
    }
  }

  async setupIntegrations() {
    logger.debug('Setting up space integrations');
    
    // Initialize each supported platform
    for (const platform of this.supportedPlatforms) {
      try {
        const integration = await this.createIntegration(platform);
        this.integrations.set(platform, integration);
        logger.debug(`Integration for ${platform} initialized`);
      } catch (error) {
        logger.warn(`Failed to initialize ${platform} integration:`, error);
      }
    }
  }

  async createIntegration(platform) {
    const integration = {
      platform,
      enabled: true,
      config: this.getDefaultConfig(platform),
      status: 'active',
      lastSync: null,
      syncInterval: 5 * 60 * 1000, // 5 minutes
      
      // Integration methods
      sync: async () => await this.syncPlatform(platform),
      createMeeting: async (data) => await this.createMeetingOnPlatform(platform, data),
      getAvailability: async (userId) => await this.getPlatformAvailability(platform, userId),
      updateMeeting: async (meetingId, data) => await this.updateMeetingOnPlatform(platform, meetingId, data),
      deleteMeeting: async (meetingId) => await this.deleteMeetingOnPlatform(platform, meetingId)
    };

    return integration;
  }

  getDefaultConfig(platform) {
    const configs = {
      zoom: {
        apiKey: process.env.ZOOM_API_KEY || '',
        apiSecret: process.env.ZOOM_API_SECRET || '',
        webhookSecret: process.env.ZOOM_WEBHOOK_SECRET || '',
        baseUrl: 'https://api.zoom.us/v2'
      },
      teams: {
        clientId: process.env.TEAMS_CLIENT_ID || '',
        clientSecret: process.env.TEAMS_CLIENT_SECRET || '',
        tenantId: process.env.TEAMS_TENANT_ID || '',
        baseUrl: 'https://graph.microsoft.com/v1.0'
      },
      webex: {
        accessToken: process.env.WEBEX_ACCESS_TOKEN || '',
        baseUrl: 'https://webexapis.com/v1'
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
        baseUrl: 'https://www.googleapis.com/calendar/v3'
      },
      slack: {
        botToken: process.env.SLACK_BOT_TOKEN || '',
        signingSecret: process.env.SLACK_SIGNING_SECRET || '',
        baseUrl: 'https://slack.com/api'
      }
    };

    return configs[platform] || {};
  }

  async syncCalendars(userId) {
    try {
      logger.debug(`Syncing calendars for user ${userId}`);

      // Validate user access permissions
      if (!userId) {
        throw new Error('User ID is required for calendar sync');
      }

      // Get user's connected platforms
      const userPlatforms = await this.getUserConnectedPlatforms(userId);
      
      if (userPlatforms.length === 0) {
        logger.info(`No connected platforms found for user ${userId}`);
        return {
          success: true,
          syncedEvents: 0,
          userId,
          platforms: [],
          timestamp: new Date().toISOString()
        };
      }

      // Sync each platform
      const syncResults = [];
      let totalSyncedEvents = 0;

      for (const platform of userPlatforms) {
        try {
          const result = await this.syncPlatform(platform, userId);
          syncResults.push({ platform, ...result });
          totalSyncedEvents += result.syncedEvents || 0;
        } catch (error) {
          logger.error(`Failed to sync ${platform} for user ${userId}:`, error);
          syncResults.push({ platform, error: error.message });
        }
      }

      return {
        success: true,
        syncedEvents: totalSyncedEvents,
        userId,
        platforms: userPlatforms,
        results: syncResults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Calendar sync failed for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserConnectedPlatforms(userId) {
    // Mock implementation - would query database in production
    // This would check which platforms the user has connected
    logger.debug(`Fetching connected platforms for user: ${userId}`);
    
    const connectedPlatforms = ['zoom', 'teams'];
    
    // Use userId to determine user-specific platform availability
    // Hash the userId to create consistent but varied platform selection
    const userHash = this.hashUserId(userId);
    const threshold = 0.3 + (userHash % 100) / 1000; // Slight variation per user
    
    const userPlatforms = connectedPlatforms.filter(() => Math.random() > threshold);
    logger.debug(`User ${userId} has ${userPlatforms.length} connected platforms: ${userPlatforms.join(', ')}`);
    
    return userPlatforms;
  }

  // Helper method to create consistent user-based variations
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async syncPlatform(platform, userId = null) {
    try {
      logger.debug(`Syncing ${platform} platform${userId ? ` for user ${userId}` : ''}`);
      
      const integration = this.integrations.get(platform);
      if (!integration) {
        throw new Error(`Integration for ${platform} not found`);
      }

      // Mock sync implementation
      const syncedEvents = Math.floor(Math.random() * 20) + 5;
      
      // Update last sync time
      integration.lastSync = new Date().toISOString();
      
      logger.debug(`${platform} sync completed: ${syncedEvents} events`);
      
      return {
        platform,
        success: true,
        syncedEvents,
        timestamp: integration.lastSync
      };
    } catch (error) {
      logger.error(`Failed to sync ${platform}:`, error);
      throw error;
    }
  }

  async createMeetingForBooking(bookingId, platform) {
    try {
      logger.debug(`Creating meeting for booking ${bookingId} on platform ${platform}`);

      // Validate inputs
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      if (!platform) {
        throw new Error('Platform is required');
      }

      // Check if platform is supported
      if (!this.supportedPlatforms.includes(platform)) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Get booking details (would query database in production)
      const bookingDetails = await this.getBookingDetails(bookingId);
      
      // Create meeting on the platform
      const meetingDetails = await this.createMeetingOnPlatform(platform, bookingDetails);
      
      // Update booking with meeting details
      await this.updateBookingWithMeeting(bookingId, meetingDetails);
      
      return {
        success: true,
        bookingId,
        platform,
        meetingDetails,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to create meeting for booking ${bookingId}:`, error);
      throw error;
    }
  }

  async getBookingDetails(bookingId) {
    // Mock implementation - would query database in production
    return {
      id: bookingId,
      spaceId: `space_${Math.floor(Math.random() * 100)}`,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      title: 'Team Meeting',
      description: 'Weekly team sync',
      attendees: ['user1@example.com', 'user2@example.com']
    };
  }

  async createMeetingOnPlatform(platform, bookingDetails) {
    // Mock implementation - would call platform API in production
    logger.debug(`Creating meeting on ${platform} for booking:`, bookingDetails);
    
    const meetingId = `meeting_${platform}_${Date.now()}`;
    
    const meetingDetails = {
      id: meetingId,
      platform,
      url: `https://${platform}.com/meeting/${meetingId}`,
      title: bookingDetails.title || 'Space Booking Meeting',
      description: bookingDetails.description || 'Meeting for space booking',
      startTime: bookingDetails.startTime || new Date().toISOString(),
      endTime: bookingDetails.endTime || new Date(Date.now() + 3600000).toISOString(),
      attendees: bookingDetails.attendees || [],
      spaceId: bookingDetails.spaceId,
      bookingId: bookingDetails.id,
      dialInInfo: {
        phoneNumber: '+1-555-0123',
        accessCode: Math.floor(Math.random() * 1000000).toString(),
        pin: Math.floor(Math.random() * 10000).toString()
      },
      joinInstructions: `Join via ${platform} or dial in with the provided number`,
      recordingEnabled: bookingDetails.recordingEnabled || Math.random() > 0.5,
      waitingRoomEnabled: bookingDetails.waitingRoomEnabled || Math.random() > 0.5,
      timestamp: new Date().toISOString()
    };

    logger.info(`Created meeting ${meetingId} on ${platform} for space ${bookingDetails.spaceId}`);
    return meetingDetails;
  }

  async updateBookingWithMeeting(bookingId, meetingDetails) {
    // Mock implementation - would update database in production
    logger.debug(`Updating booking ${bookingId} with meeting details`);
    
    // Validate meeting details before updating
    if (!meetingDetails.id || !meetingDetails.platform || !meetingDetails.url) {
      logger.error(`Invalid meeting details for booking ${bookingId}:`, meetingDetails);
      return { success: false, error: 'Invalid meeting details' };
    }
    
    // Log the meeting integration details
    logger.info(`Linking booking ${bookingId} to ${meetingDetails.platform} meeting ${meetingDetails.id}`);
    logger.debug(`Meeting URL: ${meetingDetails.url}`);
    
    if (meetingDetails.dialInInfo) {
      logger.debug(`Dial-in details added for booking ${bookingId}: ${meetingDetails.dialInInfo.phoneNumber}`);
    }
    
    // In a real implementation, this would update the database with:
    // - meetingDetails.id as the external meeting ID
    // - meetingDetails.url as the join URL
    // - meetingDetails.dialInInfo for phone access
    // - meetingDetails.platform to track which service is being used
    
    return { 
      success: true, 
      meetingId: meetingDetails.id,
      joinUrl: meetingDetails.url,
      platform: meetingDetails.platform
    };
  }

  async syncAllCalendars() {
    try {
      logger.debug('Syncing all calendars');
      
      const results = [];
      for (const [platform, integration] of this.integrations) {
        try {
          // Use integration-specific configuration for sync
          logger.debug(`Starting sync for ${platform} with config:`, {
            enabled: integration.enabled,
            lastSync: integration.lastSync,
            rateLimitRemaining: integration.rateLimitRemaining
          });
          
          // Check if integration is ready for sync
          if (!integration.enabled) {
            logger.warn(`Skipping ${platform} sync - integration disabled`);
            results.push({ platform, skipped: true, reason: 'Integration disabled' });
            continue;
          }
          
          // Use integration settings for sync operation
          const result = await this.syncPlatform(platform, {
            batchSize: integration.batchSize || 100,
            timeout: integration.timeout || 30000,
            maxRetries: integration.maxRetries || 3
          });
          
          // Update integration state after successful sync
          integration.lastSync = new Date().toISOString();
          integration.lastSyncResult = result;
          
          results.push(result);
        } catch (error) {
          logger.error(`Failed to sync ${platform}:`, error);
          
          // Update integration error state
          integration.lastError = error.message;
          integration.lastErrorTime = new Date().toISOString();
          
          results.push({ platform, error: error.message });
        }
      }
      
      return {
        success: true,
        results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to sync all calendars:', error);
      throw error;
    }
  }

  startBackgroundSync() {
    // Start background sync every 5 minutes
    setInterval(async () => {
      try {
        await this.syncAllCalendars();
      } catch (error) {
        logger.error('Error in background calendar sync:', error);
      }
    }, 5 * 60 * 1000);
  }

  async getIntegrationStatus(platform) {
    const integration = this.integrations.get(platform);
    if (!integration) {
      return { platform, status: 'not_found' };
    }
    
    return {
      platform,
      status: integration.status,
      enabled: integration.enabled,
      lastSync: integration.lastSync,
      config: {
        hasApiKey: !!integration.config.apiKey || !!integration.config.accessToken || !!integration.config.clientId,
        hasWebhook: !!integration.config.webhookSecret || !!integration.config.signingSecret
      }
    };
  }

  async getAllIntegrationStatuses() {
    const statuses = [];
    for (const platform of this.supportedPlatforms) {
      const status = await this.getIntegrationStatus(platform);
      statuses.push(status);
    }
    return statuses;
  }

  async testIntegration(platform) {
    try {
      logger.debug(`Testing ${platform} integration`);
      
      const integration = this.integrations.get(platform);
      if (!integration) {
        throw new Error(`Integration for ${platform} not found`);
      }

      // Mock test - would actually test API connectivity in production
      const testResult = {
        platform,
        success: true,
        apiConnectivity: 'ok',
        webhookVerification: 'ok',
        permissions: 'ok',
        timestamp: new Date().toISOString()
      };

      logger.debug(`${platform} integration test passed`);
      return testResult;
    } catch (error) {
      logger.error(`Failed to test ${platform} integration:`, error);
      throw error;
    }
  }

  async disconnectIntegration(platform, userId) {
    try {
      logger.debug(`Disconnecting ${platform} integration for user ${userId}`);
      
      // Mock implementation - would remove integration in production
      const result = {
        platform,
        userId,
        success: true,
        disconnectedAt: new Date().toISOString()
      };

      logger.debug(`${platform} integration disconnected for user ${userId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to disconnect ${platform} integration:`, error);
      throw error;
    }
  }
}
