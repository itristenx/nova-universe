import 'dotenv/config';
import request from 'supertest';
import assert from 'assert';
import http from 'http';
import dbWrapper, { closeDatabase } from '../db.js';
import app from '../index.js';
import setupPromise from './00_setup.js';

describe('Notifications API', function() {
  beforeAll(async () => {
    await setupPromise;
  });

  beforeEach(async () => {
    await dbWrapper.query('DELETE FROM notifications');
  });

  it('creates and lists notifications', async function() {
    let res = await request(app)
      .post('/api/notifications')
      .send({ message: 'Hi', level: 'info' })
      .expect(200);
    assert.ok(res.body.id);

    res = await request(app).get('/api/notifications').expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].message, 'Hi');
  });

  it('deletes a notification', async function() {
    const res = await request(app)
      .post('/api/notifications')
      .send({ message: 'Bye', level: 'info' });
    const id = res.body.id;
    await request(app).delete(`/api/notifications/${id}`).expect(200);
    const list = await request(app).get('/api/notifications').expect(200);
    assert.strictEqual(list.body.length, 0);
  });

  it('streams updates via SSE', function(done) {
    const server = http.createServer(app);
    server.listen(0, async () => {
      const port = server.address().port;
      const res = await fetch(`http://localhost:${port}/api/notifications/stream`);
      const reader = res.body.getReader();
      let text = '';
      const read = async () => {
        const { value, done: d } = await reader.read();
        if (d) return;
        text += new TextDecoder().decode(value);
        if (text.includes('\n\n')) {
          if (text.includes('Test msg')) {
            reader.cancel();
            server.close();
            done();
            return;
          }
          text = '';
        }
        read();
      };
      read();
      await request(app)
        .post('/api/notifications')
        .send({ message: 'Test msg', level: 'info' });
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });
});
