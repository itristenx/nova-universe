import { calculateVipWeight, normalizeTicketType } from '../utils/utils.js';
import { getEmailStrategy } from '../utils/serviceHelpers.js';

describe('API Utils', () => {
  describe('calculateVipWeight', () => {
    test('should return 0 for non-VIP users', () => {
      expect(calculateVipWeight(false)).toBe(0);
      expect(calculateVipWeight(false, 'exec')).toBe(0);
    });

    test('should throw error when isVip is true but vipLevel is missing', () => {
      expect(() => calculateVipWeight(true)).toThrow('vipLevel must be provided when isVip is true');
      expect(() => calculateVipWeight(true, null)).toThrow('vipLevel must be provided when isVip is true');
      expect(() => calculateVipWeight(true, undefined)).toThrow('vipLevel must be provided when isVip is true');
    });

    test('should return correct weights for VIP levels', () => {
      expect(calculateVipWeight(true, 'exec')).toBe(3);
      expect(calculateVipWeight(true, 'gold')).toBe(2);
      expect(calculateVipWeight(true, 'silver')).toBe(1);
      expect(calculateVipWeight(true, 'bronze')).toBe(1);
      expect(calculateVipWeight(true, 'any-other')).toBe(1);
    });

    test('should handle case variations', () => {
      // The function is case-sensitive, so only lowercase should return higher weights
      expect(calculateVipWeight(true, 'exec')).toBe(3);
      expect(calculateVipWeight(true, 'EXEC')).toBe(1); // default case
      expect(calculateVipWeight(true, 'gold')).toBe(2);
      expect(calculateVipWeight(true, 'GOLD')).toBe(1); // default case
    });
  });

  describe('normalizeTicketType', () => {
    test('should throw error for invalid inputs', () => {
      expect(() => normalizeTicketType()).toThrow('type is required');
      expect(() => normalizeTicketType(null)).toThrow('type is required');
      expect(() => normalizeTicketType('')).toThrow('type is required');
      expect(() => normalizeTicketType(123)).toThrow('type is required');
      expect(() => normalizeTicketType({})).toThrow('type is required');
    });

    test('should throw error for unsupported ticket types', () => {
      expect(() => normalizeTicketType('INVALID')).toThrow('Unsupported ticket type: INVALID');
      expect(() => normalizeTicketType('XXX')).toThrow('Unsupported ticket type: XXX');
    });

    test('should normalize valid ticket types', () => {
      expect(normalizeTicketType('inc')).toBe('INC');
      expect(normalizeTicketType('INC')).toBe('INC');
      expect(normalizeTicketType('  inc  ')).toBe('INC');
      expect(normalizeTicketType('req')).toBe('REQ');
      expect(normalizeTicketType('prb')).toBe('PRB');
      expect(normalizeTicketType('chg')).toBe('CHG');
      expect(normalizeTicketType('task')).toBe('TASK');
      expect(normalizeTicketType('hr')).toBe('HR');
      expect(normalizeTicketType('ops')).toBe('OPS');
      expect(normalizeTicketType('isac')).toBe('ISAC');
      expect(normalizeTicketType('fb')).toBe('FB');
    });

    test('should handle whitespace and case variations', () => {
      expect(normalizeTicketType('  INC  ')).toBe('INC');
      expect(normalizeTicketType('Inc')).toBe('INC');
      expect(normalizeTicketType('inc')).toBe('INC');
    });
  });

  describe('getEmailStrategy', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    test('should return HelpScout when configured', () => {
      process.env.HELPSCOUT_API_KEY = 'test-key';
      process.env.HELPSCOUT_MAILBOX_ID = 'test-mailbox';
      
      const strategy = getEmailStrategy();
      expect(strategy.sendViaHelpScout).toBe(true);
      expect(strategy.helpScout).toBeTruthy();
      expect(strategy.helpScout.apiKey).toBe('test-key');
      expect(strategy.helpScout.mailboxId).toBe('test-mailbox');
    });

    test('should fall back to SMTP when HelpScout not configured', () => {
      delete process.env.HELPSCOUT_API_KEY;
      delete process.env.HELPSCOUT_MAILBOX_ID;
      delete process.env.M365_CLIENT_ID;
      delete process.env.M365_CLIENT_SECRET;
      delete process.env.M365_TENANT_ID;
      
      const strategy = getEmailStrategy();
      expect(strategy.sendViaSmtp).toBe(true);
      expect(strategy.sendViaHelpScout).toBe(false);
      expect(strategy.sendViaM365).toBe(false);
    });

    test('should fall back to SMTP when only partially configured', () => {
      process.env.HELPSCOUT_API_KEY = 'test-key';
      delete process.env.HELPSCOUT_MAILBOX_ID; // Missing required field
      
      const strategy = getEmailStrategy();
      expect(strategy.sendViaSmtp).toBe(true);
      expect(strategy.sendViaHelpScout).toBe(false);
    });
  });
});