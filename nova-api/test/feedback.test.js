import request from 'supertest';
import assert from 'assert';
import db from '../db.js';
const app = globalThis.app;

beforeEach((done) => {
  db.run('DELETE FROM feedback', done);
});

describe('Feedback API', function() {
  it('stores feedback and returns id', async function() {
    const res = await request(app)
      .post('/api/v1/feedback')
      .send({ name: 'Alice', message: 'Great app' })
      .expect(200);
    assert.ok(res.body.id);

    const list = await request(app).get('/api/v1/feedback').expect(200);
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

