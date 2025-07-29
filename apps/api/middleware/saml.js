// nova-api/middleware/saml.js
// SAML/SSO Authentication Middleware
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import passport from 'passport';
import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Configure SAML Strategy for Nova Helix Identity Engine
 */
export function configureSAML() {
  // Only configure SAML if environment variables are set
  if (!process.env.SAML_ENTRY_POINT || !process.env.SAML_ISSUER) {
    logger.info('SAML configuration skipped - environment variables not set');
    return;
  }

  const samlConfig = {
    entryPoint: process.env.SAML_ENTRY_POINT,
    issuer: process.env.SAML_ISSUER,
    callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3000/api/v1/helix/sso/callback',
    cert: process.env.SAML_CERT,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    acceptedClockSkewMs: 5000,
    attributeConsumingServiceIndex: '1',
    authnContext: ['urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport'],
    forceAuthn: false,
    skipRequestCompression: true,
    disableRequestedAuthnContext: false,
    // Additional security options
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
    signatureAlgorithm: 'sha256',
    digestAlgorithm: 'sha256'
  };

  passport.use('saml', new SamlStrategy(
    samlConfig,
    async (profile, done) => {
      try {
        logger.info('SAML authentication profile received', { 
          nameID: profile.nameID,
          email: profile.email || profile.nameID 
        });

        // Extract user information from SAML profile
        const email = profile.email || profile.nameID;
        const name = profile.displayName || profile.name || profile.firstName + ' ' + profile.lastName || email;
        const department = profile.department || null;
        const title = profile.title || null;

        // Check if user exists in database
        db.get('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email], async (err, existingUser) => {
          if (err) {
            logger.error('Database error during SAML authentication:', err);
            return done(err);
          }

          let user;
          if (existingUser) {
            // Update existing user
            const updateQuery = `
              UPDATE users 
              SET name = ?, department = ?, title = ?, last_login_at = ?, updated_at = ?
              WHERE email = ?
            `;
            
            db.run(updateQuery, [
              name,
              department,
              title,
              new Date().toISOString(),
              new Date().toISOString(),
              email
            ], function(updateErr) {
              if (updateErr) {
                logger.error('Error updating user during SAML login:', updateErr);
                return done(updateErr);
              }

              // Get updated user with roles
              getUserWithRoles(email, (getUserErr, userWithRoles) => {
                if (getUserErr) return done(getUserErr);
                
                // Log successful authentication
                logAuthenticationEvent(userWithRoles.id, 'SAML_LOGIN', true);
                
                return done(null, userWithRoles);
              });
            });
          } else {
            // Create new user with default role
            const userId = require('uuid').v4();
            const now = new Date().toISOString();
            
            const insertQuery = `
              INSERT INTO users (
                id, email, name, department, title, auth_method, 
                last_login_at, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(insertQuery, [
              userId,
              email,
              name,
              department,
              title,
              'saml',
              now,
              now,
              now
            ], function(insertErr) {
              if (insertErr) {
                logger.error('Error creating user during SAML login:', insertErr);
                return done(insertErr);
              }

              // Assign default role (e.g., 'user')
              assignDefaultRole(userId, (roleErr) => {
                if (roleErr) {
                  logger.warn('Error assigning default role to new SAML user:', roleErr);
                }

                // Get newly created user with roles
                getUserWithRoles(email, (getUserErr, userWithRoles) => {
                  if (getUserErr) return done(getUserErr);
                  
                  // Log successful authentication
                  logAuthenticationEvent(userWithRoles.id, 'SAML_FIRST_LOGIN', true);
                  
                  logger.info('New user created via SAML authentication', { 
                    userId: userWithRoles.id, 
                    email: userWithRoles.email 
                  });
                  
                  return done(null, userWithRoles);
                });
              });
            });
          }
        });
      } catch (error) {
        logger.error('Error in SAML authentication strategy:', error);
        return done(error);
      }
    }
  ));

  logger.info('SAML strategy configured successfully');
}

/**
 * Configure OIDC settings
 */
export function configureOIDC() {
  if (!process.env.OIDC_ISSUER) {
    logger.info('OIDC configuration skipped - environment variables not set');
    return;
  }
  // Placeholder for real passport-oidc strategy
  logger.info('OIDC provider configured', { issuer: process.env.OIDC_ISSUER });
}

/**
 * Get user with their roles from database
 */
function getUserWithRoles(email, callback) {
  const query = `
    SELECT u.*, 
           GROUP_CONCAT(r.name) as roles,
           GROUP_CONCAT(r.id) as role_ids
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email = ? AND u.deleted_at IS NULL
    GROUP BY u.id
  `;

  db.get(query, [email], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error('User not found'));

    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      department: row.department,
      title: row.title,
      authMethod: row.auth_method,
      roles: row.roles ? row.roles.split(',') : [],
      roleIds: row.role_ids ? row.role_ids.split(',') : [],
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    callback(null, user);
  });
}

/**
 * Assign default role to a new user
 */
function assignDefaultRole(userId, callback) {
  // Get default role (usually 'user' or 'employee')
  db.get('SELECT id FROM roles WHERE name = ? OR "isDefault" = 1 LIMIT 1', ['user'], (err, role) => {
    if (err || !role) {
      return callback(err || new Error('Default role not found'));
    }

    const userRoleId = require('uuid').v4();
    db.run(
      'INSERT INTO user_roles (id, user_id, role_id, assigned_at, assigned_by_id) VALUES (?, ?, ?, ?, ?)',
      [userRoleId, userId, role.id, new Date().toISOString(), null],
      callback
    );
  });
}

/**
 * Log authentication events for audit trail
 */
function logAuthenticationEvent(userId, action, success, details = null) {
  const logId = require('uuid').v4();
  const logEntry = {
    id: logId,
    user_id: userId,
    action: action,
    success: success ? 1 : 0,
    ip_address: null, // Will be set by calling function
    user_agent: null, // Will be set by calling function
    details: details ? JSON.stringify(details) : null,
    timestamp: new Date().toISOString()
  };

  db.run(
    'INSERT INTO auth_logs (id, user_id, action, success, ip_address, user_agent, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [logEntry.id, logEntry.user_id, logEntry.action, logEntry.success, logEntry.ip_address, logEntry.user_agent, logEntry.details, logEntry.timestamp],
    (err) => {
      if (err) {
        logger.error('Error logging authentication event:', err);
      }
    }
  );
}

/**
 * SAML authentication middleware
 */
export const authenticateSAML = passport.authenticate('saml', {
  session: false,
  failureRedirect: '/login?error=saml_failed'
});

/**
 * Generate SAML metadata for IdP configuration
 */
export function generateSAMLMetadata() {
  if (!process.env.SAML_ISSUER) {
    throw new Error('SAML_ISSUER environment variable required for metadata generation');
  }

  const callbackUrl = process.env.SAML_CALLBACK_URL || 'http://localhost:3000/api/v1/helix/sso/callback';
  const issuer = process.env.SAML_ISSUER;

  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" 
                     xmlns:ds="http://www.w3.org/2000/09/xmldsig#" 
                     entityID="${issuer}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
                      AuthnRequestsSigned="false" 
                      WantAssertionsSigned="true">
    <md:KeyDescriptor use="signing">
      <!-- Certificate will be added here in production -->
    </md:KeyDescriptor>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                 Location="${callbackUrl}"
                                 index="1"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
}

export function generateOIDCMetadata() {
  if (!process.env.OIDC_ISSUER) {
    throw new Error('OIDC_ISSUER environment variable required');
  }
  return {
    issuer: process.env.OIDC_ISSUER,
    authorization_endpoint: process.env.OIDC_AUTH_ENDPOINT,
    token_endpoint: process.env.OIDC_TOKEN_ENDPOINT,
    userinfo_endpoint: process.env.OIDC_USERINFO_ENDPOINT
  };
}

export default {
  configureSAML,
  configureOIDC,
  authenticateSAML,
  generateSAMLMetadata,
  generateOIDCMetadata,
  logAuthenticationEvent
};
