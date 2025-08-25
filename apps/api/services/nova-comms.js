/**
 * Nova Universe Slack Integration Service
 *
 * This service provides Slack bot functionality for Nova Universe, allowing users to:
 * - Submit tickets via /new-ticket command
 * - Interact with modals for ticket creation
 * - Receive confirmations and status updates
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
function buildModal(systems = [], urgencies = [], channel) {
  const systemOptions = systems.map((s) => ({
    text: { type: 'plain_text', text: s },
    value: s,
  }));
  const urgencyOptions = urgencies.length ? urgencies : ['Urgent', 'High', 'Medium', 'Low'];

  return {
    type: 'modal',
    callback_id: 'ticket_submit',
    private_metadata: channel || '',
    title: { type: 'plain_text', text: 'New Ticket' },
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
        element: { type: 'plain_text_input', action_id: 'value' },
      },
      {
        type: 'input',
        block_id: 'title',
        label: { type: 'plain_text', text: 'Title' },
        element: { type: 'plain_text_input', action_id: 'value' },
      },
      {
        type: 'input',
        block_id: 'system',
        label: { type: 'plain_text', text: 'System' },
        element:
          systemOptions.length > 0
            ? {
                type: 'static_select',
                action_id: 'value',
                options: systemOptions,
              }
            : { type: 'plain_text_input', action_id: 'value' },
      },
      {
        type: 'input',
        block_id: 'urgency',
        label: { type: 'plain_text', text: 'Urgency' },
        element: {
          type: 'static_select',
          action_id: 'value',
          options: urgencyOptions.map((u) => ({
            text: { type: 'plain_text', text: u },
            value: u,
          })),
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
        // Map to Orbit ticket create contract
        const token = issueServiceJWT({ type: 'slack' });
        const createBody = {
          title: payload.title,
          description: payload.description || payload.title,
          category: payload.system || 'general',
          priority: String(payload.urgency || 'Medium').toLowerCase(),
          contactMethod: 'email',
          contactInfo: payload.email,
        };
        const res = await axios.post(`${config.apiUrl}/api/v1/orbit/tickets`, createBody, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ticket = res.data?.ticket;
        const ticketId = ticket?.ticketId || ticket?.id || 'INC-NEW';
        const aUrl = config.adminUrl;
        const blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:white_check_mark: Ticket *${ticketId}* submitted.`,
            },
          },
        ];
        if (aUrl) {
          blocks.push({
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `<${aUrl}|Open Nova Universe Portal>`,
              },
            ],
          });
        }
        await client.chat.postEphemeral({
          channel: view.private_metadata || body.user.id,
          user: body.user.id,
          text: `Ticket ${ticketId} submitted`,
          blocks,
        });
      } catch (err) {
        logger.error('Failed to submit ticket:', err.message);
        await client.chat.postEphemeral({
          channel: view.private_metadata || body.user.id,
          user: body.user.id,
          text: 'Failed to submit ticket.',
        });
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
          text: `Status: ${current} | Monitors up: ${up}/${total}`,
        });
      } catch (e) {
        logger.error('Failed to fetch status for /nova-status:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Unable to fetch status.',
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
        const top = metrics
          .slice(0, 5)
          .map(
            (q) => `• ${q.queue_name || q.queueName}: ${q.open_tickets || q.openTickets || 0} open`,
          )
          .join('\n');
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: top || 'No queue metrics found.',
        });
      } catch (e) {
        logger.error('Failed to fetch queue metrics for /nova-queue:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Unable to fetch queues.',
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
        const message = command.text?.slice(0, 1000) || 'No message';
        const type = 'feedback';
        await axios.post(
          `${config.apiUrl}/api/v1/orbit/feedback`,
          { subject, message, type },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Thanks for the feedback!',
        });
      } catch (e) {
        logger.error('Failed to submit feedback for /nova-feedback:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Failed to submit feedback.',
        });
      }
    });

    // /nova-assign <TICKET_ID> @user → leverage Synth v2 optimize or direct assign (placeholder)
    slackApp.command('/nova-assign', async ({ ack, body, client, command }) => {
      await ack();
      const text = (command.text || '').trim();
      if (!text) {
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Usage: /nova-assign INC000001',
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
        const rec = optimize?.recommendation?.recommendedTechnician?.name || 'a technician';
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: `Recommended assignee for ${text}: ${rec}`,
        });
      } catch (e) {
        logger.error('Failed to compute assignment for /nova-assign:', e.message);
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: 'Failed to compute assignment.',
        });
      }
    });

    // Cosmo thread: mention @Cosmo to start conversation and reply
    slackApp.event('app_mention', async ({ event, client }) => {
      try {
        const token = issueServiceJWT({
          name: event.user,
          id: event.user,
          email: `${event.user}@slack.local`,
        });
        // Start conversation in Synth v2 with module context
        const start = await axios.post(
          `${config.apiUrl}/api/v2/synth/conversation/start`,
          {
            context: { module: 'comms', userRole: 'user' },
            initialMessage: event.text.replace(/<@[^>]+>/g, '').trim() || 'Help',
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const message = start.data?.message || 'How can I help?';
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: message,
        });
      } catch (e) {
        logger.error('Failed to handle app mention:', e.message);
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.ts,
          text: 'Cosmo is unavailable right now.',
        });
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
