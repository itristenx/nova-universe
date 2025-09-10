// nova-api/middleware/saml.js
// Enhanced SAML/SSO Authentication Middleware with Security Best Practices
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import passport from 'passport';
import crypto from 'crypto';
import db from '../db.js';
import { logger } from '../logger.js';
import { sign as signJwt } from '../jwt.js';

// SAML session store for security
const samlSessions = new Map();

/**
 * Enhanced SAML Strategy Configuration with Security Best Practices
 */
export function configureSAML() {
  // Only configure SAML if environment variables are set
  if (!process.env.SAML_ENTRY_POINT || !process.env.SAML_ISSUER) {
    logger.info('SAML configuration skipped - environment variables not set');
    return;
  }

  // Validate required SAML configuration
  const requiredConfig = ['SAML_ENTRY_POINT', 'SAML_ISSUER', 'SAML_CERT'];
  const missingConfig = requiredConfig.filter(key => !process.env[key]);
  
  if (missingConfig.length > 0) {
    logger.error('SAML configuration incomplete', { missing: missingConfig });
    throw new Error(`Missing SAML configuration: ${missingConfig.join(', ')}`);
  }

  const samlConfig = {
    // Core SAML settings
    entryPoint: process.env.SAML_ENTRY_POINT,
    issuer: process.env.SAML_ISSUER,
    callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/saml/callback',
    cert: process.env.SAML_CERT,
    
    // Security settings following industry standards
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
    acceptedClockSkewMs: 5000, // 5 seconds tolerance
    attributeConsumingServiceIndex: '1',
    authnContext: [
      'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
      'urn:oasis:names:tc:SAML:2.0:ac:classes:Password'
    ],
    forceAuthn: false,
    skipRequestCompression: true,
    disableRequestedAuthnContext: false,
    
    // Enhanced security options
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true,
    signatureAlgorithm: 'sha256',
    digestAlgorithm: 'sha256',
    validateInResponseTo: true,
    requestIdExpirationPeriodMs: 3600000, // 1 hour
    maxAssertionAgeMs: 3600000, // 1 hour
    
    // Additional security headers
    additionalParams: {},
    additionalAuthorizeParams: {},
    
    // Logout settings
    logoutUrl: process.env.SAML_LOGOUT_URL,
    logoutCallbackUrl: process.env.SAML_LOGOUT_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/saml/logout/callback',
  };

  passport.use(
    'saml',
    new SamlStrategy(samlConfig, async (profile, done) => {
      try {
        // Enhanced profile validation
        if (!profile || !profile.nameID) {
          logger.warn('SAML authentication failed - invalid profile', { profile });
          return done(new Error('Invalid SAML profile'));
        }

        logger.info('SAML authentication profile received', {
          nameID: profile.nameID,
          sessionIndex: profile.sessionIndex,
          attributes: Object.keys(profile).filter(key => key !== 'nameID'),
        });

        // Extract and validate user information from SAML profile
        const email = profile.email || profile.nameID;
        const firstName = profile.firstName || profile.givenName || profile.first_name || '';
        const lastName = profile.lastName || profile.surname || profile.last_name || '';
        const displayName = profile.displayName || profile.name || `${firstName} ${lastName}`.trim() || email;
        const department = profile.department || null;
        const title = profile.title || profile.jobTitle || null;
        const phone = profile.phone || profile.phoneNumber || null;
        const employeeId = profile.employeeId || profile.employee_id || null;

        // Validate email format
        if (!email || !email.includes('@')) {
          logger.error('SAML authentication failed - invalid email', { email, nameID: profile.nameID });
          return done(new Error('Invalid email in SAML profile'));
        }

        // Check for user in database with comprehensive error handling
        try {
          const existingUser = await db.query(
            'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
          );

          let user = existingUser.rows && existingUser.rows.length > 0 ? existingUser.rows[0] : null;

          if (user) {
            // Update existing user with SAML data
            logger.info('Updating existing user from SAML', {
              userId: user.id,
              email: user.email,
            });

            try {
              const updatedUser = await db.query(
                `UPDATE users 
                 SET name = $1, department = $2, title = $3, phone = $4, employee_id = $5, 
                     last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP, 
                     auth_method = 'saml', failed_login_attempts = 0
                 WHERE email = $6 AND deleted_at IS NULL
                 RETURNING id, name, email, department, title, phone, employee_id, created_at, updated_at, last_login_at`,
                [displayName, department, title, phone, employeeId, email]
              );

              user = updatedUser.rows[0];
            } catch (updateErr) {
              logger.error('Error updating user during SAML login', { error: updateErr.message, email });
              return done(updateErr);
            }
          } else {
            // Create new user with SAML data
            logger.info('Creating new user from SAML', { email, displayName });

            try {
              const newUser = await db.query(
                `INSERT INTO users (
                   name, email, department, title, phone, employee_id, auth_method, 
                   last_login_at, created_at, updated_at, disabled
                 ) VALUES ($1, $2, $3, $4, $5, $6, 'saml', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE)
                 RETURNING id, name, email, department, title, phone, employee_id, created_at, updated_at, last_login_at`,
                [displayName, email, department, title, phone, employeeId]
              );

              user = newUser.rows[0];
              
              // TODO: Assign default role to new SAML users
              // await assignDefaultRole(user.id, 'user');
              
            } catch (insertErr) {
              logger.error('Error creating user during SAML login', { error: insertErr.message, email });
              return done(insertErr);
            }
          }

          // Store SAML session data for logout
          if (profile.sessionIndex) {
            samlSessions.set(profile.sessionIndex, {
              userId: user.id,
              email: user.email,
              createdAt: Date.now(),
            });
          }

          // Log successful authentication
          logger.info('SAML authentication successful', {
            userId: user.id,
            email: user.email,
            department: user.department,
            sessionIndex: profile.sessionIndex,
            timestamp: new Date().toISOString(),
          });

          // Return user with roles (TODO: fetch actual roles from database)
          const userWithRoles = {
            ...user,
            roles: ['user'], // Default role, should be fetched from database
            permissions: [], // Should be fetched based on roles
            authMethod: 'saml',
            sessionIndex: profile.sessionIndex,
          };

          return done(null, userWithRoles);
        } catch (dbErr) {
          logger.error('Database error during SAML authentication', { 
            error: dbErr.message, 
            email,
            stack: dbErr.stack,
          });
          return done(dbErr);
        }
      } catch (error) {
        logger.error('SAML authentication error', { 
          error: error.message, 
          profile: profile ? { nameID: profile.nameID } : null,
          stack: error.stack,
        });
        return done(error);
      }
    })
  );

  logger.info('SAML strategy configured successfully', {
    entryPoint: process.env.SAML_ENTRY_POINT,
    issuer: process.env.SAML_ISSUER,
    callbackUrl: samlConfig.callbackUrl,
  });
}

