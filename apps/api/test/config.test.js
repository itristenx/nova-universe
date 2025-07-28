import request from 'supertest';
import assert from 'assert';
import dbWrapper from '../db.js';
import bcrypt from 'bcryptjs';
import setupPromise from './00_setup.js';

let app;

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

const defaults = {
  logoUrl: '/logo.png',
  faviconUrl: '/vite.svg',
  welcomeMessage: 'Welcome to the Help Desk',
  helpMessage: 'Need to report an issue?',
};
const adminHash = bcrypt.hashSync('admin', 12);

async function resetDb() {
  await dbWrapper.query('DELETE FROM logs');
  await dbWrapper.query('DELETE FROM config');
  for (const [k, v] of Object.entries(defaults)) {
    await dbWrapper.query('INSERT INTO config (key, value) VALUES ($1, $2)', [k, v]);
  }
  await dbWrapper.query('INSERT INTO config (key, value) VALUES ($1, $2)', ['adminPassword', adminHash]);
}

beforeEach(async () => {
  await resetDb();
});

describe('Config endpoints', function () {
  it('GET /api/config returns defaults', function () {
    return request(app)
      .get('/api/v1/config')
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
    await request(app).put('/api/v1/config').send(updates).expect(200);

    const res = await request(app).get('/api/v1/config').expect(200);
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
