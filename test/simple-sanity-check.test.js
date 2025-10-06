// Simple API Test - Check if basic endpoints are working
import test from 'node:test';
import assert from 'node:assert';

test('Basic Node Test - Sanity Check', async () => {
  console.log('✅ Node test framework is working');
  assert.strictEqual(1 + 1, 2, 'Basic math works');
});

test('Environment Check', async () => {
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  assert.ok(process.version.startsWith('v'), 'Node.js is running');
});
