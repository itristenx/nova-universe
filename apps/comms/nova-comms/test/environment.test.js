import { validateEnv } from '../environment.js';

describe('validateEnv', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  test('throws when required variables missing', () => {
    delete process.env.SLACK_SIGNING_SECRET;
    delete process.env.SLACK_BOT_TOKEN;
    delete process.env.API_URL;
    delete process.env.JWT_SECRET;
    expect(() => validateEnv()).toThrow(/Missing required environment variables/);
  });

  test('returns config when variables provided', () => {
    process.env.SLACK_SIGNING_SECRET = 'sig';
    process.env.SLACK_BOT_TOKEN = 'token';
    process.env.API_URL = 'http://example.com';
    process.env.JWT_SECRET = 'secret';
    process.env.SLACK_PORT = '4000';
    process.env.JWT_EXPIRES_IN = '2h';
    process.env.VITE_ADMIN_URL = 'http://admin';

    const config = validateEnv();
    expect(config).toEqual({ port: 4000, jwtExpiresIn: '2h', adminUrl: 'http://admin' });
  });
});
