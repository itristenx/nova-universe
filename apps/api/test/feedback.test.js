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

beforeEach(async () => {
  await dbWrapper.query('DELETE FROM feedback');
});

describe('Feedback API', function() {
  it('stores feedback and returns id', async function() {
    const res = await request(app)
      .post('/api/feedback')
      .send({ name: 'Alice', message: 'Great app' })
      .expect(200);
    assert.ok(res.body.id);

    const list = await request(app)
      .get('/api/feedback')
      .set('Authorization', 'Bearer testtoken')
      .expect(200);
    assert.strictEqual(list.body.length, 1);
    assert.strictEqual(list.body[0].name, 'Alice');
    assert.strictEqual(list.body[0].message, 'Great app');
  });

  it('validates message', function() {
    return request(app)
      .post('/api/feedback')
      .send({})
      .expect(400);
  });
});

// No direct createdAt/updatedAt usage in test, but ensure future queries use snake_case.

