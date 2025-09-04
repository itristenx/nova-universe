// db.js - Consolidated database layer with PostgreSQL/MongoDB support
// (merged from the former db.js and db-new.js implementations)

// Configure environment variables before importing database config
import dotenv from 'dotenv';
dotenv.config();

import { logger } from './logger.js';
import { DatabaseFactory } from './database/factory.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath, pathToFileURL } from 'url';
import { v4 as uuidv4 } from 'uuid';
// Attempt to load Prisma client if available inside the container
let PrismaClient;
// Try multiple potential locations for the generated Prisma client to support
// both local dev (repo layout) and containerized builds (flattened /app layout).
const prismaCandidates = [
  '../../prisma/generated/core/index.js',
  '../prisma/generated/core/index.js',
  './prisma/generated/core/index.js',
  '/app/prisma/generated/core/index.js',
];
for (const spec of prismaCandidates) {
  try {
    const url = spec.startsWith('/')
      ? pathToFileURL(spec).href
      : new URL(spec, import.meta.url).href;
    ({ PrismaClient } = await import(url));
    break;
  } catch {}
}
if (!PrismaClient) {
  // In minimal/demo containers the generated client may not be present
  logger?.warn?.(
    'Prisma client not found; continuing without Prisma. Some features may be unavailable.',
  );
}

// Keep filename for potential future use
const __filename = fileURLToPath(import.meta.url);

// Log the current file being executed for debugging purposes
if (process.env.DB_VERBOSE_LOGGING === 'true') {
  logger.debug(`Database module loaded from: ${__filename}`);
}

// Initialize database factory
const dbFactory = new DatabaseFactory();
let db = null;
let isInitialized = false;

// Initialize Prisma client
const prisma = PrismaClient ? new PrismaClient() : null;

/**
 * Initialize the database factory and set up schemas
 */
async function initializeDatabase() {
  if (isInitialized) return db;
  try {
    const verboseLogging =
      process.env.DB_VERBOSE_LOGGING === 'true' || process.env.NODE_ENV === 'production';

    if (verboseLogging) {
      logger.info('Initializing database factory...');
    }
    await dbFactory.initialize();
    db = dbFactory;
    await setupSchemas();
    await setupInitialData();
    isInitialized = true;

    if (verboseLogging) {
      logger.info('Database factory initialized successfully');
    }
    return db;
  } catch (error) {
    logger.error('Failed to initialize database factory:', error);
    throw error;
  }
}

/**
 * Set up database schemas
 */
