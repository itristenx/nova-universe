/**
 * CueIT Slack Integration Service
 * 
 * This service provides Slack bot functionality for CueIT, allowing users to:
 * - Submit tickets via /new-ticket command
 * - Interact with modals for ticket creation
 * - Receive confirmations and status updates
 * 
 * Environment Variables Required:
 * - SLACK_SIGNING_SECRET: Slack app signing secret
 * - SLACK_BOT_TOKEN: Bot User OAuth token  
 * - API_URL: CueIT API base URL
 * - JWT_SECRET: Secret for JWT token generation
 * - JWT_EXPIRES_IN: JWT expiration time (default: 1h)
 * - VITE_ADMIN_URL: Admin panel URL for ticket links
 */

import dotenv from 'dotenv';
import { App } from '@slack/bolt';
import axios from 'axios';
import jwt from 'jsonwebtoken';

dotenv.config();

const PORT = process.env.SLACK_PORT || 3001;

const isTest = process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';

// Validate required environment variables
const requiredEnvVars = [
  'SLACK_SIGNING_SECRET',
  // If OAuth is not configured, we need a bot token. If OAuth is configured, token is managed per installation.
  ...(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET ? [] : ['SLACK_BOT_TOKEN']),
  'API_URL',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (isTest) {
      // Provide safe defaults during tests
      process.env[envVar] = envVar === 'API_URL' ? 'http://localhost' : 'test';
      continue;
    }
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const useOAuth = Boolean(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET);

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  ...(useOAuth
    ? {
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        stateSecret: process.env.SLACK_STATE_SECRET || process.env.JWT_SECRET,
        scopes: (
          process.env.SLACK_SCOPES ||
          'commands,chat:write,chat:write.public,reactions:write,users:read,channels:read,app_mentions:read'
        ).split(',')
      }
    : { token: process.env.SLACK_BOT_TOKEN })
});

