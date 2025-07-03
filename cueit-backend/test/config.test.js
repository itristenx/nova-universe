const request = require('supertest');
const assert = require('assert');

function getFreshApp() {
  delete require.cache[require.resolve('../index')];
  delete require.cache[require.resolve('../db')];
  process.env.DB_FILE = ':memory:';
  const app = require('../index');
  const db = require('../db');
  return { app, db };
}

describe('Config API', function() {
  it('GET /api/config returns defaults', async function() {
    const { app, db } = getFreshApp();
    const res = await request(app).get('/api/config').expect(200);
    assert.deepStrictEqual(res.body, {
      logoUrl: '/logo.png',
      faviconUrl: '/vite.svg',
      welcomeMessage: 'Welcome to the Help Desk',
      helpMessage: 'Need to report an issue?',
      adminPassword: 'admin'
    });
    db.close();
  });

  it('PUT /api/config updates values and persists them', async function() {
    const { app, db } = getFreshApp();
    await request(app)
      .put('/api/config')
      .send({ welcomeMessage: 'Hello', adminPassword: 'secret' })
      .expect(200)
      .expect(res => {
        assert.strictEqual(res.body.message, 'Config updated');
      });

    const res = await request(app).get('/api/config').expect(200);
    assert.deepStrictEqual(res.body, {
      logoUrl: '/logo.png',
      faviconUrl: '/vite.svg',
      welcomeMessage: 'Hello',
      helpMessage: 'Need to report an issue?',
      adminPassword: 'secret'
    });
    db.close();
  });
});
