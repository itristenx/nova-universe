/**
 * Service configuration and availability utilities
 * Extracts service existence checking logic to improve code readability
 */

/**
 * Checks if ServiceNow integration is properly configured
 * @returns {boolean} True if ServiceNow can be used, false otherwise
 */
export function isServiceNowConfigured() {
  const SN_INSTANCE = process.env.SERVICENOW_INSTANCE;
  const SN_USER = process.env.SERVICENOW_USER;
  const SN_PASS = process.env.SERVICENOW_PASS;
  
  return !!(SN_INSTANCE && SN_USER && SN_PASS);
}

/**
 * Gets ServiceNow configuration if available
 * @returns {Object|null} ServiceNow config object or null if not configured
 */
export function getServiceNowConfig() {
  if (!isServiceNowConfigured()) {
    return null;
  }
  
  return {
    instance: process.env.SERVICENOW_INSTANCE,
    user: process.env.SERVICENOW_USER,
    pass: process.env.SERVICENOW_PASS
  };
}

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