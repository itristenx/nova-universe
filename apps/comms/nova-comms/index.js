/**
 * Nova Universe Slack Integration Service
 * 
 * This service provides Slack bot _functionality for Nova Universe, _allowing _users to:
 * - Submit tickets _via /new-ticket command
 * - _Interact with _modals for ticket _creation
 * - _Receive _confirmations and status _updates
 * 
 * _Environment _Variables _Required:
 * - SLACK_SIGNING_SECRET: Slack app _signing _secret
 * - SLACK_BOT_TOKEN: _Bot _User _OAuth token  
 * - API_URL: Nova Universe _API _base URL
 * - JWT_SECRET: _Secret for JWT token _generation
 * - _JWT_EXPIRES_IN: JWT _expiration _time (_default: 1h)
 * - VITE_ADMIN_URL: Admin panel URL for ticket links
 */

import { App } from '@slack/bolt';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { validateEnv } from './environment.js';
// Removed redundant dotenv import and config call
const {
  port: PORT,
  jwtExpiresIn,
  adminUrl,
  serviceUserId,
  serviceUserEmail,
  serviceUserName,
  serviceUserRole,
  tenantId
} = validateEnv();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
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
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: jwtExpiresIn, issuer: 'nova-universe-api', audience: 'nova-universe' });
}

function buildModal(systems = [], urgencies = [], channel) {
  const systemOptions = systems.map((s) => ({
    text: { type: 'plain_text', text: s },
    value: s,
  }));
  const urgencyOptions = urgencies.length
    ? urgencies
    : ['Urgent', 'High', 'Medium', 'Low'];

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

// Back-compat command
app.command('/new-ticket', async ({ ack, body, client }) => {
  await ack(); // TODO-LINT: move to async function
  try {
    const token = issueServiceJWT({ type: 'slack' });
    const res = await axios.get(`${process.env.API_URL}/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    }); // TODO-LINT: move to async function
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
    await client.views.open({ trigger_id: body.trigger_id, view }); // TODO-LINT: move to async function
  } catch (err) {
    console.error('Failed to fetch config:', err.message);
    console.error('Full error:', err);
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view }); // TODO-LINT: move to async function
  }
});

// End-user friendly alias
app.command('/it-help', async ({ ack, body, client }) => {
  await ack(); // TODO-LINT: move to async function
  try {
    const token = issueServiceJWT({ type: 'slack' });
    const res = await axios.get(`${process.env.API_URL}/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    }); // TODO-LINT: move to async function
    const systems = Array.isArray(res.data.systems)
      ? res.data.systems
      : [];
    const urgencies = Array.isArray(res.data.urgencyLevels)
      ? res.data.urgencyLevels
      : ['Low', 'Medium', 'High', 'Critical'];
    const view = buildModal(systems, urgencies, body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view }); // TODO-LINT: move to async function
  } catch (err) {
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view }); // TODO-LINT: move to async function
  }
});

app.view('ticket_submit', async ({ ack, body, view, client }) => {
  await ack(); // TODO-LINT: move to async function

  const state = view.state.values;
  const payload = {
    name: state.name.value.value,
    email: state.email.value.value,
    title: state.title.value.value,
    system:
      state.system.value.selected_option?.value || state.system.value.value,
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
      contactInfo: payload.email
    };
    const res = await axios.post(
      `${process.env.API_URL}/api/v1/orbit/tickets`,
      createBody,
      { headers: { Authorization: `Bearer ${token}` } }
    ); // TODO-LINT: move to async function
    const ticket = res.data?.ticket;
    const ticketId = ticket?.ticketId || ticket?.id || 'TKT-NEW';
    const aUrl = adminUrl;
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
    }); // TODO-LINT: move to async function
  } catch (err) {
    console.error('Failed to submit ticket:', err.message);
    await client.chat.postEphemeral({
      channel: view.private_metadata || body.user.id,
      user: body.user.id,
      text: 'Failed to submit ticket.',
    }); // TODO-LINT: move to async function
  }
});

