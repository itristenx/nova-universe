import { jest } from '@jest/globals';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import bcrypt from 'bcryptjs';

jest.setTimeout(5000);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.join(__dirname, '..', 'index.js');
const port = 3050;
let proc;
const nodeBin = process.execPath;

// Mock createUser for test
async function createUser(email, name, password) {
  // Simulate user creation
  return Promise.resolve();
}

function startServer(done) {
  createUser('admin@example.com', 'Admin', 'admin').then(() => {
    proc = spawn(nodeBin, [apiPath], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        API_PORT: String(port),
        NODE_ENV: 'development',
        DISABLE_AUTH: 'false',
        SESSION_SECRET: 'test',
        SAML_ENTRY_POINT: 'http://localhost/saml',
        SAML_ISSUER: 'cueit',
        SAML_CALLBACK_URL: 'http://localhost/callback',
      SAML_CERT: 'dummy',
      JWT_SECRET: 'jwtsecret',
    },
  });
  proc.stdout.on('data', (d) => {
    if (d.toString().includes('Nova Universe API Server running')) done();
  });
  });
}

function stopServer() {
  if (proc) proc.kill();
}

describe('JWT authentication', () => {
  beforeAll((done) => startServer(done));
  afterAll(stopServer);

  it('issues a token and authorizes requests', async () => {
    const res = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin' }),
    });
    const loginData = await res.json();
    assert(loginData.token, 'token missing');
    const token = loginData.token;

    const configRes = await fetch(`http://localhost:${port}/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(configRes.status, 200);
  });

  it('rejects requests without token', async () => {
    const res = await fetch(`http://localhost:${port}/api/config`);
    assert.strictEqual(res.status, 401);
  });
});
