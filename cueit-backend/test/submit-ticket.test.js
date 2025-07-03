const request = require('supertest');
const assert = require('assert');
const db = require('../db');
const app = global.app;

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
    stmt.run('adminPassword', require('bcryptjs').hashSync('admin', 10));
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

    const res = await request(app).post('/submit-ticket').send(payload).expect(200);
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
});
