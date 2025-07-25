import request from 'supertest';
import assert from 'assert';
import db from '../db.js';

beforeEach((done) => {
  db.run('DELETE FROM feedback', done);
});

describe('Feedback API', function() {
  it('stores feedback and returns id', async function() {
    const res = await request(global.app)
      .post('/api/feedback')
      .send({ name: 'Alice', message: 'Great app' })
      .expect(200);
    assert.ok(res.body.id);

    const list = await request(global.app)
      .get('/api/feedback')
      .set('Authorization', 'Bearer testtoken')
      .expect(200);
    assert.strictEqual(list.body.length, 1);
    assert.strictEqual(list.body[0].name, 'Alice');
    assert.strictEqual(list.body[0].message, 'Great app');
  });

  it('validates message', function() {
    return request(global.app)
      .post('/api/feedback')
      .send({})
      .expect(400);
  });
});