async function setupSchemas() {
  try {
    // Create required extensions (safe if already installed)
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    } catch (e) {
      logger.warn('Could not ensure pgcrypto extension (ok if not needed): ' + e.message);
    }

    // Ensure core tables and columns used by API exist
    // Tickets: add columns if missing and a unique index on ticket_id
    await db.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        ticket_id TEXT,
        legacy_ticket_id TEXT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'medium',
        type_code VARCHAR(10),
        urgency VARCHAR(50),
        impact VARCHAR(50),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        location VARCHAR(255),
        contact_method VARCHAR(50),
        contact_info VARCHAR(255),
        requested_by_id TEXT,
        assigned_to_id TEXT,
        due_date TIMESTAMP NULL,
        estimated_time_minutes INT,
        actual_time_minutes INT,
        resolution TEXT,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        vip_priority_score INT,
        vip_trigger_source VARCHAR(50)
      );
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_id TEXT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS legacy_ticket_id TEXT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS type_code VARCHAR(10);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS urgency VARCHAR(50);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS impact VARCHAR(50);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS location VARCHAR(255);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contact_method VARCHAR(50);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contact_info VARCHAR(255);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS requested_by_id TEXT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to_id TEXT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS due_date TIMESTAMP NULL;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS estimated_time_minutes INT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS actual_time_minutes INT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution TEXT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS vip_priority_score INT;
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS vip_trigger_source VARCHAR(50);
      CREATE UNIQUE INDEX IF NOT EXISTS ux_tickets_ticket_id ON tickets(ticket_id);
    `);

    // Users and RBAC tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uuid TEXT UNIQUE,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT,
        disabled BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id)
      );
      ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Config key-value store
    await db.query(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT,
        value_type TEXT DEFAULT 'string',
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Kiosks
    await db.query(`
      CREATE TABLE IF NOT EXISTS kiosks (
        id TEXT PRIMARY KEY,
        last_seen TIMESTAMP,
        version TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logoUrl TEXT,
        bgUrl TEXT,
        active BOOLEAN DEFAULT FALSE,
        activated_at TIMESTAMP NULL,
        room_name TEXT,
        current_status TEXT,
        last_status_update TIMESTAMP NULL
      );
    `);

    // Notifications
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        level VARCHAR(20) DEFAULT 'info',
        type VARCHAR(50) DEFAULT 'system',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT TRUE
      );
      CREATE INDEX IF NOT EXISTS ix_notifications_created_at ON notifications(created_at DESC);
    `);

    // Feedback
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name TEXT,
        message TEXT NOT NULL,
        user_id TEXT,
        feedback_type TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Directory integrations
    await db.query(`
      CREATE TABLE IF NOT EXISTS directory_integrations (
        id SERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // SSO and SCIM configurations
    await db.query(`
      CREATE TABLE IF NOT EXISTS sso_configurations (
        id INTEGER PRIMARY KEY,
        enabled BOOLEAN DEFAULT FALSE,
        provider TEXT,
        configuration JSONB
      );
      CREATE TABLE IF NOT EXISTS scim_configurations (
        id INTEGER PRIMARY KEY,
        enabled BOOLEAN DEFAULT FALSE,
        bearer_token TEXT,
        endpoint_url TEXT,
        auto_provisioning BOOLEAN DEFAULT TRUE,
        auto_deprovisioning BOOLEAN DEFAULT FALSE,
        sync_interval INTEGER DEFAULT 3600,
        last_sync TIMESTAMP NULL
      );
    `);

    // System logs for cleanup
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        level TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS ix_system_logs_created_at ON system_logs(created_at);
    `);

    // Ticket sequences for type-based IDs
    await db.query(`
      CREATE TABLE IF NOT EXISTS ticket_sequences (
        type_code VARCHAR(10) PRIMARY KEY,
        last_value INT NOT NULL DEFAULT 0
      );
    `);

    // SLA policies and breaches
    await db.query(`
      CREATE TABLE IF NOT EXISTS sla_policies (
        id SERIAL PRIMARY KEY,
        type_code VARCHAR(10) NOT NULL,
        urgency VARCHAR(50) NOT NULL,
        impact VARCHAR(50) NOT NULL,
        response_minutes INT NOT NULL,
        resolution_minutes INT NOT NULL,
        UNIQUE (type_code, urgency, impact)
      );
      CREATE TABLE IF NOT EXISTS sla_breaches (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        breach_type VARCHAR(50) NOT NULL,
        breach_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Logs and attachments used by API
    await db.query(`
      CREATE TABLE IF NOT EXISTS ticket_logs (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        user_id TEXT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS ticket_attachments (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT,
        uploaded_by_id TEXT,
        uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        user_id TEXT,
        ticket_id TEXT,
        details TEXT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Optional tables used by Pulse features (idempotent creation)
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_availability (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        queue_name TEXT NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        status TEXT DEFAULT 'active',
        max_capacity INT DEFAULT 10,
        current_load INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, queue_name)
      );
      CREATE TABLE IF NOT EXISTS queue_metrics (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        queue_name TEXT UNIQUE NOT NULL,
        total_agents INT DEFAULT 0,
        available_agents INT DEFAULT 0,
        total_tickets INT DEFAULT 0,
        open_tickets INT DEFAULT 0,
        avg_resolution_time FLOAT DEFAULT 0,
        high_priority_tickets INT DEFAULT 0,
        capacity_utilization FLOAT DEFAULT 0,
        threshold_warning BOOLEAN DEFAULT FALSE,
        threshold_critical BOOLEAN DEFAULT FALSE,
        last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS queue_alerts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        queue_name TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        alerted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        notified_users TEXT[] DEFAULT ARRAY[]::TEXT[]
      );
    `);

    // Request catalog + RITM tables used by Orbit catalog endpoints
    await db.query(`
      CREATE TABLE IF NOT EXISTS request_catalog_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        form_schema JSON,
        workflow_id TEXT
      );
      CREATE TABLE IF NOT EXISTS ritms (
        id SERIAL PRIMARY KEY,
        req_id TEXT,
        catalog_item_id INT REFERENCES request_catalog_items(id),
        status VARCHAR(20) DEFAULT 'open'
      );
      
      -- Assets table for file storage management
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        url TEXT,
        file_key TEXT,
        storage_type VARCHAR(50) DEFAULT 'local',
        file_size INTEGER,
        content_type VARCHAR(255),
        uploaded_by_id TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const verboseLogging =
      process.env.DB_VERBOSE_LOGGING === 'true' || process.env.NODE_ENV === 'production';
    if (verboseLogging) {
      logger.info('Database schemas verified and updated');
    }
  } catch (error) {
    // Only log schema errors in debug mode when DB is unavailable
    if (error.message.includes('Database factory not initialized')) {
      if (process.env.DEBUG_DB_SCHEMAS === 'true') {
        logger.error('Error setting up schemas:', error);
      }
    } else {
      logger.error('Error setting up schemas:', error);
    }
    throw error;
  }
}

