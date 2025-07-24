import request from 'supertest';
import assert from 'assert';
import db from '../db.js';

const app = globalThis.app;

function resetDb(done) {
  db.run('DELETE FROM logs', done);
}

describe('GET /api/logs filters', function() {
  beforeEach((done) => {
    resetDb(() => {
      db.serialize(() => {
        db.run(
          `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
           VALUES ('1', 'A', 'a@x.com', 'T1', 'Sys', 'High', '2024-06-01T10:00:00Z', 'success')`
        );
        db.run(
          `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
           VALUES ('2', 'B', 'b@x.com', 'T2', 'Sys', 'Low', '2024-06-05T10:00:00Z', 'fail')`
        );
        db.run(
          `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
           VALUES ('3', 'C', 'c@x.com', 'T3', 'Sys', 'Low', '2024-06-10T10:00:00Z', 'success')`,
          done
        );
      });
    });
  });

  it('returns all logs by default', async function() {
    const res = await request(app).get('/api/v1/logs').expect(200);
    assert.strictEqual(res.body.length, 3);
  });

  it('filters by date range', async function() {
    const res = await request(app)
      .get('/api/v1/logs')
      .query({ start: '2024-06-02', end: '2024-06-09' })
      .expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].ticket_id, '2');
  });

  it('filters by status', async function() {
    const res = await request(app)
      .get('/api/v1/logs')
      .query({ status: 'fail' })
      .expect(200);
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].email_status, 'fail');
  });
});
