/**
 * Nova Universe Slack Integration Service
 *
 * This service provides Slack bot functionality for Nova Universe, allowing users to:
 * - Submit tickets via /new-ticket command
 * - Interact with modals for ticket creation
 * - Receive confirmations and status updates
 * - Convert Slack messages to tickets via message shortcuts
 * - Full Cosmo AI conversation support
 *
 * Environment Variables Required:
 * - SLACK_SIGNING_SECRET: Slack app signing secret
 * - SLACK_BOT_TOKEN: Bot User OAuth token
 * - JWT_SECRET: Secret for JWT token generation
 * - JWT_EXPIRES_IN: JWT expiration time (default: 1h)
 * - VITE_ADMIN_URL: Admin panel URL for ticket links
 */

import pkg from '@slack/bolt';
const { App } = pkg;
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { logger } from '../logger.js';

let slackApp = null;
let isInitialized = false;
let activeConversations = new Map(); // Track Cosmo conversation states
let conversationMutex = new Map(); // Prevent race conditions in conversation handling

// Constants
const CONVERSATION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

/**
 * Format message content for ticket description
 */
function formatMessageContent(messageContent, userInfo, channelId, messageTs) {
  const userName = userInfo?.user?.real_name || userInfo?.user?.name || 'Unknown User';
  const timestamp = new Date(parseFloat(messageTs) * 1000).toISOString();
  
  return `Original Slack message from ${userName}:\n\n${messageContent}\n\n---\nChannel: <#${channelId}>\nTimestamp: ${timestamp}`;
}

/**
 * Parse metadata safely with fallback
 */
function parseMetadata(privateMetadata) {
  try {
    return privateMetadata ? JSON.parse(privateMetadata) : {};
  } catch {
    return { channel: privateMetadata };
  }
}

/**
 * Open a DM conversation with a user
 */
async function openDMConversation(client, userId) {
  try {
    const response = await client.conversations.open({
      users: userId
    });
    return response.channel.id;
  } catch (error) {
    logger.error('Failed to open DM conversation:', error.message);
    throw error;
  }
}

/**
 * Get or create a conversation ID for posting messages
 */
async function getConversationId(client, metadata, userId) {
  if (metadata.channel && metadata.channel.startsWith('C') || metadata.channel.startsWith('G') || metadata.channel.startsWith('D')) {
    return metadata.channel;
  }
  
  // For global shortcuts or invalid channels, open a DM
  return await openDMConversation(client, userId);
}

/**
 * Safely access conversation state with mutex
 */
async function withConversationLock(conversationKey, operation) {
  // Simple mutex implementation using promises
  if (conversationMutex.has(conversationKey)) {
    await conversationMutex.get(conversationKey);
  }
  
  const lockPromise = (async () => {
    try {
      return await operation();
    } finally {
      conversationMutex.delete(conversationKey);
    }
  })();
  
  conversationMutex.set(conversationKey, lockPromise);
  return lockPromise;
}

/**
 * Validate required environment variables for Slack integration
 */