/**
 * SAML Login Route Handler
 */
export function handleSamlLogin(req, res, next) {
  // Generate and store request ID for security
  const requestId = crypto.randomUUID();
  req.samlRequestId = requestId;
  
  logger.info('SAML login initiated', {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  passport.authenticate('saml', {
    additionalParams: { RequestID: requestId },
  })(req, res, next);
}

/**
 * SAML Callback Route Handler
 */
export function handleSamlCallback(req, res, next) {
  passport.authenticate('saml', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('SAML callback authentication error', { 
        error: err.message,
        info,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.redirect('/login?error=saml_auth_failed');
    }

    if (!user) {
      logger.warn('SAML callback - no user returned', { 
        info,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.redirect('/login?error=saml_no_user');
    }

    try {
      // Generate JWT token for the authenticated user
      const token = signJwt({
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles || ['user'],
        authMethod: 'saml',
        sessionIndex: user.sessionIndex,
      });

      // Log successful SAML authentication
      logger.info('SAML authentication completed successfully', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        sessionIndex: user.sessionIndex,
        timestamp: new Date().toISOString(),
      });

      // Redirect to frontend with token (in production, use secure cookie)
      const redirectUrl = process.env.SAML_SUCCESS_REDIRECT || '/dashboard';
      return res.redirect(`${redirectUrl}?token=${token}`);
    } catch (tokenErr) {
      logger.error('Error generating JWT token after SAML auth', { 
        error: tokenErr.message,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
      return res.redirect('/login?error=token_generation_failed');
    }
  })(req, res, next);
}

/**
 * SAML Logout Route Handler
 */
export function handleSamlLogout(req, res, next) {
  const sessionIndex = req.user?.sessionIndex;
  
  if (sessionIndex) {
    samlSessions.delete(sessionIndex);
  }

  logger.info('SAML logout initiated', {
    userId: req.user?.id,
    sessionIndex,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Use SAML single logout if available
  passport.authenticate('saml', {
    samlFallback: 'logout-request',
  })(req, res, next);
}

/**
 * Cleanup expired SAML sessions
 */
export function cleanupSamlSessions() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [sessionIndex, session] of samlSessions.entries()) {
    if (session.createdAt < oneHourAgo) {
      samlSessions.delete(sessionIndex);
    }
  }
  
  logger.info('SAML session cleanup completed', {
    remainingSessions: samlSessions.size,
    timestamp: new Date().toISOString(),
  });
}

// Set up periodic cleanup
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupSamlSessions, 60 * 60 * 1000); // Every hour
}

                    // Log successful authentication
                    logAuthenticationEvent(userWithRoles.id, 'SAML_LOGIN', true);

                    return done(null, userWithRoles);
                  });
                },
              );
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

              db.run(
                insertQuery,
                [userId, email, name, department, title, 'saml', now, now, now],
                function (insertErr) {
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
                        email: userWithRoles.email,
                      });

                      return done(null, userWithRoles);
                    });
                  });
                },
              );
            }
          },
        );
      } catch (error) {
        logger.error('Error in SAML authentication strategy:', error);
        return done(error);
      }
    }),
  );

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
}

