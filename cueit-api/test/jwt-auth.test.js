import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';
import sqlite3pkg from 'sqlite3';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = path.join(__dirname, '..', 'index.js');
const port = 3050;
let proc;
const nodeBin = process.execPath;
const sqlite3 = sqlite3pkg.verbose();
const dbFile = path.join(__dirname, '..', 'log.sqlite');

function setAdminPassword(pwd) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbFile);
    const hash = bcrypt.hashSync(pwd, 10);
    db.run(
      `INSERT INTO config (key, value) VALUES ('adminPassword', ?)
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
      [hash],
      () => {
        db.close();
        resolve();
      }
    );
  });
}

function startServer(done) {
  setAdminPassword('admin').then(() => {
    proc = spawn(nodeBin, [apiPath], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        API_PORT: String(port),
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
    if (d.toString().includes('CueIT API running')) done();
  });
  });
}

function stopServer() {
  if (proc) proc.kill();
}

describe('JWT authentication', function () {
  this.timeout(5000);
  before((done) => startServer(done));
  after(stopServer);

  it('issues a token and authorizes requests', async () => {
    const res = await fetch(`http://localhost:${port}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'admin' }),
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
