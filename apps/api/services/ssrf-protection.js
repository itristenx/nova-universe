// Server-Side Request Forgery (SSRF) Protection
// Validates and sanitizes URLs before making external requests
// Following OWASP SSRF Prevention Cheat Sheet

import { logger } from '../logger.js';
import dns from 'dns/promises';
import { URL } from 'url';
import net from 'net';

/**
 * SSRF Protection Service
 */
class SSRFProtection {
  constructor() {
    // Blocked IP ranges (RFC 1918 private networks, localhost, link-local, etc.)
    this.blockedIPRanges = [
      // Localhost
      { start: '127.0.0.0', end: '127.255.255.255' },
      { start: '::1', end: '::1' },
      
      // Private networks (RFC 1918)
      { start: '10.0.0.0', end: '10.255.255.255' },
      { start: '172.16.0.0', end: '172.31.255.255' },
      { start: '192.168.0.0', end: '192.168.255.255' },
      
      // Link-local
      { start: '169.254.0.0', end: '169.254.255.255' },
      { start: 'fe80::', end: 'febf::' },
      
      // Loopback
      { start: '0.0.0.0', end: '0.255.255.255' },
      
      // Multicast
      { start: '224.0.0.0', end: '239.255.255.255' },
      
      // Reserved/Special
      { start: '240.0.0.0', end: '255.255.255.255' },
    ];

    // Allowed URL schemes
    this.allowedSchemes = ['http', 'https'];

    // Maximum redirects to follow
    this.maxRedirects = 3;

    // Request timeout (ms)
    this.requestTimeout = 10000;

    // Allowed domains (whitelist) - configure via environment
    this.allowedDomains = (process.env.SSRF_ALLOWED_DOMAINS || '')
      .split(',')
      .filter(Boolean);

    // Blocked domains (blacklist)
    this.blockedDomains = [
      'localhost',
      'metadata.google.internal',
      '169.254.169.254', // AWS metadata service
      'instance-data', // Azure metadata
    ];
  }

  /**
   * Validate a URL before making a request
   * @param {string} urlString - The URL to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateURL(urlString) {
    try {
      // Parse URL
      const url = new URL(urlString);

      // Check scheme
      if (!this.allowedSchemes.includes(url.protocol.replace(':', ''))) {
        return {
          valid: false,
          reason: `Scheme not allowed: ${url.protocol}`,
        };
      }

      // Check for credentials in URL (shouldn't be there)
      if (url.username || url.password) {
        return {
          valid: false,
          reason: 'URLs with embedded credentials are not allowed',
        };
      }

      // Check domain against blacklist
      if (this.blockedDomains.includes(url.hostname.toLowerCase())) {
        return {
          valid: false,
          reason: `Domain is blocked: ${url.hostname}`,
        };
      }

      // If whitelist is configured, check against it
      if (this.allowedDomains.length > 0) {
        const domainAllowed = this.allowedDomains.some(allowed => 
          url.hostname.toLowerCase().endsWith(allowed.toLowerCase())
        );

        if (!domainAllowed) {
          return {
            valid: false,
            reason: `Domain not in whitelist: ${url.hostname}`,
          };
        }
      }

      // Resolve hostname to IP and check against blocked ranges
      const ipValidation = await this.validateHostnameIP(url.hostname);
      if (!ipValidation.valid) {
        return ipValidation;
      }

      return {
        valid: true,
        url: url.toString(),
      };
    } catch (error) {
      logger.error('URL validation error:', error);
      return {
        valid: false,
        reason: `Invalid URL: ${error.message}`,
      };
    }
  }

  /**
   * Validate hostname by resolving to IP and checking against blocked ranges
   * @private
   */
  async validateHostnameIP(hostname) {
    try {
      // Try to resolve hostname
      let addresses;
      try {
        addresses = await dns.resolve4(hostname);
      } catch (v4Error) {
        try {
          addresses = await dns.resolve6(hostname);
        } catch (v6Error) {
          return {
            valid: false,
            reason: `Cannot resolve hostname: ${hostname}`,
          };
        }
      }

      // Check each resolved IP against blocked ranges
      for (const ip of addresses) {
        if (this.isIPBlocked(ip)) {
          return {
            valid: false,
            reason: `Hostname resolves to blocked IP: ${ip}`,
          };
        }
      }

      return { valid: true };
    } catch (error) {
      logger.error('Hostname validation error:', error);
      return {
        valid: false,
        reason: `Hostname validation failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if an IP is in blocked ranges
   * @private
   */
  isIPBlocked(ip) {
    // Check if IP is private or in blocked range
    if (net.isIPv4(ip)) {
      return this.isIPv4Blocked(ip);
    } else if (net.isIPv6(ip)) {
      return this.isIPv6Blocked(ip);
    }
    return true; // Block if we can't determine IP version
  }

  /**
   * Check if IPv4 address is blocked
   * @private
   */
  isIPv4Blocked(ip) {
    const ipNum = this.ipv4ToNumber(ip);

    for (const range of this.blockedIPRanges) {
      if (!net.isIPv4(range.start)) continue;

      const startNum = this.ipv4ToNumber(range.start);
      const endNum = this.ipv4ToNumber(range.end);

      if (ipNum >= startNum && ipNum <= endNum) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if IPv6 address is blocked
   * @private
   */
  isIPv6Blocked(ip) {
    // For now, block localhost and link-local
    if (ip === '::1' || ip.startsWith('fe80:')) {
      return true;
    }
    return false;
  }

  /**
   * Convert IPv4 address to number for range comparison
   * @private
   */
  ipv4ToNumber(ip) {
    const parts = ip.split('.').map(Number);
    return (
      (parts[0] << 24) |
      (parts[1] << 16) |
      (parts[2] << 8) |
      parts[3]
    ) >>> 0;
  }

  /**
   * Safe HTTP request with SSRF protection
   * @param {string} url - URL to request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async safeRequest(url, options = {}) {
    // Validate URL first
    const validation = await this.validateURL(url);
    if (!validation.valid) {
      throw new Error(`SSRF Protection: ${validation.reason}`);
    }

    // Import axios for HTTP requests
    const axios = (await import('axios')).default;

    // Configure safe request options
    const safeOptions = {
      ...options,
      timeout: this.requestTimeout,
      maxRedirects: this.maxRedirects,
      validateStatus: () => true, // Don't throw on error status
    };

    try {
      const response = await axios(validation.url, safeOptions);
      return response;
    } catch (error) {
      logger.error('Safe request failed:', error);
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Middleware to protect webhook endpoints from SSRF
   */
  webhookProtection() {
    return async (req, res, next) => {
      try {
        // Check if request body contains URL fields
        const urlFields = ['url', 'webhook_url', 'callback_url', 'endpoint'];
        
        for (const field of urlFields) {
          if (req.body && req.body[field]) {
            const validation = await this.validateURL(req.body[field]);
            
            if (!validation.valid) {
              return res.status(400).json({
                error: 'Invalid URL',
                reason: validation.reason,
              });
            }
          }
        }

        next();
      } catch (error) {
        logger.error('Webhook protection error:', error);
        res.status(500).json({
          error: 'URL validation failed',
        });
      }
    };
  }
}

// Export singleton instance
export default new SSRFProtection();
