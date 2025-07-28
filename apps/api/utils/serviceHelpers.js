/**
 * Service configuration and availability utilities
 * Extracts service configuration checking logic to improve code readability
 */

/**
 * Checks if HelpScout integration is properly configured
 * @returns {boolean} True if HelpScout can be used, false otherwise
 */
export function isHelpScoutConfigured() {
  const HS_KEY = process.env.HELPSCOUT_API_KEY;
  const HS_MAILBOX = process.env.HELPSCOUT_MAILBOX_ID;
  
  return !!(HS_KEY && HS_MAILBOX);
}

/**
 * Gets HelpScout configuration if available
 * @returns {Object|null} HelpScout config object or null if not configured
 */
export function getHelpScoutConfig() {
  if (!isHelpScoutConfigured()) {
    return null;
  }
  
  return {
    apiKey: process.env.HELPSCOUT_API_KEY,
    mailboxId: process.env.HELPSCOUT_MAILBOX_ID,
    smtpFallback: process.env.HELPSCOUT_SMTP_FALLBACK === 'true'
  };
}

/**
 * Determines email sending strategy based on configuration
 * @returns {Object} Email strategy configuration
 */
export function getEmailStrategy() {
  const helpScoutConfig = getHelpScoutConfig();
  const sendViaHelpScout = !!helpScoutConfig;
  const sendViaSmtp = !sendViaHelpScout || (helpScoutConfig && helpScoutConfig.smtpFallback);
  
  return {
    helpScout: helpScoutConfig,
    sendViaHelpScout,
    sendViaSmtp
  };
}