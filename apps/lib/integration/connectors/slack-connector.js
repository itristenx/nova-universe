/**
 * Slack Connector
 * Implements Slack Web API for communication and collaboration integration
 * 
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Slack Connector for team communication and workflow integration
 * Follows enterprise integration patterns for collaboration platforms
 */
export class SlackConnector extends IConnector {
  constructor() {
    super('slack-connector', 'Slack', '1.0.0', ConnectorType.COMMUNICATION_PLATFORM);
    this.client = null;
    this.config = null;
    this.botToken = null;
    this.userToken = null;
  }

  /**
   * Initialize Slack connector with enterprise configuration
   */
  async initialize(config) {
    try {
      this.config = config;
      
      // Validate Slack-specific configuration
      this.validateSlackConfig(config);
      
      // Store tokens
      this.botToken = config.credentials.botToken;
      this.userToken = config.credentials.userToken;
      
      // Initialize Slack API client
      this.client = axios.create({
        baseURL: config.endpoints.slackUrl || 'https://slack.com/api',
        timeout: config.timeout || 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Test the connection
      await this.testConnection();
      
      console.log('Slack connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Slack connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive Slack API testing
   */
  async health() {
    try {
      const startTime = Date.now();
      
      // Test bot token
      const authResponse = await this.client.post('/auth.test', {}, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });
      
      const apiLatency = Date.now() - startTime;

      // Test users.list access
      let usersStatus = 'healthy';
      let usersLatency = 0;
      
      try {
        const usersStartTime = Date.now();
        await this.client.get('/users.list?limit=1', {
          headers: { 'Authorization': `Bearer ${this.botToken}` }
        });
        usersLatency = Date.now() - usersStartTime;
      } catch (error) {
        usersStatus = 'degraded';
      }

      // Test channels.list access
      let channelsStatus = 'healthy';
      let channelsLatency = 0;
      
      try {
        const channelsStartTime = Date.now();
        await this.client.get('/conversations.list?limit=1', {
          headers: { 'Authorization': `Bearer ${this.botToken}` }
        });
        channelsLatency = Date.now() - channelsStartTime;
      } catch (error) {
        channelsStatus = 'degraded';
      }

      const overallStatus = authResponse.data.ok && usersStatus === 'healthy' && channelsStatus === 'healthy'
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
            name: 'users_latency',
            value: usersLatency,
            unit: 'ms'
          },
          {
            name: 'channels_latency',
            value: channelsLatency,
            unit: 'ms'
          },
          {
            name: 'auth_status',
            value: authResponse.data.ok ? 1 : 0,
            unit: 'boolean'
          }
        ],
        issues: overallStatus !== HealthStatus.HEALTHY ? ['Some Slack API endpoints degraded'] : []
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
   * Sync users, channels, and messages from Slack
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      let totalRecords = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync from Slack...`);

      // Sync users
      const usersResult = await this.syncUsers(options);
      totalRecords += usersResult.totalRecords;
      successCount += usersResult.successCount;
      errorCount += usersResult.errorCount;
      errors.push(...usersResult.errors);

      // Sync channels/conversations
      const channelsResult = await this.syncChannels(options);
      totalRecords += channelsResult.totalRecords;
      successCount += channelsResult.successCount;
      errorCount += channelsResult.errorCount;
      errors.push(...channelsResult.errors);

      // Sync recent messages (if enabled)
      if (options.includeMessages) {
        const messagesResult = await this.syncMessages(options);
        totalRecords += messagesResult.totalRecords;
        successCount += messagesResult.successCount;
        errorCount += messagesResult.errorCount;
        errors.push(...messagesResult.errors);
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
   * Poll for real-time messages and channel activity
   */
  async poll() {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
      const sinceTimestamp = Math.floor(since.getTime() / 1000);
      
      const events = [];
      
      // Get recent public channel messages
      const channelsResponse = await this.client.get('/conversations.list?types=public_channel&limit=50', {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      for (const channel of channelsResponse.data.channels || []) {
        try {
          const messagesResponse = await this.client.get(
            `/conversations.history?channel=${channel.id}&oldest=${sinceTimestamp}&limit=10`, {
            headers: { 'Authorization': `Bearer ${this.botToken}` }
          });

          for (const message of messagesResponse.data.messages || []) {
            if (message.type === 'message' && !message.subtype) {
              events.push({
                id: `slack-message-${message.ts}`,
                type: 'message.sent',
                timestamp: new Date(parseFloat(message.ts) * 1000),
                data: {
                  messageId: message.ts,
                  channelId: channel.id,
                  channelName: channel.name,
                  userId: message.user,
                  text: message.text,
                  threadTs: message.thread_ts
                },
                source: 'slack'
              });
            }
          }

          // Respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to get messages for channel ${channel.name}:`, error.message);
        }
      }

      return events;

    } catch (error) {
      console.error('Failed to poll Slack events:', error);
      return [];
    }
  }

  /**
   * Execute actions on Slack (send messages, create channels, etc.)
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      switch (actionType) {
        case 'send_message':
          return await this.sendMessage(target, parameters);
        
        case 'create_channel':
          return await this.createChannel(parameters);
        
        case 'invite_to_channel':
          return await this.inviteToChannel(target, parameters);
        
        case 'set_channel_topic':
          return await this.setChannelTopic(target, parameters);
        
        case 'send_notification':
          return await this.sendNotification(target, parameters);
        
        case 'update_status':
          return await this.updateUserStatus(parameters);
        
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
   * Validate Slack-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.credentials?.botToken || !config.credentials.botToken.startsWith('xoxb-')) {
      errors.push('Missing or invalid Slack bot token');
    }

    if (config.credentials?.userToken && !config.credentials.userToken.startsWith('xoxp-')) {
      errors.push('Invalid Slack user token format');
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
      rateLimit: 50, // Slack Web API rate limit (per minute)
      dataTypes: [
        'users',
        'channels',
        'messages',
        'files',
        'workflows'
      ],
      actions: [
        'send_message',
        'create_channel',
        'invite_to_channel',
        'set_channel_topic',
        'send_notification',
        'update_status'
      ],
      communicationTypes: ['instant_messaging', 'channels', 'workflows', 'notifications']
    };
  }

  /**
   * Get data schema for Slack integration
   */
  getSchema() {
    return {
      input: {
        user: {
          id: 'string',
          name: 'string',
          real_name: 'string',
          email: 'string',
          is_bot: 'boolean',
          deleted: 'boolean'
        },
        channel: {
          id: 'string',
          name: 'string',
          is_channel: 'boolean',
          is_private: 'boolean',
          is_archived: 'boolean'
        },
        message: {
          ts: 'string',
          user: 'string',
          text: 'string',
          channel: 'string',
          thread_ts: 'string'
        }
      },
      output: {
        nova_user: {
          userId: 'string',
          username: 'string',
          displayName: 'string',
          email: 'string',
          isBot: 'boolean',
          status: 'string'
        },
        nova_channel: {
          channelId: 'string',
          channelName: 'string',
          type: 'string',
          isPrivate: 'boolean',
          memberCount: 'number'
        }
      }
    };
  }

  async shutdown() {
    // Cleanup resources
    this.client = null;
    this.botToken = null;
    this.userToken = null;
    this.config = null;
    console.log('Slack connector shut down');
  }

  // Private helper methods

  validateSlackConfig(config) {
    if (!config.credentials?.botToken) {
      throw new Error('Slack bot token is required');
    }
  }

  async testConnection() {
    try {
      const response = await this.client.post('/auth.test', {}, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });
      
      if (!response.data.ok) {
        throw new Error('Failed to authenticate with Slack API');
      }
      
      console.log(`Connected to Slack workspace: ${response.data.team}`);
    } catch (error) {
      throw new Error(`Slack connection test failed: ${error.message}`);
    }
  }

  async syncUsers(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let cursor = '';
      const limit = 200;

      do {
        const params = new URLSearchParams({
          limit: limit.toString()
        });
        
        if (cursor) {
          params.append('cursor', cursor);
        }

        const response = await this.client.get(`/users.list?${params}`, {
          headers: { 'Authorization': `Bearer ${this.botToken}` }
        });

        if (!response.data.ok) {
          throw new Error(response.data.error || 'Failed to fetch users');
        }

        const users = response.data.members || [];
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

        cursor = response.data.response_metadata?.next_cursor || '';

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1200)); // 50 requests per minute

      } while (cursor);

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

  async syncChannels(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      let cursor = '';
      const limit = 200;

      do {
        const params = new URLSearchParams({
          limit: limit.toString(),
          types: 'public_channel,private_channel'
        });
        
        if (cursor) {
          params.append('cursor', cursor);
        }

        const response = await this.client.get(`/conversations.list?${params}`, {
          headers: { 'Authorization': `Bearer ${this.botToken}` }
        });

        if (!response.data.ok) {
          throw new Error(response.data.error || 'Failed to fetch channels');
        }

        const channels = response.data.channels || [];
        totalRecords += channels.length;

        // Process each channel
        for (const channel of channels) {
          try {
            await this.processChannel(channel);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              channelId: channel.id,
              message: error.message
            });
          }
        }

        cursor = response.data.response_metadata?.next_cursor || '';

        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1200));

      } while (cursor);

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

  async syncMessages(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      // Only sync messages from the last 24 hours to avoid excessive data
      const since = options.lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sinceTimestamp = Math.floor(since.getTime() / 1000);

      // Get channels first
      const channelsResponse = await this.client.get('/conversations.list?types=public_channel&limit=100', {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      for (const channel of channelsResponse.data.channels || []) {
        try {
          const messagesResponse = await this.client.get(
            `/conversations.history?channel=${channel.id}&oldest=${sinceTimestamp}&limit=100`, {
            headers: { 'Authorization': `Bearer ${this.botToken}` }
          });

          const messages = messagesResponse.data.messages || [];
          totalRecords += messages.length;

          for (const message of messages) {
            try {
              await this.processMessage(message, channel);
              successCount++;
            } catch (error) {
              errorCount++;
              errors.push({
                messageId: message.ts,
                channelId: channel.id,
                message: error.message
              });
            }
          }

          // Respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1200));
        } catch (error) {
          console.warn(`Failed to sync messages for channel ${channel.name}:`, error.message);
        }
      }

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
    // Transform Slack user to Nova format
    const novaUser = {
      userId: `slack-${user.id}`,
      username: user.name,
      displayName: user.real_name || user.name,
      email: user.profile?.email,
      isBot: user.is_bot || false,
      isDeleted: user.deleted || false,
      status: user.deleted ? 'inactive' : 'active',
      timezone: user.tz,
      avatarUrl: user.profile?.image_192,
      title: user.profile?.title,
      phone: user.profile?.phone,
      source: 'slack',
      slackId: user.id,
      teamId: user.team_id,
      isAdmin: user.is_admin || false,
      isOwner: user.is_owner || false
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Slack user: ${novaUser.username}`);
    
    return novaUser;
  }

  async processChannel(channel) {
    // Transform Slack channel to Nova format
    const novaChannel = {
      channelId: `slack-${channel.id}`,
      channelName: channel.name,
      type: channel.is_channel ? 'channel' : 'group',
      isPrivate: channel.is_private || false,
      isArchived: channel.is_archived || false,
      topic: channel.topic?.value,
      purpose: channel.purpose?.value,
      memberCount: channel.num_members,
      createdAt: new Date(channel.created * 1000),
      source: 'slack',
      slackId: channel.id,
      creator: channel.creator
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Slack channel: ${novaChannel.channelName}`);
    
    return novaChannel;
  }

  async processMessage(message, channel) {
    // Transform Slack message to Nova format
    const novaMessage = {
      messageId: `slack-${message.ts}`,
      channelId: `slack-${channel.id}`,
      channelName: channel.name,
      userId: message.user ? `slack-${message.user}` : null,
      text: message.text,
      timestamp: new Date(parseFloat(message.ts) * 1000),
      threadTs: message.thread_ts,
      isThreadReply: !!message.thread_ts,
      messageType: message.type,
      subtype: message.subtype,
      source: 'slack',
      slackMessageTs: message.ts,
      slackChannelId: channel.id
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed Slack message in #${channel.name}`);
    
    return novaMessage;
  }

  async sendMessage(channelId, parameters) {
    try {
      const { text, blocks, thread_ts, as_user = false } = parameters;
      
      const payload = {
        channel: channelId,
        text,
        as_user
      };

      if (blocks) {
        payload.blocks = blocks;
      }

      if (thread_ts) {
        payload.thread_ts = thread_ts;
      }

      const response = await this.client.post('/chat.postMessage', payload, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to send message');
      }

      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          messageId: response.data.ts,
          channelId: response.data.channel
        }
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async createChannel(parameters) {
    try {
      const { name, is_private = false, purpose, topic } = parameters;
      
      const endpoint = is_private ? '/conversations.create' : '/conversations.create';
      const payload = {
        name,
        is_private
      };

      const response = await this.client.post(endpoint, payload, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to create channel');
      }

      const channelId = response.data.channel.id;

      // Set purpose and topic if provided
      if (purpose) {
        await this.client.post('/conversations.setPurpose', {
          channel: channelId,
          purpose
        }, {
          headers: { 'Authorization': `Bearer ${this.botToken}` }
        });
      }

      if (topic) {
        await this.client.post('/conversations.setTopic', {
          channel: channelId,
          topic
        }, {
          headers: { 'Authorization': `Bearer ${this.botToken}` }
        });
      }

      return {
        success: true,
        message: 'Channel created successfully',
        data: {
          channelId,
          channelName: name
        }
      };
    } catch (error) {
      throw new Error(`Failed to create channel: ${error.message}`);
    }
  }

  async inviteToChannel(channelId, parameters) {
    try {
      const { users } = parameters; // Array of user IDs
      
      const response = await this.client.post('/conversations.invite', {
        channel: channelId,
        users: users.join(',')
      }, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to invite users');
      }

      return {
        success: true,
        message: 'Users invited successfully',
        data: { channelId, invitedUsers: users }
      };
    } catch (error) {
      throw new Error(`Failed to invite users: ${error.message}`);
    }
  }

  async setChannelTopic(channelId, parameters) {
    try {
      const { topic } = parameters;
      
      const response = await this.client.post('/conversations.setTopic', {
        channel: channelId,
        topic
      }, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to set channel topic');
      }

      return {
        success: true,
        message: 'Channel topic updated successfully',
        data: { channelId, topic }
      };
    } catch (error) {
      throw new Error(`Failed to set channel topic: ${error.message}`);
    }
  }

  async sendNotification(userId, parameters) {
    try {
      const { message, channel = userId } = parameters;
      
      // Send a direct message
      const response = await this.client.post('/chat.postMessage', {
        channel,
        text: message,
        as_user: false
      }, {
        headers: { 'Authorization': `Bearer ${this.botToken}` }
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to send notification');
      }

      return {
        success: true,
        message: 'Notification sent successfully',
        data: { userId, messageId: response.data.ts }
      };
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  async updateUserStatus(parameters) {
    try {
      const { status_text, status_emoji, status_expiration } = parameters;
      
      const profile = {
        status_text,
        status_emoji
      };

      if (status_expiration) {
        profile.status_expiration = status_expiration;
      }

      const response = await this.client.post('/users.profile.set', {
        profile
      }, {
        headers: { 'Authorization': `Bearer ${this.userToken || this.botToken}` }
      });

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to update status');
      }

      return {
        success: true,
        message: 'User status updated successfully',
        data: { status_text, status_emoji }
      };
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }
}
