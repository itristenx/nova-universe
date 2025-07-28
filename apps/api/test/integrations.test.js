import request from 'supertest';
import app from '../index.js';

describe('Integrations API', () => {
  it('should return 200 for integrations health check', async () => {
    const res = await request(app).get('/api/integrations/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
