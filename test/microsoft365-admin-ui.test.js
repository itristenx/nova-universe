import fs from 'fs';
import test from 'node:test';
import assert from 'node:assert';

const uiPath = 'apps/unified/src/pages/admin/IntegrationsPage.tsx';
const apiPath = 'apps/api/routes/integrations.js';

test('Admin UI includes Microsoft 365 integration form', () => {
  const content = fs.readFileSync(uiPath, 'utf8');
  assert.ok(content.includes('Microsoft 365'), 'Microsoft 365 entry missing');
  assert.ok(content.includes('Tenant ID'), 'Tenant ID field missing');
  assert.ok(content.includes('Client ID'), 'Client ID field missing');
  assert.ok(content.includes('Client Secret'), 'Client Secret field missing');
  assert.ok(content.includes('Mailbox'), 'Mailbox field missing');
});

test('Integrations API exposes Microsoft 365 config', () => {
  const content = fs.readFileSync(apiPath, 'utf8');
  assert.ok(content.includes('Microsoft 365'), 'Microsoft 365 not listed in API');
  assert.ok(content.includes('integration_'), 'Database key prefix missing');
  assert.ok(content.includes("router.post('/:key'"), 'POST route for integration config missing');
});