function validateSlackEnv() {
  const required = ['SLACK_SIGNING_SECRET', 'SLACK_BOT_TOKEN', 'JWT_SECRET'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Missing required Slack environment variables: ${missing.join(', ')}`);
  }

  return {
    port: parseInt(process.env.SLACK_PORT) || 3001,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    adminUrl: process.env.VITE_ADMIN_URL,
    // Optional service identity for JWTs used to call Nova API
    serviceUserId: process.env.COMMS_SERVICE_USER_ID || 'comms-service',
    serviceUserEmail: process.env.COMMS_SERVICE_USER_EMAIL || 'comms@nova.local',
    serviceUserName: process.env.COMMS_SERVICE_USER_NAME || 'Nova Comms Bot',
    serviceUserRole: process.env.COMMS_SERVICE_USER_ROLE || 'technician',
    tenantId: process.env.COMMS_TENANT_ID || 'default',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
  };
}

/**
 * Issue a service JWT token for API calls
 */
function issueServiceJWT(extraPayload = {}) {
  const config = validateSlackEnv();
  const payload = {
    id: config.serviceUserId,
    email: config.serviceUserEmail,
    name: config.serviceUserName,
    role: config.serviceUserRole,
    tenantId: config.tenantId,
    source: 'comms',
    ...extraPayload,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: config.jwtExpiresIn,
    issuer: 'nova-universe-api',
    audience: 'nova-universe',
  });
}

/**
 * Build Slack modal for ticket submission
 */
function buildModal(systems = [], urgencies = [], channel, messageContent = '') {
  const systemOptions = systems.map((s) => ({
    text: { type: 'plain_text', text: s },
    value: s,
  }));
  const urgencyOptions = urgencies.length ? urgencies.map((u) => ({
    text: { type: 'plain_text', text: u },
    value: u,
  })) : [
    { text: { type: 'plain_text', text: 'Low' }, value: 'low' },
    { text: { type: 'plain_text', text: 'Medium' }, value: 'medium' },
    { text: { type: 'plain_text', text: 'High' }, value: 'high' },
    { text: { type: 'plain_text', text: 'Critical' }, value: 'critical' }
  ];

  return {
    type: 'modal',
    callback_id: 'ticket_submit',
    private_metadata: channel || '',
    title: { type: 'plain_text', text: 'New Support Ticket' },
    submit: { type: 'plain_text', text: 'Submit' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'input',
        block_id: 'name',
        label: { type: 'plain_text', text: 'Name' },
        element: { type: 'plain_text_input', action_id: 'value' },
      },
      {
        type: 'input',
        block_id: 'email',
        label: { type: 'plain_text', text: 'Email' },
        element: { 
          type: 'plain_text_input', 
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'your.email@company.com' }
        },
      },
      {
        type: 'input',
        block_id: 'title',
        label: { type: 'plain_text', text: 'Issue Title' },
        element: { 
          type: 'plain_text_input', 
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Brief description of the issue' }
        },
      },
      {
        type: 'input',
        block_id: 'system',
        label: { type: 'plain_text', text: 'System/Category' },
        element:
          systemOptions.length > 0
            ? {
                type: 'static_select',
                action_id: 'value',
                options: systemOptions,
                placeholder: { type: 'plain_text', text: 'Select a system' }
              }
            : { 
                type: 'plain_text_input', 
                action_id: 'value',
                placeholder: { type: 'plain_text', text: 'e.g., Network, Hardware, Software' }
              },
      },
      {
        type: 'input',
        block_id: 'urgency',
        label: { type: 'plain_text', text: 'Priority' },
        element: {
          type: 'static_select',
          action_id: 'value',
          options: urgencyOptions,
          placeholder: { type: 'plain_text', text: 'Select priority level' }
        },
      },
      {
        type: 'input',
        block_id: 'description',
        label: { type: 'plain_text', text: 'Description' },
        element: {
          type: 'plain_text_input',
          multiline: true,
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Detailed description of the issue...' },
          initial_value: messageContent || ''
        },
        optional: true,
      },
    ],
  };
}

/**
 * Initialize Slack app and set up handlers
 */
export function initializeSlackApp() {
  if (isInitialized) {
    return slackApp;
  }

  try {
    const config = validateSlackEnv();

    slackApp = new App({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      token: process.env.SLACK_BOT_TOKEN,
    });

    // Back-compat command
    slackApp.command('/new-ticket', async ({ ack, body, client }) => {
      await ack();
      try {
        const token = issueServiceJWT({ type: 'slack' });
        const res = await axios.get(`${config.apiUrl}/api/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const systems = Array.isArray(res.data.systems)
          ? res.data.systems
          : String(res.data.systems || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        const urgencies = Array.isArray(res.data.urgencyLevels)
          ? res.data.urgencyLevels
          : String(res.data.urgencyLevels || '')
              .split(',')
              .map((u) => u.trim())
              .filter(Boolean);

        const view = buildModal(systems, urgencies, body.channel_id);
        await client.views.open({ trigger_id: body.trigger_id, view });
      } catch (err) {
        logger.error('Failed to fetch config:', err.message);
        const view = buildModal([], [], body.channel_id);
        await client.views.open({ trigger_id: body.trigger_id, view });
      }
    });

    // End-user friendly alias
    slackApp.command('/it-help', async ({ ack, body, client }) => {
      await ack();
      try {
        const token = issueServiceJWT({ type: 'slack' });
        const res = await axios.get(`${config.apiUrl}/api/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const systems = Array.isArray(res.data.systems) ? res.data.systems : [];
        const urgencies = Array.isArray(res.data.urgencyLevels)
          ? res.data.urgencyLevels
          : ['Low', 'Medium', 'High', 'Critical'];
        const view = buildModal(systems, urgencies, body.channel_id);
        await client.views.open({ trigger_id: body.trigger_id, view });
      } catch (err) {
        logger.warn('Failed to fetch config for /it-help command:', err.message);
        const view = buildModal([], [], body.channel_id);
        await client.views.open({ trigger_id: body.trigger_id, view });
      }
    });

    slackApp.view('ticket_submit', async ({ ack, body, view, client }) => {
      await ack();

      const state = view.state.values;
      const payload = {
        name: state.name.value.value,
        email: state.email.value.value,
        title: state.title.value.value,
        system: state.system.value.selected_option?.value || state.system.value.value,
        urgency: state.urgency.value.selected_option.value,
        description: state.description?.value?.value || '',
      };

      try {
        // Parse metadata if it exists (from message shortcuts)
        const metadata = parseMetadata(view.private_metadata);

        // Create ticket via Nova Platform API
        const token = issueServiceJWT({ 
          type: 'slack',
          user: {
            name: payload.name,
            email: payload.email
          }
        });
        
        const createBody = {
          title: payload.title,
          description: payload.description || payload.title,
          category: payload.system || 'general',
          priority: String(payload.urgency || 'medium').toLowerCase(),
          contactMethod: 'email',
          contactInfo: payload.email,
          // Additional context from Slack
          source: 'slack',
          sourceChannel: metadata.channel || view.private_metadata,
          sourceUser: body.user.id,
          sourceMessageTs: metadata.messageTs,
          sourceMessageUser: metadata.sourceUser
        };

        logger.info('Creating ticket with payload:', createBody);
        
        const res = await axios.post(`${config.apiUrl}/api/v1/orbit/tickets`, createBody, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const ticket = res.data?.ticket;
        const ticketId = ticket?.ticketId || ticket?.id || 'NEW-TICKET';
        
        // Success response with enhanced formatting
        const blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:white_check_mark: *Ticket ${ticketId} created successfully!*`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Title:*\n${payload.title}`,
              },
              {
                type: 'mrkdwn',
                text: `*Priority:*\n${payload.urgency}`,
              },
              {
                type: 'mrkdwn',
                text: `*Category:*\n${payload.system || 'General'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Contact:*\n${payload.email}`,
              },
            ],
          },
        ];

        if (config.adminUrl) {
          blocks.push({
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Ticket',
                },
                url: `${config.adminUrl}/tickets/${ticketId}`,
                action_id: 'view_ticket',
              },
            ],
          });
        }

        // Get the appropriate conversation ID for posting the success message
        const conversationId = await getConversationId(client, metadata, body.user.id);

        await client.chat.postEphemeral({
          channel: conversationId,
          user: body.user.id,
          text: `Ticket ${ticketId} created successfully!`,
          blocks,
        });

        // If this was created from a message, also post a threaded reply to the original message
        if (metadata.messageTs && metadata.channel) {
          await client.chat.postMessage({
            channel: metadata.channel,
            thread_ts: metadata.messageTs,
            text: `:white_check_mark: This message has been converted to ticket *${ticketId}*`,
          });
        }

      } catch (err) {
        logger.error('Failed to submit ticket:', err.message);
        logger.error('Error details:', err.response?.data);
        
        try {
          const metadata = parseMetadata(view.private_metadata);
          const conversationId = await getConversationId(client, metadata, body.user.id);
          
          await client.chat.postEphemeral({
            channel: conversationId,
            user: body.user.id,
            text: ':x: Failed to create ticket. Please try again or contact support.',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: ':x: *Failed to create ticket*\n\nThere was an error processing your request. Please try again or contact your IT support team directly.',
                },
              },
            ],
          });
        } catch (errorPostErr) {
          logger.error('Failed to post error message:', errorPostErr.message);
        }
      }
    });

    // /nova-status → summarize enhanced monitoring and status config
    slackApp.command('/nova-status', async ({ ack, body, client }) => {
      await ack();
      try {
        const token = issueServiceJWT();
        const [statusConfig, monitors] = await Promise.all([
          axios
            .get(`${config.apiUrl}/api/status-config`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => r.data)
            .catch(() => ({})),
          axios
            .get(`${config.apiUrl}/api/enhanced-monitoring/monitors`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => r.data)
            .catch(() => ({ monitors: [] })),
        ]);
        
        const current = statusConfig.currentStatus || 'unknown';
        const total = (monitors.monitors || []).length;
        const up = (monitors.monitors || []).filter((m) => m.current_status !== false).length;
        
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: `📊 *Nova System Status*\n\n*Overall Status:* ${current}\n*Monitors:* ${up}/${total} operational`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `📊 *Nova System Status*\n\n*Overall Status:* ${current}\n*Monitors:* ${up}/${total} operational`,
              },
            },
          ],
        });
      } catch (e) {
        logger.error('Failed to fetch status for /nova-status:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: ':warning: Unable to fetch system status at this time.',
        });
      }
    });

    // /nova-queue → Pulse queue metrics summary
    slackApp.command('/nova-queue', async ({ ack, body, client }) => {
      await ack();
      try {
        const token = issueServiceJWT();
        const res = await axios.get(`${config.apiUrl}/api/v1/pulse/queues/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const metrics = res.data?.metrics || [];
        const queueSummary = metrics
          .slice(0, 5)
          .map(
            (q) => `• *${q.queue_name || q.queueName}:* ${q.open_tickets || q.openTickets || 0} open tickets`,
          )
          .join('\n');
        
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: `📋 *Queue Summary*\n\n${queueSummary || 'No queue metrics available'}`,
        });
      } catch (e) {
        logger.error('Failed to fetch queue metrics for /nova-queue:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: ':warning: Unable to fetch queue metrics at this time.',
        });
      }
    });

    // /nova-feedback → submit platform feedback
    slackApp.command('/nova-feedback', async ({ ack, body, client, command }) => {
      await ack();
      try {
        const token = issueServiceJWT({
          name: body.user_name,
          id: body.user_id,
          email: `${body.user_id}@slack.local`,
        });
        
        const subject = 'Slack Feedback';
        const message = command.text?.slice(0, 1000) || 'No message provided';
        const type = 'feedback';
        
        await axios.post(
          `${config.apiUrl}/api/v1/orbit/feedback`,
          { subject, message, type },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: ':white_check_mark: Thank you for your feedback! It has been submitted to the Nova team.',
        });
      } catch (e) {
        logger.error('Failed to submit feedback for /nova-feedback:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: ':x: Failed to submit feedback. Please try again later.',
        });
      }
    });

    // /nova-assign <TICKET_ID> → leverage Synth v2 optimize or direct assign
    slackApp.command('/nova-assign', async ({ ack, body, client, command }) => {
      await ack();
      const text = (command.text || '').trim();
      if (!text) {
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Usage: `/nova-assign <TICKET_ID>`\nExample: `/nova-assign INC000001`',
        });
        return;
      }
      
      try {
        const token = issueServiceJWT();
        const optimize = await axios
          .post(
            `${config.apiUrl}/api/v1/synth/optimize/assignment`,
            { ticketId: text },
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .then((r) => r.data)
          .catch(() => null);
        
        const rec = optimize?.recommendation?.recommendedTechnician?.name || 'a qualified technician';
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: `🎯 *Assignment Recommendation for ${text}*\n\nRecommended assignee: **${rec}**`,
        });
      } catch (e) {
        logger.error('Failed to compute assignment for /nova-assign:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: ':warning: Failed to compute assignment recommendation.',
        });
      }
    });

    // Cosmo AI conversation with enhanced threading and synchronization
    slackApp.event('app_mention', async ({ event, client }) => {
      try {
        const token = issueServiceJWT({
          name: event.user,
          id: event.user,
          email: `${event.user}@slack.local`,
        });
        
        const conversationKey = `${event.channel}-${event.thread_ts || event.ts}`;
        const userMessage = event.text.replace(/<@[^>]+>/g, '').trim() || 'Help';
        
        // Use mutex to prevent race conditions
        const response = await withConversationLock(conversationKey, async () => {
          if (activeConversations.has(conversationKey)) {
            // Continue existing conversation
            const conversationId = activeConversations.get(conversationKey);
            return await axios.post(
              `${config.apiUrl}/api/v2/synth/conversation/continue`,
              {
                conversationId,
                message: userMessage,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          } else {
            // Start new conversation
            const response = await axios.post(
              `${config.apiUrl}/api/v2/synth/conversation/start`,
              {
                context: { module: 'comms', userRole: 'user' },
                initialMessage: userMessage,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            
            // Store conversation ID for threading
            if (response.data?.conversationId) {
              activeConversations.set(conversationKey, response.data.conversationId);
              // Clean up after timeout
              setTimeout(() => {
                activeConversations.delete(conversationKey);
              }, CONVERSATION_TIMEOUT_MS);
            }
            
            return response;
          }
        });
        
        const message = response.data?.message || 'Hello! How can I help you today?';
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.thread_ts || event.ts,
          text: `🤖 ${message}`,
        });
      } catch (err) {
        logger.error('Failed to handle app mention:', err.message);
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.thread_ts || event.ts,
          text: '🤖 Hi! I\'m currently unavailable, but I\'ll be back soon. For immediate help, try `/it-help` to create a support ticket.',
        });
      }
    });

    // Message shortcut: Convert any Slack message to a ticket
    slackApp.shortcut('create_ticket_from_message', async ({ ack, body, client }) => {
      await ack();
      
      try {
        // Get the message content
        const messageTs = body.message_ts;
        const channelId = body.channel.id;
        
        // Fetch the original message
        const messageInfo = await client.conversations.history({
          channel: channelId,
          latest: messageTs,
          limit: 1,
          inclusive: true
        });
        
        const originalMessage = messageInfo.messages?.[0];
        const messageContent = originalMessage?.text || '';
        const messageUser = originalMessage?.user;
        
        // Get user info for the message author
        let userInfo = null;
        if (messageUser) {
          try {
            userInfo = await client.users.info({ user: messageUser });
          } catch (e) {
            logger.warn('Could not fetch user info:', e.message);
          }
        }
        
        // Build modal with message content pre-filled
        const token = issueServiceJWT({ type: 'slack' });
        const res = await axios.get(`${config.apiUrl}/api/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const systems = Array.isArray(res.data.systems)
          ? res.data.systems
          : String(res.data.systems || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        
        const urgencies = Array.isArray(res.data.urgencyLevels)
          ? res.data.urgencyLevels
          : String(res.data.urgencyLevels || '')
              .split(',')
              .map((u) => u.trim())
              .filter(Boolean);

        // Format message content for ticket description
        const formattedContent = formatMessageContent(messageContent, userInfo, channelId, messageTs);
        
        const view = buildModal(systems, urgencies, channelId, formattedContent);
        
        // Update the modal title to indicate it's from a message
        view.title.text = 'Create Ticket from Message';
        view.private_metadata = JSON.stringify({
          channel: channelId,
          messageTs: messageTs,
          sourceUser: messageUser
        });
        
        await client.views.open({ 
          trigger_id: body.trigger_id, 
          view 
        });
        
      } catch (err) {
        logger.error('Failed to create ticket from message:', err.message);
        await client.chat.postEphemeral({
          channel: body.channel.id,
          user: body.user.id,
          text: ':x: Failed to create ticket from message. Please try again or use `/it-help` to create a ticket manually.',
        });
      }
    });

    // Global shortcut: Quick ticket creation
    slackApp.shortcut('quick_ticket', async ({ ack, body, client }) => {
      await ack();
      
      try {
        const token = issueServiceJWT({ type: 'slack' });
        const res = await axios.get(`${config.apiUrl}/api/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const systems = Array.isArray(res.data.systems)
          ? res.data.systems
          : String(res.data.systems || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        
        const urgencies = Array.isArray(res.data.urgencyLevels)
          ? res.data.urgencyLevels
          : String(res.data.urgencyLevels || '')
              .split(',')
              .map((u) => u.trim())
              .filter(Boolean);

        const view = buildModal(systems, urgencies, '');
        await client.views.open({ trigger_id: body.trigger_id, view });
      } catch (err) {
        logger.error('Failed to open quick ticket modal:', err.message);
      }
    });

    logger.info('Nova Comms Slack service initialized successfully');
    isInitialized = true;
    return slackApp;
  } catch (error) {
    logger.error('Failed to initialize Slack app:', error.message);
    throw error;
  }
}

/**
 * Start the Slack app (if not already started)
 */
export async function startSlackApp(port) {
  if (!slackApp) {
    initializeSlackApp();
  }

  if (slackApp) {
    try {
      const config = validateSlackEnv();
      const slackPort = port || config.port;
      await slackApp.start(slackPort);
      logger.info(`Nova Universe Slack service running on port ${slackPort}`);
      return slackApp;
    } catch (error) {
      logger.error('Failed to start Slack app:', error.message);
      throw error;
    }
  }
}

/**
 * Get the Slack app instance
 */
export function getSlackApp() {
  return slackApp;
}

/**
 * Check if Slack is initialized and available
 */
export function isSlackAvailable() {
  return isInitialized && slackApp !== null;
}

export { issueServiceJWT, buildModal, validateSlackEnv };
