import request from 'supertest';
import setupPromise from './00_setup.js';
import { jest } from '@jest/globals';
jest.setTimeout(30000);
let app;

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

const login = async () => {
  const res = await request(app)
    .post('/api/v1/helix/login')
    .send({ email: 'admin@example.com', password: 'admin' });
  return res.body.token;
};

describe('role enforcement', () => {
  it('allows admin to list roles', async () => {
    const token = await login();
    await request(app)
      .get('/api/v1/helix/roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('denies non admin access', async () => {
    const res = await request(app)
      .post('/api/v1/helix/register')
      .send({ email: 'bob@e.com', password: 'pass', name: 'Bob' })
      .expect(201);
    const token = res.body.token;
    await request(app)
      .get('/api/v1/helix/roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
