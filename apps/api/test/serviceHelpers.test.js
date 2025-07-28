import 'dotenv/config';
import assert from 'assert';
import { isHelpScoutConfigured, getHelpScoutConfig, getEmailStrategy } from '../utils/serviceHelpers.js';

describe('Service Helpers', function () {
  beforeEach(() => {
    // Clear relevant environment variables before each test
    delete process.env.HELPSCOUT_API_KEY;
    delete process.env.HELPSCOUT_MAILBOX_ID;
    delete process.env.HELPSCOUT_SMTP_FALLBACK;
  });


  describe('HelpScout Configuration', function () {
    it('should return false when HelpScout is not configured', function () {
      assert.strictEqual(isHelpScoutConfigured(), false);
    });

    it('should return false when only API key is configured', function () {
      process.env.HELPSCOUT_API_KEY = 'test-api-key';
      assert.strictEqual(isHelpScoutConfigured(), false);
    });

    it('should return false when only mailbox ID is configured', function () {
      process.env.HELPSCOUT_MAILBOX_ID = '123';
      assert.strictEqual(isHelpScoutConfigured(), false);
    });

    it('should return true when both API key and mailbox ID are configured', function () {
      process.env.HELPSCOUT_API_KEY = 'test-api-key';
      process.env.HELPSCOUT_MAILBOX_ID = '123';
      assert.strictEqual(isHelpScoutConfigured(), true);
    });

    it('should return null config when HelpScout is not configured', function () {
      assert.strictEqual(getHelpScoutConfig(), null);
    });

    it('should return valid config when HelpScout is configured', function () {
      process.env.HELPSCOUT_API_KEY = 'test-api-key';
      process.env.HELPSCOUT_MAILBOX_ID = '123';
      process.env.HELPSCOUT_SMTP_FALLBACK = 'true';
      
      const config = getHelpScoutConfig();
      assert.deepStrictEqual(config, {
        apiKey: 'test-api-key',
        mailboxId: '123',
        smtpFallback: true
      });
    });

    it('should handle smtp fallback as false when not set', function () {
      process.env.HELPSCOUT_API_KEY = 'test-api-key';
      process.env.HELPSCOUT_MAILBOX_ID = '123';
      
      const config = getHelpScoutConfig();
      assert.strictEqual(config.smtpFallback, false);
    });
  });

  describe('Email Strategy', function () {
    it('should use SMTP only when HelpScout is not configured', function () {
      const strategy = getEmailStrategy();
      assert.strictEqual(strategy.helpScout, null);
      assert.strictEqual(strategy.sendViaHelpScout, false);
      assert.strictEqual(strategy.sendViaSmtp, true);
    });

    it('should use HelpScout only when configured without SMTP fallback', function () {
      process.env.HELPSCOUT_API_KEY = 'test-api-key';
      process.env.HELPSCOUT_MAILBOX_ID = '123';
      process.env.HELPSCOUT_SMTP_FALLBACK = 'false';
      
      const strategy = getEmailStrategy();
      assert.notStrictEqual(strategy.helpScout, null);
      assert.strictEqual(strategy.sendViaHelpScout, true);
      assert.strictEqual(strategy.sendViaSmtp, false);
    });

    it('should use both HelpScout and SMTP when fallback is enabled', function () {
      process.env.HELPSCOUT_API_KEY = 'test-api-key';
      process.env.HELPSCOUT_MAILBOX_ID = '123';
      process.env.HELPSCOUT_SMTP_FALLBACK = 'true';
      
      const strategy = getEmailStrategy();
      assert.notStrictEqual(strategy.helpScout, null);
      assert.strictEqual(strategy.sendViaHelpScout, true);
      assert.strictEqual(strategy.sendViaSmtp, true);
    });
  });
});