import request from 'supertest';
import app from '../index.js';
import dbWrapper from '../db.js';

jest.mock('../db');

describe('Integrations API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/integrations', () => {
    it('should return a list of integrations', async () => {
      dbWrapper.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { key: 'integration_4', value: '{"type":"Slack"}' },
          { key: 'integration_5', value: '{"type":"Discord"}' },
        ]);
      });

      const response = await request(app).get('/api/v1/integrations');

      expect(response.status).toBe(200);
      expect(response.body.integrations).toBeDefined();
      expect(response.body.storedConfigs).toBeDefined();
    });

    it('should handle database errors', async () => {
      dbWrapper.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app).get('/api/v1/integrations');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/v1/integrations/:id/test', () => {
    it('should test Slack integration successfully', async () => {
      dbWrapper.get.mockImplementation((query, params, callback) => {
        callback(null, { value: '{"type":"Slack"}' });
      });

      const response = await request(app).post('/api/v1/integrations/4/test');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Slack integration test successful');
    });

    it('should return 404 for unsupported integration types', async () => {
      dbWrapper.get.mockImplementation((query, params, callback) => {
        callback(null, { value: '{"type":"Unknown"}' });
      });

      const response = await request(app).post('/api/v1/integrations/4/test');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Test not implemented for this integration type');
    });

    it('should handle database errors', async () => {
      dbWrapper.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app).post('/api/v1/integrations/4/test');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });
});
