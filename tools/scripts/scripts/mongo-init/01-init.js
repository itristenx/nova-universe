// MongoDB initialization script for Docker
// This script sets up the initial database with proper security

// Switch to admin database for user creation
db = db.getSiblingDB('admin');

// Create application user with read/write access
db.createUser({
  user: 'nova_admin',
  pwd: 'nova_secure_pass_2024',
  roles: [
    { role: 'readWrite', db: 'nova_universe' },
    { role: 'dbAdmin', db: 'nova_universe' },
  ],
});

// Create read-only user for monitoring
db.createUser({
  user: 'nova_readonly',
  pwd: 'readonly_pass_2024',
  roles: [{ role: 'read', db: 'nova_universe' }],
});

// Create backup user
db.createUser({
  user: 'nova_backup',
  pwd: 'backup_pass_2024',
  roles: [
    { role: 'read', db: 'nova_universe' },
    { role: 'backup', db: 'admin' },
  ],
});

// Switch to application database
db = db.getSiblingDB('nova_universe');

// Create initial collections with validation
db.createCollection('assets', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'filename', 'url', 'uploaded_at'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 255,
          description: 'Asset name is required and must be 1-255 characters',
        },
        type: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Asset type is required',
        },
        filename: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 255,
          description: 'Filename is required',
        },
        url: {
          bsonType: 'string',
          minLength: 1,
          description: 'URL is required',
        },
        file_size: {
          bsonType: ['long', 'int'],
          minimum: 0,
          description: 'File size must be a positive number',
        },
        mime_type: {
          bsonType: 'string',
          maxLength: 100,
          description: 'MIME type',
        },
        is_public: {
          bsonType: 'bool',
          description: 'Public access flag',
        },
        uploaded_at: {
          bsonType: 'date',
          description: 'Upload timestamp is required',
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional metadata',
        },
      },
    },
  },
});

db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_type', 'timestamp'],
      properties: {
        event_type: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50,
          description: 'Event type is required',
        },
        timestamp: {
          bsonType: 'date',
          description: 'Timestamp is required',
        },
        user_id: {
          bsonType: ['string', 'int'],
          description: 'User ID',
        },
        session_id: {
          bsonType: 'string',
          description: 'Session ID',
        },
        metadata: {
          bsonType: 'object',
          description: 'Event metadata',
        },
      },
    },
  },
});

db.createCollection('audit_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['action', 'timestamp'],
      properties: {
        action: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Action is required',
        },
        timestamp: {
          bsonType: 'date',
          description: 'Timestamp is required',
        },
        user_id: {
          bsonType: ['string', 'int'],
          description: 'User ID',
        },
        ip_address: {
          bsonType: 'string',
          description: 'IP address',
        },
        user_agent: {
          bsonType: 'string',
          description: 'User agent',
        },
        details: {
          bsonType: 'object',
          description: 'Action details',
        },
      },
    },
  },
});

db.createCollection('configurations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['key', 'value'],
      properties: {
        key: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 255,
          description: 'Configuration key is required',
        },
        value: {
          description: 'Configuration value is required',
        },
        category: {
          bsonType: 'string',
          maxLength: 100,
          description: 'Configuration category',
        },
        description: {
          bsonType: 'string',
          description: 'Configuration description',
        },
        is_public: {
          bsonType: 'bool',
          description: 'Public access flag',
        },
        created_at: {
          bsonType: 'date',
          description: 'Creation timestamp',
        },
        updated_at: {
          bsonType: 'date',
          description: 'Update timestamp',
        },
      },
    },
  },
});

// Create indexes
db.assets.createIndex({ type: 1 });
db.assets.createIndex({ uploaded_at: -1 });
db.assets.createIndex({ name: 'text', type: 'text' });
db.assets.createIndex({ is_public: 1 });

db.analytics.createIndex({ timestamp: -1 });
db.analytics.createIndex({ event_type: 1 });
db.analytics.createIndex({ user_id: 1, timestamp: -1 });

db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ user_id: 1 });
db.audit_logs.createIndex({ action: 1 });
// TTL index for audit logs (remove after 1 year)
db.audit_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

db.configurations.createIndex({ key: 1 }, { unique: true });
db.configurations.createIndex({ category: 1 });

print('MongoDB initialization completed successfully');
