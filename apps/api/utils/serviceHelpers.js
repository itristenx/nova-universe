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

export function isM365Configured() {
  return (
    !!process.env.M365_CLIENT_ID &&
    !!process.env.M365_CLIENT_SECRET &&
    !!process.env.M365_TENANT_ID
  );
}

export function getM365Config() {
  if (!isM365Configured()) return null;
  return {
    clientId: process.env.M365_CLIENT_ID,
    clientSecret: process.env.M365_CLIENT_SECRET,
    tenantId: process.env.M365_TENANT_ID,
    scopes: (process.env.M365_GRAPH_SCOPES ||
      'Mail.ReadWrite Mail.Send MailboxSettings.Read User.Read.All').split(' '),
  };
}

/**
 * Determines email sending strategy based on configuration
 * @returns {Object} Email strategy configuration
 */
export function _getEmailStrategy() {
  const helpScoutConfig = getHelpScoutConfig();
  const m365Config = getM365Config();
  const sendViaHelpScout = !!helpScoutConfig;
  const sendViaM365 = !!m365Config;
  const sendViaSmtp = (!sendViaHelpScout && !sendViaM365) ||
    (helpScoutConfig && helpScoutConfig.smtpFallback);

  return {
    helpScout: helpScoutConfig,
    m365: m365Config,
    sendViaHelpScout,
    sendViaM365,
    sendViaSmtp
  };
}