// /nova-status → summarize enhanced monitoring and status config
app.command('/nova-status', async ({ ack, body, client }) => {
  await ack(); // TODO-LINT: move to async function
  try {
    const token = issueServiceJWT();
    const [statusConfig, monitors] = await Promise.all([
      axios.get(`${process.env.API_URL}/api/status-config`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data).catch(() => ({})),
      axios.get(`${process.env.API_URL}/api/enhanced-monitoring/monitors`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data).catch(() => ({ monitors: [] })),
    ]); // TODO-LINT: move to async function
    const current = statusConfig.currentStatus || 'unknown';
    const total = (monitors.monitors || []).length;
    const up = (monitors.monitors || []).filter(m => m.current_status !== false).length;
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: `Status: ${current} | Monitors up: ${up}/${total}`,
    }); // TODO-LINT: move to async function
  } catch (e) {
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Unable to fetch status.' }); // TODO-LINT: move to async function
  }
});

// /nova-queue → Pulse queue metrics summary
app.command('/nova-queue', async ({ ack, body, client }) => {
  await ack(); // TODO-LINT: move to async function
  try {
    const token = issueServiceJWT();
    const res = await axios.get(`${process.env.API_URL}/api/v1/pulse/queues/metrics`, { headers: { Authorization: `Bearer ${token}` } }); // TODO-LINT: move to async function
    const metrics = res.data?.metrics || [];
    const top = metrics.slice(0, 5).map((q) => `• ${q.queue_name || q.queueName}: ${q.open_tickets || q.openTickets || 0} open`).join('\n');
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: top || 'No queue metrics found.' }); // TODO-LINT: move to async function
  } catch (e) {
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Unable to fetch queues.' }); // TODO-LINT: move to async function
  }
});

// /nova-feedback → submit platform feedback
app.command('/nova-feedback', async ({ ack, body, client, command }) => {
  await ack(); // TODO-LINT: move to async function
  try {
    const token = issueServiceJWT({ name: body.user_name, id: body.user_id, email: `${body.user_id}@slack.local` });
    const subject = 'Slack Feedback';
    const message = command.text?.slice(0, 1000) || 'No message';
    const type = 'feedback';
    await axios.post(`${process.env.API_URL}/api/v1/orbit/feedback`, { subject, message, type }, { headers: { Authorization: `Bearer ${token}` } }); // TODO-LINT: move to async function
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Thanks for the feedback!' }); // TODO-LINT: move to async function
  } catch (e) {
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Failed to submit feedback.' }); // TODO-LINT: move to async function
  }
});

// /nova-assign TKT-XXXXX @user → leverage Synth v2 optimize or direct assign (placeholder)
app.command('/nova-assign', async ({ ack, body, client, command }) => {
  await ack(); // TODO-LINT: move to async function
  const text = (command.text || '').trim();
  if (!text) {
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Usage: /nova-assign TKT-00001' }); // TODO-LINT: move to async function
    return;
  }
  try {
    const token = issueServiceJWT();
    const optimize = await axios.post(`${process.env.API_URL}/api/v1/synth/optimize/assignment`, { ticketId: text }, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data).catch(() => null); // TODO-LINT: move to async function
    const rec = optimize?.recommendation?.recommendedTechnician?.name || 'a technician';
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: `Recommended assignee for ${text}: ${rec}` }); // TODO-LINT: move to async function
  } catch (e) {
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Failed to compute assignment.' }); // TODO-LINT: move to async function
  }
});

// Cosmo thread: mention @Cosmo to start conversation and reply
app.event('app_mention', async ({ event, client, context }) => {
  try {
    const token = issueServiceJWT({ name: event.user, id: event.user, email: `${event.user}@slack.local` });
    // Start conversation in Synth v2 with module context
    const start = await axios.post(`${process.env.API_URL}/api/v2/synth/conversation/start`, {
      context: { module: 'comms', userRole: 'user' },
      initialMessage: event.text.replace(/<@[^>]+>/g, '').trim() || 'Help'
    }, { headers: { Authorization: `Bearer ${token}` } }); // TODO-LINT: move to async function
    const message = start.data?.message || 'How can I help?';
    await client.chat.postMessage({ channel: event.channel, thread_ts: event.ts, text: message }); // TODO-LINT: move to async function
  } catch (e) {
    await client.chat.postMessage({ channel: event.channel, thread_ts: event.ts, text: 'Cosmo is unavailable right now.' }); // TODO-LINT: move to async function
  }
});

(async () => {
  await app.start(PORT); // TODO-LINT: move to async function
  console.log(`✅ Nova Universe Slack service running on port ${PORT}`);
})();
