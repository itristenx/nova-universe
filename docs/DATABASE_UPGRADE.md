# Nova Universe Database Upgrade

This document provides a comprehensive guide for upgrading Nova Universe from SQLite to PostgreSQL and MongoDB.

## Overview

The Nova Universe database upgrade introduces a modern, scalable database architecture with the following improvements:

- **PostgreSQL**: Primary relational database for structured data
- **MongoDB**: Document database for unstructured data and analytics
- **Redis**: In-memory cache for session management and performance
- **Hybrid Architecture**: Seamless integration between multiple database systems
- **Advanced Security**: SSL/TLS encryption, connection pooling, audit logging
- **High Availability**: Connection retry logic, health monitoring, failover support
- **Developer Experience**: Docker-based local development environment

## Architecture

### Database Roles

- **PostgreSQL**: User management, roles, permissions, system configuration, logs
- **MongoDB**: Assets, analytics, user preferences, audit logs, temporary data
- **Redis**: Session storage, caching, real-time features
- **SQLite**: Fallback option for simple deployments

### Key Features

- **Connection Pooling**: Efficient database connection management
- **Transaction Support**: ACID compliance across operations
- **Audit Logging**: Comprehensive activity tracking
- **Schema Migrations**: Automated database schema updates
- **Data Migration**: Seamless migration from existing SQLite database
- **Health Monitoring**: Real-time database health checks
- **Security**: SSL/TLS encryption, secure password storage

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- Node.js 18+ 
- Docker and Docker Compose (for local development)
- PostgreSQL 15+ (for production)
- MongoDB 7.0+ (for production)

### 2. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Configure your database settings in `.env`:
```env
# Database Configuration
PRIMARY_DATABASE=postgresql,mongodb

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_user
POSTGRES_PASSWORD=your_secure_password

# MongoDB
MONGO_URI=mongodb://localhost:27017/nova_universe
MONGO_USER=nova_user
MONGO_PASSWORD=your_secure_password
```

### 3. Local Development with Docker

Start the development environment:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- MongoDB database on port 27017
- pgAdmin web interface on port 8080
- mongo-express web interface on port 8081
- Redis cache on port 6379

### 4. Install Dependencies

Install the required database drivers:
```bash
pnpm install
```

### 5. Run Migrations

Initialize the database schema:
```bash
node migrate-database.js --interactive
```

Or for automatic migration:
```bash
node migrate-database.js --source ./nova-api/log.sqlite --target both
```

### 6. Start the Application

```bash
npm start
```

## Database Migration

### Automatic Migration

The migration script will automatically:
1. Create database schemas
2. Migrate data from SQLite
3. Set up roles and permissions
4. Create audit logs
5. Verify data integrity

### Migration Options

```bash
# Interactive migration with guided setup
node migrate-database.js --interactive

# Dry run to see what would be migrated
node migrate-database.js --dry-run

# Migrate to specific database only
node migrate-database.js --target postgresql
node migrate-database.js --target mongodb

# Force migration (overwrite existing data)
node migrate-database.js --force

# Skip backup creation
node migrate-database.js --no-backup
```

### Manual Migration

If you prefer manual migration:

1. **PostgreSQL Setup**:
```sql
-- Connect to PostgreSQL
psql -h localhost -U postgres

-- Create database and user
CREATE DATABASE nova_universe;
CREATE USER nova_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nova_universe TO nova_user;
```

2. **MongoDB Setup**:
```bash
# Connect to MongoDB
mongo

# Create user
use nova_universe
db.createUser({
  user: "nova_user",
  pwd: "your_password",
  roles: ["readWrite", "dbAdmin"]
})
```

3. **Run Schema Migrations**:
```bash
node -e "
const { MigrationManager } = require('./database/migrations.js');
const manager = new MigrationManager();
manager.runMigrations().then(() => console.log('Migrations completed'));
"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PRIMARY_DATABASE` | Database types to use | `postgresql,mongodb` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | PostgreSQL database name | `nova_universe` |
| `POSTGRES_USER` | PostgreSQL username | `nova_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | *required* |
| `POSTGRES_MAX_CONNECTIONS` | Connection pool size | `20` |
| `POSTGRES_SSL` | Enable SSL | `false` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://localhost:27017/nova_universe` |
| `MONGO_USER` | MongoDB username | `nova_user` |
| `MONGO_PASSWORD` | MongoDB password | *required* |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |

### Security Configuration

For production environments:

