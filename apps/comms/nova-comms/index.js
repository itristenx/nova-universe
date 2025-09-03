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
 * - API_URL: Nova Universe API base URL
 * - JWT_SECRET: Secret for JWT token generation
 * - JWT_EXPIRES_IN: JWT expiration time (default: 1h)
 * - VITE_ADMIN_URL: Admin panel URL for ticket links
 */

import { App } from '@slack/bolt';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { validateEnv } from './environment.js';

const {
  port: PORT,
  slackSigningSecret,
  slackBotToken,
  apiUrl,
  jwtSecret,
  jwtExpiresIn,
  adminUrl,
  serviceUserId,
  serviceUserEmail,
  serviceUserName,
  serviceUserRole,
  tenantId
} = validateEnv();

const app = new App({
  signingSecret: slackSigningSecret,
  token: slackBotToken,
});

function issueServiceJWT(extraPayload = {}) {
  const payload = {
    id: serviceUserId,
    email: serviceUserEmail,
    name: serviceUserName,
    role: serviceUserRole,
    tenantId,
    source: 'comms',
    ...extraPayload,
  };
  return jwt.sign(payload, jwtSecret, { 
    expiresIn: jwtExpiresIn, 
    issuer: 'nova-universe-api', 
    audience: 'nova-universe' 
  });
}

function buildModal(systems = [], urgencies = [], channel) {
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
          placeholder: { type: 'plain_text', text: 'Detailed description of the issue...' }
        },
        optional: true,
      },
    ],
  };
}

// Main ticket creation commands
app.command('/new-ticket', async ({ ack, body, client }) => {
  await ack();
  try {
    const token = issueServiceJWT({ type: 'slack' });
    const res = await axios.get(`${apiUrl}/api/config`, {
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
    console.error('Failed to fetch config:', err.message);
    // Fall back to basic modal with default options
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  }
});

// User-friendly alias
app.command('/it-help', async ({ ack, body, client }) => {
  await ack();
  try {
    const token = issueServiceJWT({ type: 'slack' });
    const res = await axios.get(`${apiUrl}/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const systems = Array.isArray(res.data.systems) ? res.data.systems : [];
    const urgencies = Array.isArray(res.data.urgencyLevels)
      ? res.data.urgencyLevels
      : ['Low', 'Medium', 'High', 'Critical'];
    
    const view = buildModal(systems, urgencies, body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  } catch (err) {
    console.warn('Failed to fetch config for /it-help command:', err.message);
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  }
});

// Handle modal submission
app.view('ticket_submit', async ({ ack, body, view, client }) => {
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
      sourceChannel: view.private_metadata,
      sourceUser: body.user.id
    };

    console.log('Creating ticket with payload:', createBody);
    
    const res = await axios.post(`${apiUrl}/api/v1/orbit/tickets`, createBody, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const ticket = res.data?.ticket;
    const ticketId = ticket?.ticketId || ticket?.id || 'NEW-TICKET';
    
    // Success response
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

    if (adminUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Ticket',
            },
            url: `${adminUrl}/tickets/${ticketId}`,
            action_id: 'view_ticket',
          },
        ],
      });
    }

    await client.chat.postEphemeral({
      channel: view.private_metadata || body.user.id,
      user: body.user.id,
      text: `Ticket ${ticketId} created successfully!`,
      blocks,
    });

  } catch (err) {
    console.error('Failed to submit ticket:', err.message);
    console.error('Error details:', err.response?.data);
    
    await client.chat.postEphemeral({
      channel: view.private_metadata || body.user.id,
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
  }
});

// Status and monitoring commands
app.command('/nova-status', async ({ ack, body, client }) => {
  await ack();
  try {
    const token = issueServiceJWT();
    const [statusConfig, monitors] = await Promise.all([
      axios
        .get(`${apiUrl}/api/status-config`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => r.data)
        .catch(() => ({})),
      axios
        .get(`${apiUrl}/api/enhanced-monitoring/monitors`, {
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
    console.error('Failed to fetch status for /nova-status:', e.message);
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: ':warning: Unable to fetch system status at this time.',
    });
  }
});

// Queue metrics summary
app.command('/nova-queue', async ({ ack, body, client }) => {
  await ack();
  try {
    const token = issueServiceJWT();
    const res = await axios.get(`${apiUrl}/api/v1/pulse/queues/metrics`, {
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
    console.error('Failed to fetch queue metrics for /nova-queue:', e.message);
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: ':warning: Unable to fetch queue metrics at this time.',
    });
  }
});

// Feedback submission
app.command('/nova-feedback', async ({ ack, body, client, command }) => {
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
      `${apiUrl}/api/v1/orbit/feedback`,
      { subject, message, type },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: ':white_check_mark: Thank you for your feedback! It has been submitted to the Nova team.',
    });
  } catch (e) {
    console.error('Failed to submit feedback for /nova-feedback:', e.message);
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: ':x: Failed to submit feedback. Please try again later.',
    });
  }
});

// Assignment optimization
app.command('/nova-assign', async ({ ack, body, client, command }) => {
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
        `${apiUrl}/api/v1/synth/optimize/assignment`,
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
    console.error('Failed to compute assignment for /nova-assign:', e.message);
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: ':warning: Failed to compute assignment recommendation.',
    });
  }
});

// Cosmo AI conversation
app.event('app_mention', async ({ event, client }) => {
  try {
    const token = issueServiceJWT({
      name: event.user,
      id: event.user,
      email: `${event.user}@slack.local`,
    });
    
    // Start conversation in Nova AI with context
    const start = await axios.post(
      `${apiUrl}/api/v2/synth/conversation/start`,
      {
        context: { module: 'comms', userRole: 'user' },
        initialMessage: event.text.replace(/<@[^>]+>/g, '').trim() || 'Help',
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    
    const message = start.data?.message || 'Hello! How can I help you today?';
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: `🤖 ${message}`,
    });
  } catch (e) {
    console.error('Failed to handle app mention:', e.message);
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: '🤖 Hi! I\'m currently unavailable, but I\'ll be back soon. For immediate help, try `/it-help` to create a support ticket.',
    });
  }
});

// Error handling
app.error((error) => {
  console.error('Nova Comms error:', error);
});

// Start the service
(async () => {
  try {
    await app.start(PORT);
    console.log(`✅ Nova Universe Slack service running on port ${PORT}`);
  } catch (error) {
    console.error('❌ Failed to start Nova Comms service:', error);
    process.exit(1);
  }
})();