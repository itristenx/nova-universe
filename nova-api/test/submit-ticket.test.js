import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
import bcrypt from 'bcryptjs';
const app = globalThis.app;

function resetDb(done) {
  const defaults = {
    logoUrl: '/logo.png',
    faviconUrl: '/vite.svg',
    welcomeMessage: 'Welcome to the Help Desk',
    helpMessage: 'Need to report an issue?',
  };
  db.serialize(() => {
    db.run('DELETE FROM logs');
    db.run('DELETE FROM config');
    const stmt = db.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaults)) {
      stmt.run(k, v);
    }
    stmt.run('adminPassword', bcrypt.hashSync('admin', 12));
    stmt.finalize(done);
  });
}

beforeEach((done) => {
  global.setSendBehavior(() => Promise.resolve());
  resetDb(done);
});

describe('POST /submit-ticket', function () {
  it('returns 400 when required fields are missing', function () {
    return request(app)
      .post('/submit-ticket')
      .send({ name: 'John' })
      .expect(400)
      .expect((res) => {
        assert.strictEqual(res.body.error, 'Missing required fields');
      });
  });

  it('returns 200 and logs entry on success', async function () {
    let called = false;
    global.setSendBehavior(async () => { called = true; });

    const payload = {
      name: 'Alice',
      email: 'a@example.com',
      title: 'Test',
      system: 'Sys',
      urgency: 'High',
      description: 'Desc',
    };

    const res = await request(app).post('/api/v1/submit-ticket').send(payload).expect(200);
    assert.strictEqual(called, true, 'sendMail not called');
    assert.strictEqual(res.body.emailStatus, 'success');

    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM logs WHERE ticket_id=?', [res.body.ticketId], (err, r) => {
        resolve(r);
      });
    });
    assert(row, 'log row missing');
    assert.strictEqual(row.email_status, 'success');
  });

  it('sets emailStatus to fail when sendMail throws', async function () {
    global.setSendBehavior(async () => { throw new Error('smtp error'); });

    const payload = {
      name: 'Bob',
      email: 'b@example.com',
      title: 'Fail',
      system: 'Sys',
      urgency: 'Low',
    };

    const res = await request(app).post('/submit-ticket').send(payload).expect(200);
    assert.strictEqual(res.body.emailStatus, 'fail');

    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM logs WHERE ticket_id=?', [res.body.ticketId], (err, r) => {
        resolve(r);
      });
    });
    assert(row, 'log row missing');
    assert.strictEqual(row.email_status, 'fail');
  });

  it('uses HelpScout when API key is set', async function () {
    process.env.HELPSCOUT_API_KEY = 'key';
    process.env.HELPSCOUT_MAILBOX_ID = '1';
    let hsCalled = false;
    let mailCalled = false;
    global.setAxiosBehavior(async () => { hsCalled = true; });
    global.setSendBehavior(async () => { mailCalled = true; });

    const payload = {
      name: 'HS',
      email: 'hs@example.com',
      title: 'Test',
      system: 'Sys',
      urgency: 'High',
    };

    const res = await request(app).post('/submit-ticket').send(payload).expect(200);
    assert.strictEqual(hsCalled, true, 'HelpScout not called');
    assert.strictEqual(mailCalled, false, 'sendMail called');
    assert.strictEqual(res.body.emailStatus, 'success');

    delete process.env.HELPSCOUT_API_KEY;
    delete process.env.HELPSCOUT_MAILBOX_ID;
  });

  it('falls back to SMTP when HELPSCOUT_SMTP_FALLBACK is true', async function () {
    process.env.HELPSCOUT_API_KEY = 'key';
    process.env.HELPSCOUT_MAILBOX_ID = '1';
    process.env.HELPSCOUT_SMTP_FALLBACK = 'true';
    let hsCalled = false;
    let mailCalled = false;
    global.setAxiosBehavior(async () => { hsCalled = true; });
    global.setSendBehavior(async () => { mailCalled = true; });

    const payload = {
      name: 'HS',
      email: 'hs@example.com',
      title: 'Both',
      system: 'Sys',
      urgency: 'Low',
    };

    const res = await request(app).post('/submit-ticket').send(payload).expect(200);
    assert.strictEqual(hsCalled, true, 'HelpScout not called');
    assert.strictEqual(mailCalled, true, 'sendMail not called');
    assert.strictEqual(res.body.emailStatus, 'success');

    delete process.env.HELPSCOUT_API_KEY;
    delete process.env.HELPSCOUT_MAILBOX_ID;
    delete process.env.HELPSCOUT_SMTP_FALLBACK;
  });

  it('posts to ServiceNow when credentials are provided', async function () {
    process.env.SERVICENOW_INSTANCE = 'https://snow.example.com';
    process.env.SERVICENOW_USER = 'user';
    process.env.SERVICENOW_PASS = 'pass';
    let snCalled = false;
    global.setAxiosBehavior(async (url) => {
      if (url === 'https://snow.example.com/api/now/table/incident') {
        snCalled = true;
        return { data: { result: { sys_id: 'INC001' } } };
      }
    });

    const payload = {
      name: 'SN',
      email: 'sn@example.com',
      title: 'ServiceNow',
      system: 'Sys',
      urgency: 'High',
    };

    const res = await request(app).post('/submit-ticket').send(payload).expect(200);
    assert.strictEqual(snCalled, true, 'ServiceNow not called');

    const row = await new Promise((resolve) => {
      db.get('SELECT * FROM logs WHERE ticket_id=?', [res.body.ticketId], (err, r) => {
        resolve(r);
      });
    });
    assert.strictEqual(row.servicenow_id, 'INC001');

    delete process.env.SERVICENOW_INSTANCE;
    delete process.env.SERVICENOW_USER;
    delete process.env.SERVICENOW_PASS;
    global.setAxiosBehavior(async () => ({}));
  });
});