```env
# Enable SSL/TLS
POSTGRES_SSL=true
POSTGRES_SSL_CERT_PATH=/path/to/client-cert.pem
POSTGRES_SSL_KEY_PATH=/path/to/client-key.pem
POSTGRES_SSL_CA_PATH=/path/to/ca-cert.pem

MONGO_SSL=true
MONGO_SSL_CERT_PATH=/path/to/mongodb-cert.pem
MONGO_SSL_KEY_PATH=/path/to/mongodb-key.pem
MONGO_SSL_CA_PATH=/path/to/mongodb-ca.pem

# Strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
MONGO_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
```

## Database Schema

### PostgreSQL Tables

- `users` - User accounts and authentication
- `roles` - Role-based access control
- `permissions` - System permissions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission assignments
- `logs` - System activity logs
- `config` - System configuration
- `kiosks` - Kiosk management
- `notifications` - System notifications
- `passkeys` - WebAuthn credentials
- `assets` - File uploads metadata
- `directory_integrations` - LDAP/SCIM configurations
- `sso_configurations` - Single sign-on settings

### MongoDB Collections

- `user_preferences` - User settings and preferences
- `analytics` - Usage analytics and metrics
- `audit_logs` - Detailed audit trail
- `file_chunks` - Large file storage (GridFS)
- `sessions` - User session data
- `cache` - Application cache
- `notifications_queue` - Notification delivery queue

## API Changes

### Database Factory

The new database system uses a factory pattern for unified access:

```javascript
import { DatabaseFactory } from './database/factory.js';

const db = new DatabaseFactory();
await db.initialize();

// PostgreSQL queries
const users = await db.query('SELECT * FROM users WHERE active = $1', [true]);

// MongoDB operations
const preferences = await db.findDocuments('user_preferences', { user_id: userId });
await db.storeDocument('analytics', { event: 'user_login', userId, timestamp: new Date() });

// Transactions
await db.transaction(async (client) => {
  await client.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
  await db.createAuditLog('USER_LOGIN', userId, { ip: '127.0.0.1' });
});
```

### Backward Compatibility

The existing `db.js` interface is preserved for backward compatibility:

```javascript
import db from './db.js';

// Legacy SQLite-style methods still work
db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);
db.get('SELECT * FROM users WHERE id = ?', [1], (err, row) => {
  console.log(row);
});
```

## Performance Optimization

### Connection Pooling

PostgreSQL connection pool configuration:
```env
POSTGRES_MAX_CONNECTIONS=20
POSTGRES_MIN_CONNECTIONS=2
POSTGRES_IDLE_TIMEOUT=30000
POSTGRES_CONNECTION_TIMEOUT=5000
```

### MongoDB Indexing

Automatic indexes are created for:
- User lookups (`user_id`)
- Timestamp queries (`created_at`, `updated_at`)
- Search operations (`name`, `email`)
- TTL indexes for temporary data

### Redis Caching

Session and frequently accessed data is cached in Redis:
```javascript
// Automatic caching for user sessions
// Manual caching for expensive queries
await db.cache.set('user_preferences_' + userId, preferences, 3600);
```

## Monitoring and Health Checks

### Health Check Endpoint

The system provides comprehensive health checks:

```javascript
const health = await db.healthCheck();
/*
{
  postgresql: { healthy: true, responseTime: 12, connections: { active: 3, idle: 2 } },
  mongodb: { healthy: true, responseTime: 8, collections: 15 },
  redis: { healthy: true, responseTime: 2, memory: '64MB' }
}
*/
```

### Metrics

Key metrics are automatically collected:
- Connection pool utilization
- Query response times
- Error rates
- Database sizes
- Cache hit rates

### Alerts

Set up monitoring alerts for:
- Database connection failures
- High response times (>1000ms)
- Connection pool exhaustion
- Disk space usage (>80%)
- Error rates (>5%)

## Backup and Recovery

### Automated Backups

Configure automatic backups:
```env
BACKUP_RETENTION_DAYS=7
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
```

Run manual backup:
```bash
./scripts/backup.sh
```

### Backup Strategy

- **PostgreSQL**: Full database dumps with compression
- **MongoDB**: Binary dumps with GridFS support  
- **Retention**: Configurable retention period
- **Verification**: Automatic backup integrity checks

### Disaster Recovery

Restore from backup:
```bash
# List available backups
./scripts/restore.sh --list

# Restore PostgreSQL
./scripts/restore.sh --postgres /backups/postgres/nova_universe_20240315_120000.sql.gz

# Restore MongoDB
./scripts/restore.sh --mongodb /backups/mongodb/nova_universe_20240315_120000.tar.gz
```

## Troubleshooting

### Common Issues

**Connection Refused**
```bash
# Check if databases are running
docker-compose ps

# Check logs
docker-compose logs postgresql
docker-compose logs mongodb
```

