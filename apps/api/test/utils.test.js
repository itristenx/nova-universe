import { calculateVipWeight } from '../utils/utils.js';
import { getEmailStrategy } from '../utils/serviceHelpers.js';

describe('calculateVipWeight', () => {
  test('returns 0 when not VIP', () => {
    expect(calculateVipWeight(false)).toBe(0);
  });

  test('throws when vipLevel missing for VIP', () => {
    expect(() => calculateVipWeight(true)).toThrow('vipLevel must be provided');
  });

  test('returns weight for levels', () => {
    expect(calculateVipWeight(true, 'exec')).toBe(3);
    expect(calculateVipWeight(true, 'gold')).toBe(2);
    expect(calculateVipWeight(true, 'silver')).toBe(1);
  });
});

describe('getEmailStrategy', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.HELPSCOUT_API_KEY;
    delete process.env.HELPSCOUT_MAILBOX_ID;
    delete process.env.HELPSCOUT_SMTP_FALLBACK;
    delete process.env.M365_CLIENT_ID;
    delete process.env.M365_CLIENT_SECRET;
    delete process.env.M365_TENANT_ID;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('uses HelpScout when configured', () => {
    process.env.HELPSCOUT_API_KEY = 'key';
    process.env.HELPSCOUT_MAILBOX_ID = 'box';

    const strategy = getEmailStrategy();
    expect(strategy.sendViaHelpScout).toBe(true);
    expect(strategy.sendViaSmtp).toBe(false);
    expect(strategy.helpScout).toEqual({
      apiKey: 'key',
      mailboxId: 'box',
      smtpFallback: false,
    });
  });

  test('falls back to SMTP when nothing configured', () => {
    const strategy = getEmailStrategy();
    expect(strategy.sendViaSmtp).toBe(true);
    expect(strategy.sendViaHelpScout).toBe(false);
    expect(strategy.sendViaM365).toBe(false);
  });
});
