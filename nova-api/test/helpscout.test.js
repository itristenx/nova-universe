const request = require('supertest');
const app = require('../index');

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
    jest.mock('axios', () => ({
      get: jest.fn(() => Promise.resolve({
        data: [
          { id: 'ticket1', subject: 'Test Ticket 1' },
          { id: 'ticket2', subject: 'Test Ticket 2' },
        ],
      })),
    }));

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
    jest.mock('axios', () => ({
      get: jest.fn(() => Promise.reject(new Error('API Error'))),
    }));

    const response = await request(app)
      .post('/api/helpscout/import')
      .send({ apiKey: mockApiKey, mailboxId: mockMailboxId });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to import tickets.');
  });
});