**Migration Failures**
```bash
# Run migration in dry-run mode
node migrate-database.js --dry-run

# Check migration logs
tail -f ./nova-api/server.log
```

**Permission Denied**
```bash
# Verify database user permissions
psql -h localhost -U nova_user -d nova_universe -c "\l"
mongo --host localhost -u nova_user -p
```

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
DEBUG_SQL=true
ENABLE_QUERY_LOGGING=true
```

### Performance Issues

Monitor query performance:
```sql
-- PostgreSQL slow query log
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- MongoDB profiler
db.setProfilingLevel(2, { slowms: 100 });
db.system.profile.find().limit(5).sort({ ts: -1 });
```

## Testing

### Running Tests

```bash
# Full test suite
pnpm test

# Database-specific tests
pnpm test test/database.test.js

# Integration tests
pnpm test test/integration.test.js
```

### Test Configuration

Tests use separate test databases:
```env
POSTGRES_DB=nova_universe_test
MONGO_URI=mongodb://localhost:27017/nova_universe_test
```

### Test Coverage

The test suite covers:
- Database connections and pooling
- CRUD operations
- Transaction handling
- Error conditions
- Performance scenarios
- Migration processes

## Production Deployment

### Prerequisites

1. **PostgreSQL 15+** with:
   - SSL/TLS certificates
   - Backup strategy
   - Monitoring setup
   - Performance tuning

2. **MongoDB 7.0+** with:
   - Replica set configuration
   - SSL/TLS certificates
   - Backup strategy
   - Index optimization

3. **Redis 7.0+** with:
   - Persistence configuration
   - Memory optimization
   - Security setup

### Deployment Steps

1. **Configure Environment**:
```bash
# Production environment
NODE_ENV=production
PRIMARY_DATABASE=postgresql,mongodb

# Database connections with SSL
POSTGRES_SSL=true
MONGO_SSL=true

# Strong security
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
```

2. **Run Migrations**:
```bash
node migrate-database.js --source ./nova-api/log.sqlite --target both
```

3. **Verify Setup**:
```bash
# Health check
curl http://localhost:3000/health

# Database connection test
node -e "
const { DatabaseFactory } = require('./database/factory.js');
const db = new DatabaseFactory();
db.initialize().then(() => db.healthCheck()).then(console.log);
"
```

### Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] Database passwords generated securely
- [ ] Network access restricted
- [ ] Backup encryption enabled
- [ ] Audit logging configured
- [ ] Monitoring alerts set up
- [ ] Regular security updates scheduled

## Support

### Getting Help

1. **Documentation**: Check this README and inline code comments
2. **Logs**: Review application and database logs
3. **Health Checks**: Use built-in health monitoring
4. **Community**: Join our developer community

### Reporting Issues

When reporting issues, include:
- Environment configuration (redacted)
- Error messages and stack traces
- Steps to reproduce
- Expected vs actual behavior
- Database versions and setup

### Contributing

Contributions are welcome! Please:
1. Run tests: `pnpm test`
2. Follow code style guidelines
3. Add tests for new features
4. Update documentation
5. Submit pull request

## Migration Timeline

### Phase 1: Setup (Week 1)
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Set up development databases
- [ ] Run initial migrations

### Phase 2: Testing (Week 2)
- [ ] Run test suite
- [ ] Verify data migration
- [ ] Performance testing
- [ ] Security audit

### Phase 3: Production (Week 3)
- [ ] Production database setup
- [ ] SSL/TLS configuration
- [ ] Backup implementation
- [ ] Monitoring setup
- [ ] Go-live migration

### Phase 4: Optimization (Week 4)
- [ ] Performance tuning
- [ ] Index optimization
- [ ] Cache configuration
- [ ] Documentation updates

## FAQ

**Q: Can I use only PostgreSQL or MongoDB?**
A: Yes, set `PRIMARY_DATABASE=postgresql` or `PRIMARY_DATABASE=mongodb` in your environment.

**Q: What happens to my existing SQLite data?**
A: The migration script automatically transfers all data from SQLite to your new databases.

**Q: How do I rollback if there are issues?**
A: Keep your SQLite database as backup and update your environment to use `PRIMARY_DATABASE=sqlite`.

**Q: Is there a performance impact?**
A: The new system is significantly faster due to connection pooling, indexing, and caching.

**Q: How do I monitor database performance?**
A: Use the built-in health checks, pgAdmin for PostgreSQL, and mongo-express for MongoDB.

**Q: Can I use external database services?**
A: Yes, configure the connection strings for AWS RDS, MongoDB Atlas, etc.

---

For additional support, please refer to our [development documentation](./docs/development.md) or contact the development team.