function buildModal(systems = [], urgencies = [], channel) {
  const systemOptions = systems.map((systemName) => ({
    text: { type: 'plain_text', text: systemName },
    value: systemName,
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
      { type: 'input', block_id: 'name', label: { type: 'plain_text', text: 'Name' }, element: { type: 'plain_text_input', action_id: 'value' } },
      { type: 'input', block_id: 'email', label: { type: 'plain_text', text: 'Email' }, element: { type: 'plain_text_input', action_id: 'value' } },
      { type: 'input', block_id: 'title', label: { type: 'plain_text', text: 'Title' }, element: { type: 'plain_text_input', action_id: 'value' } },
      {
        type: 'input', block_id: 'system', label: { type: 'plain_text', text: 'System' },
        element: systemOptions.length > 0
          ? { type: 'static_select', action_id: 'value', options: systemOptions }
          : { type: 'plain_text_input', action_id: 'value' },
      },
      {
        type: 'input', block_id: 'urgency', label: { type: 'plain_text', text: 'Urgency' },
        element: { type: 'static_select', action_id: 'value', options: urgencyOptions.map((urgency) => ({ text: { type: 'plain_text', text: urgency }, value: urgency })) },
      },
      {
        type: 'input', block_id: 'description', label: { type: 'plain_text', text: 'Description' },
        element: { type: 'plain_text_input', multiline: true, action_id: 'value' }, optional: true,
      },
    ],
  };
}

async function getAuthToken() {
  return jwt.sign({ type: 'slack' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
}

async function fetchConfigWithFallback() {
  const token = await getAuthToken();
  try {
    const response = await axios.get(`${process.env.API_URL}/api/config`, { headers: { Authorization: `Bearer ${token}` } });
    return response.data || {};
  } catch (error) {
    console.error('Failed to fetch config from /api/config:', error.message);
    return {};
  }
}

function buildQueueBlocks(summary) {
  if (!summary || !Array.isArray(summary.queues)) {
    return [{ type: 'section', text: { type: 'mrkdwn', text: 'No queue data available.' } }];
  }
  const header = { type: 'section', text: { type: 'mrkdwn', text: '*Pulse Queue Summary*' } };
  const divider = { type: 'divider' };
  const rows = summary.queues.slice(0, 10).map((queue) => ({
    type: 'section', text: { type: 'mrkdwn', text: `• *${queue.name}*: ${queue.openCount || 0} open, ${queue.waitingCount || 0} waiting, ${queue.slaBreaches || 0} SLA breaches` },
  }));
  return [header, divider, ...rows];
}

// ---------- Helix / Nova Auth integration ----------
async function resolveNovaUserFromSlack({ slackUserId, teamId }) {
  const token = await getAuthToken();
  try {
    const res = await axios.post(
      `${process.env.API_URL}/auth/slack/resolve`,
      { slackUserId, teamId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data || null;
  } catch (error) {
    // fallback path
    try {
      const res2 = await axios.post(
        `${process.env.API_URL}/api/auth/slack/resolve`,
        { slackUserId, teamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res2.data || null;
    } catch (error2) {
      return null;
    }
  }
}

function hasRequiredRole(novaUser, requiredRoles) {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const roles = novaUser?.roles || [];
  return requiredRoles.some((r) => roles.includes(r));
}

async function ensureAuthorizedOrReply({ client, channelId, userId, slackUserId, teamId, requiredRoles }) {
  const novaUser = await resolveNovaUserFromSlack({ slackUserId, teamId });
  if (!novaUser || !hasRequiredRole(novaUser, requiredRoles)) {
    await client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      text: 'You are not authorized to perform this action. Please contact an administrator or link your Slack account in Nova.'
    });
    return false;
  }
  return true;
}

// ---------------------------------------------------

// Slash command: /new-ticket (existing)
app.command('/new-ticket', async ({ ack, body, client }) => {
  await ack();
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.API_URL}/api/config`, { headers: { Authorization: `Bearer ${token}` } });
    const systems = Array.isArray(response.data.systems)
      ? response.data.systems
      : String(response.data.systems || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    const urgencies = Array.isArray(response.data.urgencyLevels)
      ? response.data.urgencyLevels
      : String(response.data.urgencyLevels || '')
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);

    const view = buildModal(systems, urgencies, body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  } catch (error) {
    console.error('Failed to fetch config:', error.message);
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  }
});

// Alias: /it-help → open same modal
app.command('/it-help', async ({ ack, body, client }) => {
  await ack();
  try {
    const config = await fetchConfigWithFallback();
    const systems = Array.isArray(config.systems)
      ? config.systems
      : String(config.systems || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    const urgencies = Array.isArray(config.urgencyLevels)
      ? config.urgencyLevels
      : String(config.urgencyLevels || '')
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);
    const view = buildModal(systems, urgencies, body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  } catch (error) {
    console.error('Failed to open /it-help modal:', error.message);
  }
});

// View submission: ticket_submit (existing)
app.view('ticket_submit', async ({ ack, body, view, client }) => {
  await ack();

  const state = view.state.values;
  const payload = {
    name: state.name?.value?.value || '',
    email: state.email?.value?.value || '',
    title: state.title?.value?.value || '',
    system: state.system?.value?.selected_option?.value || state.system?.value?.value || '',
    urgency: state.urgency?.value?.selected_option?.value || '',
    description: state.description?.value?.value || '',
  };

  try {
    const token = await getAuthToken();
    const response = await axios.post(`${process.env.API_URL}/submit-ticket`, payload, { headers: { Authorization: `Bearer ${token}` } });
    const { ticketId, emailStatus } = response.data || {};
    const adminUrl = process.env.VITE_ADMIN_URL;
    const blocks = [
      { type: 'section', text: { type: 'mrkdwn', text: `:white_check_mark: Ticket *${ticketId}* submitted (email ${emailStatus}).` } },
    ];
    if (adminUrl) {
      blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `<${adminUrl}|Open Nova Portal>` }] });
    }
    await client.chat.postEphemeral({ channel: view.private_metadata || body.user.id, user: body.user.id, text: `Ticket ${ticketId || ''} submitted`, blocks });
  } catch (error) {
    console.error('Failed to submit ticket:', error.message);
    await client.chat.postEphemeral({ channel: view.private_metadata || body.user.id, user: body.user.id, text: 'Failed to submit ticket.' });
  }
});

// Slash command: /nova-status → system status (agent/admin)
app.command('/nova-status', async ({ ack, body, client }) => {
  await ack();
  const authorized = await ensureAuthorizedOrReply({
    client,
    channelId: body.channel_id,
    userId: body.user_id,
    slackUserId: body.user_id,
    teamId: body.team_id,
    requiredRoles: ['agent', 'admin'],
  });
  if (!authorized) return;
  try {
    const token = await getAuthToken();
    let data;
    try {
      const res1 = await axios.get(`${process.env.API_URL}/status`, { headers: { Authorization: `Bearer ${token}` } });
      data = res1.data;
    } catch {
      const res2 = await axios.get(`${process.env.API_URL}/api/status`, { headers: { Authorization: `Bearer ${token}` } });
      data = res2.data;
    }
    const text = `System Status: ${data?.status || 'unknown'} | Uptime: ${data?.uptime || 'n/a'}`;
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text });
  } catch (error) {
    console.error('/nova-status failed:', error.message);
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Unable to fetch status.' });
  }
});

// Slash command: /nova-queue → queue summary (Pulse) (agent/admin)
app.command('/nova-queue', async ({ ack, body, client }) => {
  await ack();
  const authorized = await ensureAuthorizedOrReply({
    client,
    channelId: body.channel_id,
    userId: body.user_id,
    slackUserId: body.user_id,
    teamId: body.team_id,
    requiredRoles: ['agent', 'admin'],
  });
  if (!authorized) return;
  try {
    const token = await getAuthToken();
    let summary;
    try {
      const res1 = await axios.get(`${process.env.API_URL}/pulse/queues/summary`, { headers: { Authorization: `Bearer ${token}` } });
      summary = res1.data;
    } catch {
      const res2 = await axios.get(`${process.env.API_URL}/api/queues/summary`, { headers: { Authorization: `Bearer ${token}` } });
      summary = res2.data;
    }
    const blocks = buildQueueBlocks(summary);
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Queue summary', blocks });
  } catch (error) {
    console.error('/nova-queue failed:', error.message);
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Unable to fetch queues.' });
  }
});

// Slash command: /nova-feedback → modal (open)
app.command('/nova-feedback', async ({ ack, body, client }) => {
  await ack();
  const view = {
    type: 'modal', callback_id: 'feedback_submit', private_metadata: body.channel_id,
    title: { type: 'plain_text', text: 'Submit Feedback' }, submit: { type: 'plain_text', text: 'Send' }, close: { type: 'plain_text', text: 'Cancel' },
    blocks: [
      { type: 'input', block_id: 'feedback', label: { type: 'plain_text', text: 'Your feedback' }, element: { type: 'plain_text_input', action_id: 'value', multiline: true } },
      { type: 'input', optional: true, block_id: 'contact', label: { type: 'plain_text', text: 'Contact (optional)' }, element: { type: 'plain_text_input', action_id: 'value' } },
    ],
  };
  await client.views.open({ trigger_id: body.trigger_id, view });
});

app.view('feedback_submit', async ({ ack, view, body, client }) => {
  await ack();
  try {
    const token = await getAuthToken();
    const message = view.state.values.feedback?.value?.value || '';
    const contact = view.state.values.contact?.value?.value || '';
    await axios.post(`${process.env.API_URL}/feedback`, { message, contact }, { headers: { Authorization: `Bearer ${token}` } });
    await client.chat.postEphemeral({ channel: view.private_metadata || body.user.id, user: body.user.id, text: 'Thanks for your feedback!' });
  } catch (error) {
    console.error('Feedback submit failed:', error.message);
    await client.chat.postEphemeral({ channel: view.private_metadata || body.user.id, user: body.user.id, text: 'Could not submit feedback.' });
  }
});

// Slash command: /nova-assign → assign thread to agent (agent/admin)
app.command('/nova-assign', async ({ ack, body, client }) => {
  await ack();
  const authorized = await ensureAuthorizedOrReply({
    client,
    channelId: body.channel_id,
    userId: body.user_id,
    slackUserId: body.user_id,
    teamId: body.team_id,
    requiredRoles: ['agent', 'admin'],
  });
  if (!authorized) return;
  try {
    const token = await getAuthToken();
    const agentsRes = await axios.get(`${process.env.API_URL}/pulse/agents`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { agents: [] } }));
    const agents = agentsRes?.data?.agents || [];
    const options = agents.slice(0, 100).map((a) => ({ text: { type: 'plain_text', text: a.displayName || a.email || a.id }, value: a.id }));
    const view = {
      type: 'modal', callback_id: 'assign_submit', private_metadata: JSON.stringify({ channel_id: body.channel_id }),
      title: { type: 'plain_text', text: 'Assign Thread' }, submit: { type: 'plain_text', text: 'Assign' }, close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        { type: 'input', block_id: 'agent', label: { type: 'plain_text', text: 'Agent' }, element: options.length ? { type: 'static_select', action_id: 'value', options } : { type: 'plain_text_input', action_id: 'value' } },
        { type: 'input', block_id: 'notes', optional: true, label: { type: 'plain_text', text: 'Notes' }, element: { type: 'plain_text_input', action_id: 'value', multiline: true } },
      ],
    };
    await client.views.open({ trigger_id: body.trigger_id, view });
  } catch (error) {
    console.error('/nova-assign modal failed:', error.message);
  }
});

app.view('assign_submit', async ({ ack, view, body, client }) => {
  await ack();
  try {
    const metadata = JSON.parse(view.private_metadata || '{}');
    const agentId = view.state.values.agent?.value?.selected_option?.value || view.state.values.agent?.value?.value;
    const notes = view.state.values.notes?.value?.value || '';
    const token = await getAuthToken();
    await axios.post(`${process.env.API_URL}/pulse/assign`, { channelId: metadata.channel_id, agentId, notes }, { headers: { Authorization: `Bearer ${token}` } });
    await client.chat.postEphemeral({ channel: metadata.channel_id || body.user.id, user: body.user.id, text: `Assigned to ${agentId}.` });
  } catch (error) {
    console.error('Assign submit failed:', error.message);
    await client.chat.postEphemeral({ channel: body.user.id, user: body.user.id, text: 'Assignment failed.' });
  }
});

// Event: app_mention → AI suggestions via Cosmo (optional)
app.event('app_mention', async ({ event, client }) => {
  try {
    if (String(process.env.COMMS_AI_ENABLED || 'true') !== 'true') return;
    const token = await getAuthToken();
    const aiRes = await axios
      .post(
        `${process.env.API_URL}/ai/cosmo/suggest`,
        { text: event.text, channel: event.channel, thread_ts: event.thread_ts },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .catch(() => ({ data: { suggestions: [] } }));

    const suggestions = aiRes?.data?.suggestions || [];
    const text = suggestions[0]?.text || 'I am here to help. Try `/it-help` to create a ticket or `/nova-queue` to view queues.';
    await client.chat.postMessage({ channel: event.channel, thread_ts: event.thread_ts || event.ts, text });
  } catch (error) {
    console.error('AI suggestion failed:', error.message);
  }
});

// Keyword triggers for triage & routing
app.message(/(urgent|escalate|sev[1-3])/i, async ({ message, client, context }) => {
  try {
    const token = await getAuthToken();
    await axios.post(`${process.env.API_URL}/comms/triage`, { channel: message.channel, ts: message.ts, text: message.text, matched: context.matches }, { headers: { Authorization: `Bearer ${token}` } });
    await client.reactions.add({ channel: message.channel, timestamp: message.ts, name: 'rotating_light' });
  } catch (error) {
    console.error('Triage hook failed:', error.message);
  }
});

// Interactive approval buttons (agent/admin)
app.action('approve_request', async ({ ack, body, client }) => {
  await ack();
  const authorized = await ensureAuthorizedOrReply({
    client,
    channelId: body.channel?.id,
    userId: body.user?.id,
    slackUserId: body.user?.id,
    teamId: body.team?.id,
    requiredRoles: ['agent', 'admin'],
  });
  if (!authorized) return;
  try {
    const token = await getAuthToken();
    const requestId = body?.actions?.[0]?.value;
    await axios.post(`${process.env.API_URL}/workflows/approve`, { requestId }, { headers: { Authorization: `Bearer ${token}` } });
    await client.chat.postEphemeral({ channel: body.channel?.id, user: body.user?.id, text: `Request ${requestId} approved.` });
  } catch (error) {
    console.error('Approve action failed:', error.message);
  }
});

// Optional: summarize recent thread/messages (agent/admin)
app.command('/nova-summarize', async ({ ack, body, client }) => {
  await ack();
  const authorized = await ensureAuthorizedOrReply({
    client,
    channelId: body.channel_id,
    userId: body.user_id,
    slackUserId: body.user_id,
    teamId: body.team_id,
    requiredRoles: ['agent', 'admin'],
  });
  if (!authorized) return;
  try {
    const token = await getAuthToken();
    const res = await axios.post(`${process.env.API_URL}/ai/cosmo/summarize`, { channel: body.channel_id }, { headers: { Authorization: `Bearer ${token}` } });
    const summary = res?.data?.summary || 'No summary available.';
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: summary });
  } catch (error) {
    console.error('/nova-summarize failed:', error.message);
    await client.chat.postEphemeral({ channel: body.channel_id, user: body.user_id, text: 'Could not summarize.' });
  }
});

(async () => {
  await app.start(PORT);
  console.log(`✅ Nova Comms Slack service running on port ${PORT}`);
})();
