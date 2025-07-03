const request = require('supertest');
const assert = require('assert');
const db = require('../db');
const app = global.app;

const defaults = {
  logoUrl: '/logo.png',
  faviconUrl: '/vite.svg',
  primaryColor: '#0066CC',
  welcomeMessage: 'Welcome to the Help Desk',
  helpMessage: 'Need to report an issue?',
  adminPassword: 'admin',
};

function resetDb(done) {
  db.serialize(() => {
    db.run('DELETE FROM logs');
    db.run('DELETE FROM config');
    const stmt = db.prepare('INSERT INTO config (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaults)) {
      stmt.run(k, v);
    }
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
      });
  });

  it('PUT /api/config updates and persists values', async function () {
    const updates = { logoUrl: 'new.png', welcomeMessage: 'Hi' };
    await request(app).put('/api/config').send(updates).expect(200);

    const res = await request(app).get('/api/config').expect(200);
    assert.strictEqual(res.body.logoUrl, 'new.png');
    assert.strictEqual(res.body.welcomeMessage, 'Hi');
  });
});