// Implement minimal SAML strategy wiring using @node-saml/passport-saml if configured
export function configureSAMLSecondary(app) {
  if (!process.env.SAML_ENTRY_POINT || !process.env.SAML_ISSUER || !process.env.SAML_CALLBACK_URL) {
    return; // Not configured
  }

  const strategy = new SamlStrategy(
    {
      entryPoint: process.env.SAML_ENTRY_POINT,
      issuer: process.env.SAML_ISSUER,
      callbackUrl: process.env.SAML_CALLBACK_URL,
      cert: process.env.SAML_CERT || undefined,
      identifierFormat: null,
      disableRequestedAuthnContext: true,
    },
    (profile, done) => {
      const user = {
        id: profile.nameID,
        email:
          profile.email ||
          profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        name: profile.displayName || profile.cn || profile.commonName || profile.nameID,
      };
      done(null, user);
    },
  );

  passport.use('saml', strategy);
  app.use(passport.initialize());
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
      updatedAt: row.updated_at,
    };

    callback(null, user);
  });
}

/**
 * Assign default role to a new user
 */
function assignDefaultRole(userId, callback) {
  // Get default role (usually 'user' or 'employee')
  db.get(
    'SELECT id FROM roles WHERE name = ? OR "isDefault" = 1 LIMIT 1',
    ['user'],
    (err, role) => {
      if (err || !role) {
        return callback(err || new Error('Default role not found'));
      }

      const userRoleId = require('uuid').v4();
      db.run(
        'INSERT INTO user_roles (id, user_id, role_id, assigned_at, assigned_by_id) VALUES (?, ?, ?, ?, ?)',
        [userRoleId, userId, role.id, new Date().toISOString(), null],
        callback,
      );
    },
  );
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
    timestamp: new Date().toISOString(),
  };

  db.run(
    'INSERT INTO auth_logs (id, user_id, action, success, ip_address, user_agent, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      logEntry.id,
      logEntry.user_id,
      logEntry.action,
      logEntry.success,
      logEntry.ip_address,
      logEntry.user_agent,
      logEntry.details,
      logEntry.timestamp,
    ],
    (err) => {
      if (err) {
        logger.error('Error logging authentication event:', err);
      }
    },
  );
}

/**
 * SAML authentication middleware
 */
export const authenticateSAML = passport.authenticate('saml', {
  session: false,
  failureRedirect: '/login?error=saml_failed',
});

/**
 * Generate SAML metadata for IdP configuration
 */
export function generateSAMLMetadata() {
  if (!process.env.SAML_ISSUER) {
    throw new Error('SAML_ISSUER environment variable required for metadata generation');
  }

  const callbackUrl =
    process.env.SAML_CALLBACK_URL || 'http://localhost:3000/api/v1/helix/sso/callback';
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
    userinfo_endpoint: process.env.OIDC_USERINFO_ENDPOINT,
  };
}

export default {
  configureSAML,
  configureOIDC,
  authenticateSAML,
  generateSAMLMetadata,
  generateOIDCMetadata,
  logAuthenticationEvent,
};
