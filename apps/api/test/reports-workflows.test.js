import 'dotenv/config';
import request from 'supertest';
import assert from 'assert';
import setupPromise from './00_setup.js';
import { resetWorkflowRuns } from '../routes/workflows.js';

let app;

beforeAll(async () => {
  await setupPromise;
  app = global.app;
});

beforeEach(() => {
  resetWorkflowRuns();
});

describe('Reports API', () => {
  test('GET /api/reports/usage', async () => {
    const res = await request(app).get('/api/reports/usage').expect(200);
    assert.ok(typeof res.body.users === 'number');
    assert.ok(typeof res.body.kiosks === 'number');
  });

  test('GET /api/reports/insights', async () => {
    const res = await request(app).get('/api/reports/insights').expect(200);
    assert.ok(Array.isArray(res.body));
  });
});

describe('Workflows API', () => {
  test('trigger and fetch status', async () => {
    const tr = await request(app)
      .post('/api/workflows/trigger')
      .send({ workflow: 'test-flow' })
      .expect(200);
    assert.ok(tr.body.runId);
    const st = await request(app).get('/api/workflows/status').expect(200);
    assert.strictEqual(st.body.length, 1);
    assert.strictEqual(st.body[0].workflow, 'test-flow');
  });

  test('missing workflow returns 400', () => {
    return request(app).post('/api/workflows/trigger').send({}).expect(400);
  });
});
