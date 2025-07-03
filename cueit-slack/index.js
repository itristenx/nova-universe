require('dotenv').config();
const { App } = require('@slack/bolt');
const axios = require('axios');

const PORT = process.env.SLACK_PORT || 3001;

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const modalView = {
  type: 'modal',
  callback_id: 'ticket_submit',
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
      element: { type: 'plain_text_input', action_id: 'value' },
    },
    {
      type: 'input',
      block_id: 'urgency',
      label: { type: 'plain_text', text: 'Urgency' },
      element: {
        type: 'static_select',
        action_id: 'value',
        options: [
          { text: { type: 'plain_text', text: 'Urgent' }, value: 'Urgent' },
          { text: { type: 'plain_text', text: 'High' }, value: 'High' },
          { text: { type: 'plain_text', text: 'Medium' }, value: 'Medium' },
          { text: { type: 'plain_text', text: 'Low' }, value: 'Low' },
        ],
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

app.command('/new-ticket', async ({ ack, body, client }) => {
  await ack();
  await client.views.open({ trigger_id: body.trigger_id, view: modalView });
});

app.view('ticket_submit', async ({ ack, body, view, client }) => {
  await ack();

  const state = view.state.values;
  const payload = {
    name: state.name.value.value,
    email: state.email.value.value,
    title: state.title.value.value,
    system: state.system.value.value,
    urgency: state.urgency.value.selected_option.value,
    description: state.description?.value?.value || '',
  };

  try {
    const res = await axios.post(`${process.env.API_URL}/submit-ticket`, payload);
    const { ticketId, emailStatus } = res.data;
    await client.chat.postMessage({
      channel: body.user.id,
      text: `Ticket ${ticketId} submitted (email ${emailStatus}).`,
    });
  } catch (err) {
    console.error('Failed to submit ticket:', err.message);
    await client.chat.postMessage({
      channel: body.user.id,
      text: 'Failed to submit ticket.',
    });
  }
});

(async () => {
  await app.start(PORT);
  console.log(`✅ CueIT Slack service running on port ${PORT}`);
})();
