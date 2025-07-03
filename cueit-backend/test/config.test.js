const request = require('supertest');

function getFreshApp() {
  jest.resetModules();
  process.env.DB_FILE = ':memory:';
  const app = require('../index');
  const db = require('../db');
  return { app, db };
}

describe('Config API', () => {
  test('GET /api/config returns defaults', async () => {
    const { app, db } = getFreshApp();
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      logoUrl: '/logo.png',
      welcomeMessage: 'Welcome to the Help Desk',
      helpMessage: 'Need to report an issue?',
      adminPassword: 'admin'
    });
    db.close();
  });

  test('PUT /api/config updates values and persists them', async () => {
    const { app, db } = getFreshApp();
    const updates = { welcomeMessage: 'Hello', adminPassword: 'secret' };
    let res = await request(app).put('/api/config').send(updates);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Config updated' });

    res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      logoUrl: '/logo.png',
      welcomeMessage: 'Hello',
      helpMessage: 'Need to report an issue?',
      adminPassword: 'secret'
    });
    db.close();
  });
});
