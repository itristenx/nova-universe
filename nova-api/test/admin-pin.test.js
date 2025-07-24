import request from 'supertest';
import assert from 'assert';
const app = globalThis.app;
const token = 'kiosktoken';

describe('Admin PIN verification', function() {
  it('rejects request with missing token', function() {
    return request(app)
      .post('/api/verify-admin-pin')
      .send({ pin: '123456' })
      .expect(401);
  });

  it('accepts token in body', async function() {
    const res = await request(app)
      .post('/api/verify-admin-pin')
      .send({ pin: '123456', token })
      .expect(200);
    assert.strictEqual(res.body.valid, true);
  });

  it('accepts token in Authorization header', async function() {
    const res = await request(app)
      .post('/api/verify-admin-pin')
      .set('Authorization', `Bearer ${token}`)
      .send({ pin: '123456' })
      .expect(200);
    assert.strictEqual(res.body.valid, true);
  });
});