/**
 * Set up initial data
 */
async function setupInitialData() {
  try {
    const verboseLogging =
      process.env.DB_VERBOSE_LOGGING === 'true' || process.env.NODE_ENV === 'production';

    await setupRolesAndPermissions();
    await ensureAuthMultiTenantSchemaAndSeed();
    await setupDefaultConfig();
    await setupDefaultAdmin();
    await setupDefaultSlaPolicies();
    // Ensure minimum admin role/user linkage
    try {
      await db.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_at)
                      SELECT u.id, 1, CURRENT_TIMESTAMP FROM users u
                      LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role_id = 1
                      WHERE u.email = $1 AND ur.user_id IS NULL`,
        ['admin@novauniverse.com'],
      );
    } catch {
      // Ignore if admin user already exists
    }

    if (verboseLogging) {
      logger.info('Initial data setup completed');
    }
  } catch (error) {
    logger.error('Error setting up initial data:', error);
    throw error;
  }
}

/**
 * Ensure universal login multi-tenant auth schema exists and seed Nova Inc tenant
 */
async function ensureAuthMultiTenantSchemaAndSeed() {
  try {
    // Create tenants table (idempotent)
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE NOT NULL,
        subdomain VARCHAR(100) UNIQUE,
        logo_url TEXT,
        theme_color VARCHAR(7) DEFAULT '#000000',
        background_image_url TEXT,
        custom_css TEXT,
        login_message TEXT,
        terms_url TEXT,
        privacy_url TEXT,
        support_email VARCHAR(255),
        sso_enabled BOOLEAN DEFAULT false,
        mfa_required BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure users.tenant_id exists
    try {
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID`);
    } catch (e) {
      logger.warn('Could not ensure users.tenant_id column: ' + e.message);
    }

    // Create SSO configs table (idempotent)
    await db.query(`
      CREATE TABLE IF NOT EXISTS sso_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_name VARCHAR(100) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        saml_entity_id TEXT,
        saml_sso_url TEXT,
        saml_slo_url TEXT,
        saml_certificate TEXT,
        saml_name_id_format VARCHAR(100),
        oidc_issuer TEXT,
        oidc_client_id TEXT,
        oidc_client_secret_encrypted TEXT,
        oidc_authorization_url TEXT,
        oidc_token_url TEXT,
        oidc_userinfo_url TEXT,
        oidc_jwks_uri TEXT,
        oidc_scopes TEXT DEFAULT 'openid profile email',
        attribute_mappings JSONB,
        auto_provision BOOLEAN DEFAULT false,
        default_role_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, provider)
      );
    `);

    // Create auth_states table for SSO state tracking
    await db.query(`
      CREATE TABLE IF NOT EXISTS auth_states (
        state VARCHAR(255) PRIMARY KEY,
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        redirect_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
      );
    `);

    // Password reset tokens for local account recovery
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
    `);

    // Seed Nova Inc tenant if missing
    const novaName = process.env.NOVA_TENANT_NAME || 'Nova Inc';
    const novaDomain = process.env.NOVA_TENANT_DOMAIN || 'nova-universe.com';
    const novaSubdomain = process.env.NOVA_TENANT_SUBDOMAIN || 'nova';
    const novaTheme = process.env.NOVA_TENANT_THEME || '#1f2937';
    const novaSupport = process.env.NOVA_TENANT_SUPPORT_EMAIL || 'support@nova-universe.com';
    const novaSsoEnabled = (process.env.NOVA_TENANT_SSO_ENABLED || 'false') === 'true';
    const novaMfaRequired = (process.env.NOVA_TENANT_MFA_REQUIRED || 'false') === 'true';

    const existing = await db.query('SELECT id FROM tenants WHERE domain = $1', [novaDomain]);
    let novaTenantId = existing.rows?.[0]?.id;

    if (!novaTenantId) {
      const inserted = await db.query(
        `INSERT INTO tenants (name, domain, subdomain, theme_color, support_email, sso_enabled, mfa_required, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true)
         ON CONFLICT (domain) DO UPDATE SET 
           name = EXCLUDED.name,
           subdomain = EXCLUDED.subdomain,
           theme_color = EXCLUDED.theme_color,
           support_email = EXCLUDED.support_email,
           sso_enabled = EXCLUDED.sso_enabled,
           mfa_required = EXCLUDED.mfa_required,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [novaName, novaDomain, novaSubdomain, novaTheme, novaSupport, novaSsoEnabled, novaMfaRequired],
      );
      novaTenantId = inserted.rows[0].id;
      logger.info(`Seeded tenant '${novaName}' (${novaDomain})`);
    }

    // Optionally seed SSO config for Nova tenant from environment (only if fully provided)
    try {
      const ssoProvider = process.env.NOVA_SSO_PROVIDER; // 'saml' or 'oidc'
      if (ssoProvider === 'saml') {
        const entry = process.env.NOVA_SAML_SSO_URL;
        const issuer = process.env.NOVA_SAML_ENTITY_ID;
        const cert = process.env.NOVA_SAML_CERT;
        if (entry && issuer && cert) {
          await db.query(
            `INSERT INTO sso_configs (
              tenant_id, provider, provider_name, enabled,
              saml_entity_id, saml_sso_url, saml_certificate
            ) VALUES ($1,$2,$3,true,$4,$5,$6)
            ON CONFLICT (tenant_id, provider) DO UPDATE SET 
              provider_name = EXCLUDED.provider_name,
              enabled = EXCLUDED.enabled,
              saml_entity_id = EXCLUDED.saml_entity_id,
              saml_sso_url = EXCLUDED.saml_sso_url,
              saml_certificate = EXCLUDED.saml_certificate,
              updated_at = CURRENT_TIMESTAMP`,
            [novaTenantId, 'saml', process.env.NOVA_SAML_PROVIDER_NAME || 'SAML', issuer, entry, cert],
          );
          logger.info('Seeded SAML SSO configuration for Nova tenant');
        }
      }
    } catch (e) {
      logger.warn('Failed to seed SSO config for Nova tenant: ' + e.message);
    }

    // Attach default admin to Nova tenant if admin exists without tenant
    try {
      await db.query(
        `UPDATE users SET tenant_id = $1 WHERE email = $2 AND (tenant_id IS NULL OR tenant_id <> $1)`,
        [novaTenantId, 'admin@novauniverse.com'],
      );
    } catch (e) {
      logger.warn('Could not associate admin to tenant (users table may differ): ' + e.message);
    }
  } catch (error) {
    logger.error('Failed ensuring multi-tenant auth schema/seed:', error);
  }
}

