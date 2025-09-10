import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import Microsoft365Connector from '../packages/integrations/integration/connectors/microsoft365-connector.js';

const createHttpClient = () => ({
  defaults: { headers: { common: {} } },
  get: async () => {},
  post: async () => {},
});

const config = {
  tenantId: '00000000-0000-0000-0000-000000000000',
  clientId: '11111111-1111-1111-1111-111111111111',
  clientSecret: 'example-secret',
};

test('Microsoft365Connector initializes and acquires token', async () => {
  const httpClient = createHttpClient();
  axios.create = () => httpClient;
  let tokenRequested = false;
  axios.post = async () => {
    tokenRequested = true;
    return { data: { access_token: 'test-token', expires_in: 3600 } };
  };

  const connector = new Microsoft365Connector();
  await connector.initialize(config);

  assert.equal(tokenRequested, true);
  assert.equal(connector.token, 'test-token');
  assert.equal(httpClient.defaults.headers.common.Authorization, 'Bearer test-token');
});

test('Microsoft365Connector sendMail posts to Graph API', async () => {
  const httpClient = createHttpClient();
  let postedUrl = '';
  let postedBody;
  httpClient.post = async (url, body) => {
    postedUrl = url;
    postedBody = body;
  };
  axios.create = () => httpClient;
  axios.post = async () => ({ data: { access_token: 'test-token', expires_in: 3600 } });

  const connector = new Microsoft365Connector();
  await connector.initialize(config);

  await connector.sendMail('user@example.com', {
    subject: 'Hello',
    body: { contentType: 'Text', content: 'Hi' },
    toRecipients: [{ emailAddress: { address: 'a@example.com' } }],
  });

  assert.equal(postedUrl, '/users/user%40example.com/sendMail');
  assert.equal(postedBody.saveToSentItems, true);
  assert.ok(postedBody.message);
});

