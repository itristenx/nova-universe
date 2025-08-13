/**
 * Zoom Connector
 * Implements Zoom API for video conferencing and communication integration
 * 
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Zoom Connector for video conferencing and meeting management
 * Follows enterprise integration patterns for communication platforms
 */
export class ZoomConnector extends IConnector {
  constructor() {
    super('zoom-connector', 'Zoom', '1.0.0', ConnectorType.COMMUNICATION_PLATFORM);
    this.client = null;
    this.config = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Initialize Zoom connector with enterprise configuration
   */
  async initialize(config) {
    try {
      this.config = config;
      
      // Validate Zoom-specific configuration
      this.validateZoomConfig(config);
      
      // Initialize Zoom API client
      this.client = axios.create({
        baseURL: config.endpoints.zoomUrl || 'https://api.zoom.us/v2',
        timeout: config.timeout || 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Authenticate based on auth type
      await this.authenticate();
      
      // Test the connection
      await this.testConnection();
      
      console.log('Zoom connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Zoom connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive Zoom API testing
   */
  async health() {
    try {
      const startTime = Date.now();
      
      // Ensure we have a valid token
      await this.ensureValidToken();
      
      // Test user access
      const userResponse = await this.client.get('/users/me', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      
      const apiLatency = Date.now() - startTime;

      // Test meetings access
      let meetingsStatus = 'healthy';
      let meetingsLatency = 0;
      
      try {
        const meetingsStartTime = Date.now();
        await this.client.get('/users/me/meetings?type=scheduled&page_size=1', {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        meetingsLatency = Date.now() - meetingsStartTime;
      } catch (error) {
        meetingsStatus = 'degraded';
      }

      // Test account info access
      let accountStatus = 'healthy';
      let accountLatency = 0;
      
      try {
        const accountStartTime = Date.now();
        await this.client.get('/accounts/me', {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        accountLatency = Date.now() - accountStartTime;
      } catch (error) {
        accountStatus = 'degraded';
      }

      const overallStatus = userResponse.status === 200 && meetingsStatus === 'healthy' && accountStatus === 'healthy'
        ? HealthStatus.HEALTHY 
        : HealthStatus.DEGRADED;

      return {
        status: overallStatus,
        lastCheck: new Date(),
        metrics: [
          {
            name: 'api_latency',
            value: apiLatency,
            unit: 'ms'
          },
          {
            name: 'meetings_latency',
            value: meetingsLatency,
            unit: 'ms'
          },
          {
            name: 'account_latency',
            value: accountLatency,
            unit: 'ms'
          },
          {
            name: 'auth_status',
            value: this.accessToken ? 1 : 0,
            unit: 'boolean'
          }
        ],
        issues: overallStatus !== HealthStatus.HEALTHY ? ['Some Zoom API endpoints degraded'] : []
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        metrics: [],
        issues: [error.message]
      };
    }
  }

  /**
   * Sync users, meetings, and webinars from Zoom
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      let totalRecords = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync from Zoom...`);

      // Ensure valid authentication
      await this.ensureValidToken();

      // Sync users
      const usersResult = await this.syncUsers(options);
      totalRecords += usersResult.totalRecords;
      successCount += usersResult.successCount;
      errorCount += usersResult.errorCount;
      errors.push(...usersResult.errors);

      // Sync meetings
      const meetingsResult = await this.syncMeetings(options);
      totalRecords += meetingsResult.totalRecords;
      successCount += meetingsResult.successCount;
      errorCount += meetingsResult.errorCount;
      errors.push(...meetingsResult.errors);

      // Sync webinars (if enabled)
      if (options.includeWebinars) {
        const webinarsResult = await this.syncWebinars(options);
        totalRecords += webinarsResult.totalRecords;
        successCount += webinarsResult.successCount;
        errorCount += webinarsResult.errorCount;
        errors.push(...webinarsResult.errors);
      }

      const status = errorCount === 0 ? 'success' : 
        successCount > 0 ? 'partial' : 'failed';

      return {
        jobId: crypto.randomUUID(),
        status,
        metrics: {
          totalRecords,
          successCount,
          errorCount
        },
        errors: errors.slice(0, 10), // Limit error details
        data: null
      };

    } catch (error) {
      return {
        jobId: crypto.randomUUID(),
        status: 'failed',
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1
        },
        errors: [{
          message: error.message
        }]
      };
    }
  }

  /**
   * Poll for real-time meeting and webinar activity
   */
  async poll() {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
      const fromDate = since.toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];
      
      await this.ensureValidToken();
      
      const events = [];
      
      // Get recent meeting events from dashboard
      try {
        const meetingResponse = await this.client.get(
          `/metrics/meetings?type=past&from=${fromDate}&to=${toDate}&page_size=100`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        for (const meeting of meetingResponse.data.meetings || []) {
          const meetingTime = new Date(meeting.start_time);
          if (meetingTime > since) {
            events.push({
              id: `zoom-meeting-${meeting.uuid}`,
              type: 'meeting.started',
              timestamp: meetingTime,
              data: {
                meetingId: meeting.id,
                uuid: meeting.uuid,
                topic: meeting.topic,
                hostId: meeting.host_id,
                duration: meeting.duration,
                participants: meeting.participants_count,
                startTime: meeting.start_time,
                endTime: meeting.end_time
              },
              source: 'zoom'
            });
          }
        }
      } catch (error) {
        console.warn('Failed to get meeting events:', error.message);
      }

      return events;

    } catch (error) {
      console.error('Failed to poll Zoom events:', error);
      return [];
    }
  }

  /**
   * Execute actions on Zoom (create meetings, update settings, etc.)
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      await this.ensureValidToken();

      switch (actionType) {
        case 'create_meeting':
          return await this.createMeeting(target, parameters);
        
        case 'update_meeting':
          return await this.updateMeeting(target, parameters);
        
        case 'delete_meeting':
          return await this.deleteMeeting(target);
        
        case 'create_webinar':
          return await this.createWebinar(target, parameters);
        
        case 'send_invitation':
          return await this.sendMeetingInvitation(target, parameters);
        
        case 'update_user_settings':
          return await this.updateUserSettings(target, parameters);
        
        default:
          throw new Error(`Unsupported action: ${actionType}`);
      }

    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }
  }

  /**
   * Validate Zoom-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    const authType = config.credentials?.authType || 'oauth';

    if (authType === 'oauth') {
      if (!config.credentials?.clientId || !config.credentials?.clientSecret) {
        errors.push('Missing Zoom OAuth client ID or client secret');
      }
    } else if (authType === 'jwt') {
      if (!config.credentials?.apiKey || !config.credentials?.apiSecret) {
        errors.push('Missing Zoom JWT API key or secret');
      }
    } else {
      errors.push('Invalid auth type. Must be "oauth" or "jwt"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get connector capabilities
   */
  getCapabilities() {
    return {
      supportsSync: true,
      supportsPush: true,
      supportsPoll: true,
      rateLimit: 80, // Zoom API rate limit (per second)
      dataTypes: [
        'users',
        'meetings',
        'webinars',
        'recordings',
        'reports'
      ],
      actions: [
        'create_meeting',
        'update_meeting',
        'delete_meeting',
        'create_webinar',
        'send_invitation',
        'update_user_settings'
      ],
      meetingTypes: ['instant', 'scheduled', 'recurring', 'webinar']
    };
  }

  /**
   * Get data schema for Zoom integration
   */
  getSchema() {
    return {
      input: {
        user: {
          id: 'string',
          email: 'string',
          first_name: 'string',
          last_name: 'string',
          type: 'number',
          pmi: 'number'
        },
        meeting: {
          id: 'number',
          uuid: 'string',
          topic: 'string',
          type: 'number',
          start_time: 'string',
          duration: 'number',
          host_id: 'string'
        }
      },
      output: {
        nova_user: {
          userId: 'string',
          email: 'string',
          firstName: 'string',
          lastName: 'string',
          userType: 'string',
          pmi: 'string'
        },
        nova_meeting: {
          meetingId: 'string',
          topic: 'string',
          hostId: 'string',
          scheduledTime: 'date',
          duration: 'number',
          joinUrl: 'string'
        }
      }
    };
  }

  async shutdown() {
    // Cleanup resources
    this.client = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.config = null;
    console.log('Zoom connector shut down');
  }

  // Private helper methods

  validateZoomConfig(config) {
    const authType = config.credentials?.authType || 'oauth';
    
    if (authType === 'jwt' && !config.credentials?.apiKey?.match(/^[A-Za-z0-9_-]+$/)) {
      throw new Error('Invalid Zoom API key format');
    }
  }

  async authenticate() {
    try {
      const authType = this.config.credentials?.authType || 'oauth';

      if (authType === 'oauth') {
        await this.authenticateOAuth();
      } else if (authType === 'jwt') {
        await this.authenticateJWT();
      } else {
        throw new Error('Unsupported authentication type');
      }
      
      console.log('Zoom authentication successful');
    } catch (error) {
      throw new Error(`Zoom authentication failed: ${error.message}`);
    }
  }

  async authenticateOAuth() {
    // For OAuth, we assume the access token is provided or refreshed externally
    if (this.config.credentials.accessToken) {
      this.accessToken = this.config.credentials.accessToken;
      this.tokenExpiry = new Date(Date.now() + (3600 * 1000)); // Assume 1 hour expiry
    } else {
      throw new Error('OAuth access token not provided');
    }
  }

  async authenticateJWT() {
    // Create JWT token for Zoom API
    const payload = {
      iss: this.config.credentials.apiKey,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    };

    this.accessToken = jwt.sign(payload, this.config.credentials.apiSecret);
    this.tokenExpiry = new Date(Date.now() + (3600 * 1000));
  }

  async ensureValidToken() {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/users/me', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to connect to Zoom API');
      }
    } catch (error) {
      throw new Error(`Zoom connection test failed: ${error.message}`);
    }
  }

  async syncUsers(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let nextPageToken = '';
      const pageSize = 300;

      do {
        const params = new URLSearchParams({
          page_size: pageSize.toString(),
          status: 'active'
        });
        
        if (nextPageToken) {
          params.append('next_page_token', nextPageToken);
        }

        const response = await this.client.get(`/users?${params}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        const users = response.data.users || [];
        totalRecords += users.length;

        // Process each user
        for (const user of users) {
          try {
            await this.processUser(user);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              userId: user.id,
              message: error.message
            });
          }
        }

        nextPageToken = response.data.next_page_token || '';

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } while (nextPageToken);

      return {
        totalRecords,
        successCount,
        errorCount,
        errors
      };

    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }]
      };
    }
  }

  async syncMeetings(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      // Get meetings for the authenticated user
      let nextPageToken = '';
      const pageSize = 300;

      do {
        const params = new URLSearchParams({
          type: 'scheduled',
          page_size: pageSize.toString()
        });
        
        if (nextPageToken) {
          params.append('next_page_token', nextPageToken);
        }

        const response = await this.client.get(`/users/me/meetings?${params}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        const meetings = response.data.meetings || [];
        totalRecords += meetings.length;

        // Process each meeting
        for (const meeting of meetings) {
          try {
            await this.processMeeting(meeting);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              meetingId: meeting.id,
              message: error.message
            });
          }
        }

        nextPageToken = response.data.next_page_token || '';

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } while (nextPageToken);

      return {
        totalRecords,
        successCount,
        errorCount,
        errors
      };

    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }]
      };
    }
  }

  async syncWebinars(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let nextPageToken = '';
      const pageSize = 300;

      do {
        const params = new URLSearchParams({
          page_size: pageSize.toString()
        });
        
        if (nextPageToken) {
          params.append('next_page_token', nextPageToken);
        }

        const response = await this.client.get(`/users/me/webinars?${params}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        const webinars = response.data.webinars || [];
        totalRecords += webinars.length;

        // Process each webinar
        for (const webinar of webinars) {
          try {
            await this.processWebinar(webinar);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              webinarId: webinar.id,
              message: error.message
            });
          }
        }

        nextPageToken = response.data.next_page_token || '';

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } while (nextPageToken);

      return {
        totalRecords,
        successCount,
        errorCount,
        errors
      };

    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }]
      };
    }
  }

  async processUser(user) {
    // Transform Zoom user to Nova format
    const novaUser = {
      userId: `zoom-${user.id}`,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: `${user.first_name} ${user.last_name}`,
      userType: this.getUserType(user.type),
      pmi: user.pmi?.toString(),
      timezone: user.timezone,
      language: user.language,
      status: user.status,
      createdAt: new Date(user.created_at),
      lastLoginTime: new Date(user.last_login_time),
      source: 'zoom',
      zoomId: user.id,
      accountId: user.account_id
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Zoom user: ${novaUser.email}`);
    
    return novaUser;
  }

  async processMeeting(meeting) {
    // Transform Zoom meeting to Nova format
    const novaMeeting = {
      meetingId: `zoom-${meeting.id}`,
      uuid: meeting.uuid,
      topic: meeting.topic,
      type: this.getMeetingType(meeting.type),
      hostId: `zoom-${meeting.host_id}`,
      scheduledTime: new Date(meeting.start_time),
      duration: meeting.duration,
      timezone: meeting.timezone,
      agenda: meeting.agenda,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      password: meeting.password,
      status: meeting.status,
      createdAt: new Date(meeting.created_at),
      source: 'zoom',
      zoomId: meeting.id,
      zoomUuid: meeting.uuid
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Zoom meeting: ${novaMeeting.topic}`);
    
    return novaMeeting;
  }

  async processWebinar(webinar) {
    // Transform Zoom webinar to Nova format
    const novaWebinar = {
      webinarId: `zoom-${webinar.id}`,
      uuid: webinar.uuid,
      topic: webinar.topic,
      type: 'webinar',
      hostId: `zoom-${webinar.host_id}`,
      scheduledTime: new Date(webinar.start_time),
      duration: webinar.duration,
      timezone: webinar.timezone,
      agenda: webinar.agenda,
      joinUrl: webinar.join_url,
      registrationUrl: webinar.registration_url,
      status: webinar.status,
      createdAt: new Date(webinar.created_at),
      source: 'zoom',
      zoomId: webinar.id,
      zoomUuid: webinar.uuid
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Zoom webinar: ${novaWebinar.topic}`);
    
    return novaWebinar;
  }

  getUserType(typeNumber) {
    switch (typeNumber) {
      case 1: return 'basic';
      case 2: return 'licensed';
      case 3: return 'on-prem';
      default: return 'unknown';
    }
  }

  getMeetingType(typeNumber) {
    switch (typeNumber) {
      case 1: return 'instant';
      case 2: return 'scheduled';
      case 3: return 'recurring_no_fixed';
      case 8: return 'recurring_fixed';
      default: return 'unknown';
    }
  }

  async createMeeting(userId, parameters) {
    try {
      const {
        topic,
        type = 2, // Scheduled meeting
        start_time,
        duration = 60,
        timezone = 'UTC',
        password,
        agenda,
        settings = {}
      } = parameters;

      const meetingData = {
        topic,
        type,
        start_time,
        duration,
        timezone,
        password,
        agenda,
        settings: {
          host_video: settings.host_video || true,
          participant_video: settings.participant_video || true,
          join_before_host: settings.join_before_host || false,
          mute_upon_entry: settings.mute_upon_entry || true,
          watermark: settings.watermark || false,
          audio: settings.audio || 'both',
          auto_recording: settings.auto_recording || 'none',
          ...settings
        }
      };

      const response = await this.client.post(`/users/${userId}/meetings`, meetingData, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      return {
        success: true,
        message: 'Meeting created successfully',
        data: {
          meetingId: response.data.id,
          joinUrl: response.data.join_url,
          startUrl: response.data.start_url,
          topic: response.data.topic
        }
      };
    } catch (error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  async updateMeeting(meetingId, parameters) {
    try {
      const response = await this.client.patch(`/meetings/${meetingId}`, parameters, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      return {
        success: true,
        message: 'Meeting updated successfully',
        data: { meetingId }
      };
    } catch (error) {
      throw new Error(`Failed to update meeting: ${error.message}`);
    }
  }

  async deleteMeeting(meetingId) {
    try {
      await this.client.delete(`/meetings/${meetingId}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      return {
        success: true,
        message: 'Meeting deleted successfully',
        data: { meetingId }
      };
    } catch (error) {
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
  }

  async createWebinar(userId, parameters) {
    try {
      const response = await this.client.post(`/users/${userId}/webinars`, parameters, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      return {
        success: true,
        message: 'Webinar created successfully',
        data: {
          webinarId: response.data.id,
          joinUrl: response.data.join_url,
          registrationUrl: response.data.registration_url
        }
      };
    } catch (error) {
      throw new Error(`Failed to create webinar: ${error.message}`);
    }
  }

  async sendMeetingInvitation(meetingId, parameters) {
    try {
      const { email_addresses } = parameters;
      
      // Zoom doesn't have a direct API for sending invitations
      // This would typically be handled through email integration
      
      return {
        success: true,
        message: 'Invitation functionality noted (requires email integration)',
        data: { meetingId, recipients: email_addresses }
      };
    } catch (error) {
      throw new Error(`Failed to send invitation: ${error.message}`);
    }
  }

  async updateUserSettings(userId, parameters) {
    try {
      const response = await this.client.patch(`/users/${userId}/settings`, parameters, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      return {
        success: true,
        message: 'User settings updated successfully',
        data: { userId }
      };
    } catch (error) {
      throw new Error(`Failed to update user settings: ${error.message}`);
    }
  }
}
