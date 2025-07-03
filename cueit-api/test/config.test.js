import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
import bcrypt from 'bcryptjs';
const app = globalThis.app;

const defaults = {
  logoUrl: '/logo.png',
  faviconUrl: '/vite.svg',
  welcomeMessage: 'Welcome to the Help Desk',
  helpMessage: 'Need to report an issue?',
};
const adminHash = bcrypt.hashSync('admin', 10);

function resetDb(done) {
  db.serialize(() => {
    db.run('DELETE FROM logs');
    db.run('DELETE FROM config');
    const stmt = db.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaults)) {
      stmt.run(k, v);
    }
    stmt.run('adminPassword', adminHash);
    stmt.finalize(done);
  });
}

beforeEach((done) => {
  resetDb(done);
});

describe('Config endpoints', function () {
  it('GET /api/config returns defaults', function () {
    return request(app)
      .get('/api/config')
      .expect(200)
      .expect((res) => {
        for (const [k, v] of Object.entries(defaults)) {
          assert.strictEqual(res.body[k], v);
        }
        assert.strictEqual(typeof res.body.adminPassword, 'undefined');
      });
  });

  it('PUT /api/config updates and persists values', async function () {
    const updates = { logoUrl: 'new.png', welcomeMessage: 'Hi' };
    await request(app).put('/api/config').send(updates).expect(200);

    const res = await request(app).get('/api/config').expect(200);
    assert.strictEqual(res.body.logoUrl, 'new.png');
    assert.strictEqual(res.body.welcomeMessage, 'Hi');
  });

  it('POST /api/verify-password validates stored hash', async function () {
    const res = await request(app)
      .post('/api/verify-password')
      .send({ password: 'admin' })
      .expect(200);
    assert.strictEqual(res.body.valid, true);
  });

  it('PUT /api/admin-password updates the password hash', async function () {
    await request(app)
      .put('/api/admin-password')
      .send({ password: 'secret' })
      .expect(200);

    const okRes = await request(app)
      .post('/api/verify-password')
      .send({ password: 'secret' })
      .expect(200);
    assert.strictEqual(okRes.body.valid, true);

    const badRes = await request(app)
      .post('/api/verify-password')
      .send({ password: 'admin' })
      .expect(200);
    assert.strictEqual(badRes.body.valid, false);
  });
});
