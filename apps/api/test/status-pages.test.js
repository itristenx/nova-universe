import request from 'supertest';
import express from 'express';
import statusRouter from '../routes/status.js';

describe('Status Pages', () => {
  let app;

  beforeAll(async () => {
    process.env.FEATURE_STATUS_PAGES = 'false'; // gate disabled for tests
    app = express();
    app.use(express.json());
    app.use('/status', statusRouter);
  });

  test('returns 404 JSON when feature disabled', async () => {
    const res = await request(app).get('/status/pages/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('returns 404 HTML when feature disabled', async () => {
    const res = await request(app).get('/status/status-pages/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});

