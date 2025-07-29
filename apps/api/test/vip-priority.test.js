import 'dotenv/config';
import request from 'supertest';
import assert from 'assert';
import dbWrapper from '../db.js';
import setupPromise from './00_setup.js';

let app;

beforeAll(async () => {
  await setupPromise;
  app = globalThis.app;
});

async function login(email, password) {
  const res = await request(app)
    .post('/api/v1/helix/login')
    .send({ email, password });
  return res.body.token;
}

async function createUser(id, email, name, password, isVip = false, vipLevel = null) {
  const hash = (await import('bcryptjs')).default.hashSync(password, 12);
  await dbWrapper.query(
    'INSERT INTO users (id, email, name, password_hash, is_vip, vip_level, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)',
    [id, email, name, hash, isVip ? 1 : 0, vipLevel, new Date().toISOString()]
  );
}

describe('VIP ticket prioritization', function () {
  const vipId = 'vip-user';
  const regId = 'reg-user';
  let adminToken;

  beforeAll(async () => {
    await dbWrapper.query('DELETE FROM tickets');
    await dbWrapper.query('DELETE FROM users WHERE id in ($1,$2)', [vipId, regId]);
    await createUser(vipId, 'vip@example.com', 'VIP', 'vip', true, 'gold');
    await createUser(regId, 'reg@example.com', 'REG', 'reg', false, null);
    adminToken = await login('admin@example.com', 'admin');
  });

  it('returns VIP ticket first', async function () {
    const vipToken = await login('vip@example.com', 'vip');
    const regToken = await login('reg@example.com', 'reg');

    await request(app)
      .post('/api/v1/orbit/tickets')
      .set('Authorization', `Bearer ${vipToken}`)
      .send({
        title: 'VIP Issue',
        description: 'help',
        category: 'gen',
        priority: 'high'
      })
      .expect(201);

    await request(app)
      .post('/api/v1/orbit/tickets')
      .set('Authorization', `Bearer ${regToken}`)
      .send({
        title: 'Normal Issue',
        description: 'help',
        category: 'gen',
        priority: 'high'
      })
      .expect(201);

    const res = await request(app)
      .get('/api/v1/pulse/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert(res.body.tickets.length >= 2);
    assert(res.body.tickets[0].vipWeight >= res.body.tickets[1].vipWeight);
  });
});
