import request from 'supertest';
import app from '../index.js';

jest.mock('axios');

describe('HelpScout Import Endpoint', () => {
  it('should return 400 if API key or Mailbox ID is missing', async () => {
    const response = await request(app).post('/api/helpscout/import').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('API key and Mailbox ID are required.');
  });

  it('should return 200 and import tickets successfully', async () => {
    const mockApiKey = 'mock-api-key';
    const mockMailboxId = '12345';

    // Mock the HelpScout API response
    const axios = await import('axios');
    axios.get.mockResolvedValue({
      data: [
        { id: 'ticket1', subject: 'Test Ticket 1' },
        { id: 'ticket2', subject: 'Test Ticket 2' },
      ],
    });

    const response = await request(app)
      .post('/api/helpscout/import')
      .send({ apiKey: mockApiKey, mailboxId: mockMailboxId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Tickets imported successfully.');
    expect(response.body.tickets.length).toBe(2);
  });

  it('should return 500 if HelpScout API fails', async () => {
    const mockApiKey = 'mock-api-key';
    const mockMailboxId = '12345';

    // Mock the HelpScout API error
    const axios = await import('axios');
    axios.get.mockRejectedValue(new Error('API Error'));

    const response = await request(app)
      .post('/api/helpscout/import')
      .send({ apiKey: mockApiKey, mailboxId: mockMailboxId });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to import tickets.');
  });
});

describe('HelpScout API Integration', () => {
  it('should fetch tickets from HelpScout', async () => {
    const res = await request(app).get('/api/helpscout/tickets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