/**
 * Set up roles and permissions
 */
async function setupRolesAndPermissions() {
  try {
    // Ensure baseline tables exist (idempotent on clean DBs)
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        PRIMARY KEY (role_id, permission_id)
      );
    `);

    const roles = [
      { id: 1, name: 'superadmin', description: 'Super Administrator - Full System Access' },
      { id: 2, name: 'admin', description: 'Administrator - User Management Access' },
      { id: 3, name: 'user', description: 'Regular User - No Admin Access' },
    ];

    for (const role of roles) {
      await db.query(
        'INSERT INTO roles (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING',
        [role.id, role.name, role.description],
      );
    }

    const permissions = [
      { id: 1, name: 'manage_users' },
      { id: 2, name: 'manage_roles' },
      { id: 3, name: 'manage_permissions' },
      { id: 4, name: 'view_admin_panel' },
      { id: 5, name: 'manage_integrations' },
      { id: 6, name: 'view_audit_logs' },
    ];

    for (const permission of permissions) {
      await db.query(
        'INSERT INTO permissions (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [permission.id, permission.name],
      );
    }

    // Assign permissions to roles
    const rolePermissions = [
      { roleId: 1, permissionId: 1 },
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 },
      { roleId: 1, permissionId: 4 },
      { roleId: 1, permissionId: 5 },
      { roleId: 1, permissionId: 6 },
      { roleId: 2, permissionId: 1 },
      { roleId: 2, permissionId: 4 },
      { roleId: 2, permissionId: 6 },
    ];

    for (const rp of rolePermissions) {
      await db.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [rp.roleId, rp.permissionId],
      );
    }

    const verboseLogging =
      process.env.DB_VERBOSE_LOGGING === 'true' || process.env.NODE_ENV === 'production';
    if (verboseLogging) {
      logger.info('Roles and permissions setup completed');
    }
  } catch (error) {
    logger.error('Error setting up roles and permissions:', error);
    throw error;
  }
}

/**
 * Seed default SLA policies for common type/urgency/impact combinations
 */
async function setupDefaultSlaPolicies() {
  try {
    const combinations = [];
    const types = ['INC', 'REQ'];
    const urgencies = ['low', 'medium', 'high', 'critical'];
    const impacts = ['low', 'medium', 'high'];
    for (const t of types) {
      for (const u of urgencies) {
        for (const i of impacts) {
          // Simple baseline: response/resolution scale with urgency+impact
          const uScore = { low: 1, medium: 2, high: 3, critical: 4 }[u];
          const iScore = { low: 1, medium: 2, high: 3 }[i];
          const response = Math.max(5, 60 - uScore * 10 - iScore * 5); // minutes
          const resolution = Math.max(30, 8 * 60 - uScore * 60 - iScore * 30); // minutes
          combinations.push({ type: t, urgency: u, impact: i, response, resolution });
        }
      }
    }
    for (const c of combinations) {
      await db.query(
        `INSERT INTO sla_policies (type_code, urgency, impact, response_minutes, resolution_minutes)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (type_code, urgency, impact) DO NOTHING`,
        [c.type, c.urgency, c.impact, c.response, c.resolution],
      );
    }

    const verboseLogging =
      process.env.DB_VERBOSE_LOGGING === 'true' || process.env.NODE_ENV === 'production';
    if (verboseLogging) {
      logger.info('Default SLA policies seeded');
    }
  } catch (error) {
    logger.warn('Failed to seed default SLA policies', { error: error.message });
  }
}

/**
 * Set up default configuration
 */
async function setupDefaultConfig() {
  try {
    const defaults = {
      logoUrl: process.env.LOGO_URL || '/logo.png',
      companyName: process.env.COMPANY_NAME || 'Nova Universe',
      enableRegistration: process.env.ENABLE_REGISTRATION || 'false',
      enableSSOLogin: process.env.ENABLE_SSO_LOGIN || 'false',
      enablePasswordLogin: process.env.ENABLE_PASSWORD_LOGIN || 'true',
      enableWebauthn: process.env.ENABLE_WEBAUTHN || 'true',
      sessionTimeout: process.env.SESSION_TIMEOUT || '3600',
      maxLoginAttempts: process.env.MAX_LOGIN_ATTEMPTS || '5',
      lockoutDuration: process.env.LOCKOUT_DURATION || '900',
      passwordMinLength: process.env.PASSWORD_MIN_LENGTH || '8',
      enablePasswordComplexity: process.env.ENABLE_PASSWORD_COMPLEXITY || 'true',
      enableMFA: process.env.ENABLE_MFA || 'false',
      enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING || 'true',
      retentionDays: process.env.LOG_RETENTION_DAYS || '90',
      backupEnabled: process.env.BACKUP_ENABLED || 'true',
      backupFrequency: process.env.BACKUP_FREQUENCY || 'daily',
      maintenanceMode: process.env.MAINTENANCE_MODE || 'false',
      apiRateLimit: process.env.API_RATE_LIMIT || '1000',
      maxFileSize: process.env.MAX_FILE_SIZE || '10485760',
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx',
      smtpEnabled: process.env.SMTP_ENABLED || 'false',
      smtpHost: process.env.SMTP_HOST || 'localhost',
      smtpPort: process.env.SMTP_PORT || '587',
      emailFrom: process.env.EMAIL_FROM || 'noreply@novauniverse.com',
      themePrimary: process.env.THEME_PRIMARY || '#3b82f6',
      themeSecondary: process.env.THEME_SECONDARY || '#64748b',
    };

    for (const [key, value] of Object.entries(defaults)) {
      await db.query(
        'INSERT INTO config (key, value, value_type, category, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (key) DO NOTHING',
        [key, value, 'string', 'general'],
      );
    }

    // Add default directory integration
    await db.query(
      'INSERT INTO directory_integrations (provider, enabled, settings, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING',
      ['mock', true, '{}'],
    );

    logger.info('Default configuration setup completed');
  } catch (error) {
    logger.error('Error setting up default configuration:', error);
    throw error;
  }
}

/**
 * Set up default admin user
 */
async function setupDefaultAdmin() {
  try {
    // Use a single transaction to avoid race conditions
    const client = await db.coreDb.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if admin user already exists
      const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', [
        'admin@novauniverse.com',
      ]);

      if (existingAdmin.rows && existingAdmin.rows.length > 0) {
        logger.info('Default admin user already exists');
        await client.query('COMMIT');
        return;
      }

      // Create default admin user using the correct schema
      const hashedPassword = await bcrypt.hash('admin123!', 12);
      const adminUuid = uuidv4();

      const result = await client.query(
        'INSERT INTO users (uuid, name, email, password_hash, disabled, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        [adminUuid, 'System Administrator', 'admin@novauniverse.com', hashedPassword, false],
      );

      const adminId = result.rows[0].id;

      // Assign superadmin role
      await client.query(
        'INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (user_id, role_id) DO NOTHING',
        [adminId, 1], // superadmin role
      );

      await client.query('COMMIT');
      logger.info('Default admin user created: admin@novauniverse.com / admin123!');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    // If it's a duplicate key error, it means another process already created the admin user
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      logger.info('Default admin user already exists (created by another process)');
      return;
    }
    logger.error('Error setting up default admin:', error);
    throw error;
  }
}

/**
 * Enhanced database operations with compatibility layer
 */
class DatabaseWrapper {
  constructor() {
    this.db = null;
  }

  async ensureReady() {
    try {
      if (!this.db) {
        this.db = await initializeDatabase();
      }
      return this.db;
    } catch (e) {
      // No degraded/mock mode: always fail fast if DB is unavailable
      throw e;
    }
  }

  // Modern async methods
  async query(sql, params = []) {
    const database = await this.ensureReady();
    return await database.query(sql, params);
  }

  async transaction(callback) {
    const database = await this.ensureReady();
    return await database.transaction(callback);
  }

  async storeDocument(collection, document) {
    const database = await this.ensureReady();
    return await database.storeDocument(collection, document);
  }

  async findDocuments(collection, query = {}, options = {}) {
    const database = await this.ensureReady();
    return await database.findDocuments(collection, query, options);
  }

  async createAuditLog(action, userId, details) {
    try {
      const database = await this.ensureReady();
      await database.storeDocument('audit_logs', {
        action,
        userId,
        details,
        timestamp: new Date(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown',
      });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }

  async purgeOldLogs(days, cb) {
    try {
      const database = await this.ensureReady();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Check if system_logs table exists first
      const tableExists = await database.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'system_logs'
        )`,
      );

      if (!tableExists.rows[0].exists) {
        logger.info('system_logs table does not exist, skipping log purge');
        if (cb) cb(null, { rowCount: 0 });
        return { rowCount: 0 };
      }

      const result = await database.query('DELETE FROM system_logs WHERE created_at < $1', [
        cutoffDate,
      ]);

      if (cb) cb(null, result);
      return result;
    } catch (error) {
      // Only log purge errors in debug mode when DB is unavailable
      if (error.message === 'DB unavailable') {
        if (process.env.DEBUG_DB_MAINTENANCE === 'true') {
          logger.error('Failed to purge old logs:', error);
        }
      } else {
        logger.error('Failed to purge old logs:', error);
      }
      if (cb) cb(error);
      throw error;
    }
  }

  // Prisma-specific operations
  async getPrismaClient() {
    return prisma;
  }

  async prismaQuery(model, operation, params = {}) {
    try {
      const client = await this.getPrismaClient();
      return await client[model][operation](params);
    } catch (error) {
      logger.error(`Prisma query failed for ${model}.${operation}:`, error);
      throw error;
    }
  }

  async createWithPrisma(model, data) {
    return await this.prismaQuery(model, 'create', { data });
  }

  async findManyWithPrisma(model, where = {}) {
    return await this.prismaQuery(model, 'findMany', { where });
  }

  async findUniqueWithPrisma(model, where) {
    return await this.prismaQuery(model, 'findUnique', { where });
  }

  async updateWithPrisma(model, where, data) {
    return await this.prismaQuery(model, 'update', { where, data });
  }

  async deleteWithPrisma(model, where) {
    return await this.prismaQuery(model, 'delete', { where });
  }

  /**
   * Get mock Prisma results for development
   */
  getMockPrismaResult(model, operation, params) {
    let id;
    switch (operation) {
      case 'findMany':
        return [];
      case 'findUnique':
      case 'findFirst':
        return null;
      case 'create':
        return { id: uuidv4(), ...params.data };
      case 'update':
        id = params.where.id || params.where.key || uuidv4();
        return { id, ...params.data };
      case 'delete':
        return { id: params.where.id || params.where.key || uuidv4() };
      case 'updateMany':
        return { count: 0 };
      case 'deleteMany':
        return { count: 0 };
      default:
        return null;
    }
  }

  // Compatibility: .get(sql, params, cb)
  get(sql, params, cb) {
    // If only two arguments and second is a function, shift
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    // If callback is provided, use callback style
    if (typeof cb === 'function') {
      this.query(sql, params)
        .then((result) => cb(null, result.rows?.[0] || null))
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params).then((result) => result.rows?.[0] || null);
    }
  }

  // Compatibility: .all(sql, params, cb)
  all(sql, params, cb) {
    // If only two arguments and second is a function, shift
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    // If callback is provided, use callback style
    if (typeof cb === 'function') {
      this.query(sql, params)
        .then((result) => cb(null, result.rows || []))
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params).then((result) => result.rows || []);
    }
  }

  // Compatibility: .run(sql, params, cb) or .run(sql, params) returning a promise
  run(sql, params, cb) {
    // If only two arguments and second is a function, shift
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    // If callback is provided, use callback style
    if (typeof cb === 'function') {
      this.query(sql, params)
        .then((result) => {
          const context = {
            lastID:
              (result &&
                result.rows &&
                result.rows[0] &&
                (result.rows[0].id || result.rows[0].uuid)) ||
              undefined,
            changes: typeof result?.rowCount === 'number' ? result.rowCount : 0,
          };
          cb.call(context, null, result);
        })
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params);
    }
  }
}

// Create and export the database wrapper
const dbWrapper = new DatabaseWrapper();

export default dbWrapper;
export { prisma };

// Gracefully close all database connections
async function closeDatabase() {
  try {
    // Close Prisma client
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Prisma client disconnected');
    }

    if (dbFactory && typeof dbFactory.close === 'function' && isInitialized) {
      await dbFactory.close();
      isInitialized = false;
    } else {
      logger.warn('closeDatabase called but dbFactory or isInitialized is in an invalid state.', {
        dbFactory: dbFactory ? 'valid' : 'null/undefined',
        isInitialized,
      });
    }
  } catch (error) {
    logger.error('Failed to close database:', error);
  }
}

export { setupInitialData, initializeDatabase, closeDatabase };
