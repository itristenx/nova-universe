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

async function resetDb() {
  await dbWrapper.ensureReady?.();
  await dbWrapper.query('DELETE FROM logs');
}

beforeEach(async () => {
  await resetDb();
  await dbWrapper.query(
    `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    ['1', 'A', 'a@x.com', 'T1', 'Sys', 'High', '2024-06-01T10:00:00Z', 'success']
  );
  await dbWrapper.query(
    `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    ['2', 'B', 'b@x.com', 'T2', 'Sys', 'Low', '2024-06-05T10:00:00Z', 'fail']
  );
  await dbWrapper.query(
    `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    ['3', 'C', 'c@x.com', 'T3', 'Sys', 'Low', '2024-06-10T10:00:00Z', 'success']
  );
});

describe('GET /api/logs filters', function() {
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
