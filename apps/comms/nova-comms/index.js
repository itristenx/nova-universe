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

import { App } from '@slack/bolt';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { validateEnv } from './environment.js';
import dotenv from 'dotenv';

dotenv.config();

const { port: PORT, jwtExpiresIn } = validateEnv();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

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

app.command('/new-ticket', async ({ ack, body, client }) => {
  await ack();
  try {
    const token = jwt.sign(
      { type: 'slack' },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpiresIn }
    );
    const res = await axios.get(`${process.env.API_URL}/api/config`, {
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
    console.error('Full error:', err);
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  }
});

app.view('ticket_submit', async ({ ack, body, view, client }) => {
  await ack();

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
    const token = jwt.sign(
      { type: 'slack' },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpiresIn }
    );
    const res = await axios.post(
      `${process.env.API_URL}/submit-ticket`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { ticketId, emailStatus } = res.data;
    const adminUrl = process.env.VITE_ADMIN_URL;
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:white_check_mark: Ticket *${ticketId}* submitted (email ${emailStatus}).`,
        },
      },
    ];
    if (adminUrl) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `<${adminUrl}|Open CueIT Portal>`,
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
    console.error('Failed to submit ticket:', err.message);
    await client.chat.postEphemeral({
      channel: view.private_metadata || body.user.id,
      user: body.user.id,
      text: 'Failed to submit ticket.',
    });
  }
});

(async () => {
  await app.start(PORT);
  console.log(`✅ CueIT Slack service running on port ${PORT}`);
})();
