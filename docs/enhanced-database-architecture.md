# Nova Universe Enhanced Database Architecture Documentation

## Overview

Nova Universe now features a sophisticated multi-database architecture designed for enterprise-scale applications. This setup provides optimal performance, comprehensive logging, and powerful search capabilities.

## Architecture Components

### 🗄️ PostgreSQL with Prisma ORM (Core Data)

- **Purpose**: Primary database for structured application data
- **Technology**: PostgreSQL 15 + Prisma ORM + TypeScript
- **Data Types**: Users, roles, permissions, configurations, core business logic
- **Features**: Type-safe queries, automatic migrations, connection pooling

### 📊 MongoDB (Logs and Telemetry)

- **Purpose**: Specialized storage for logs, telemetry, and unstructured data
- **Technology**: MongoDB 7.0 + Native Node.js driver
- **Data Types**: Audit logs, system logs, user activity, performance metrics, API usage
- **Features**: TTL indexes, specialized collections, horizontal scaling

### 🔍 Elasticsearch (Search and Analytics)

- **Purpose**: Full-text search, analytics, and operational observability
- **Technology**: Elasticsearch 8.11 + Kibana dashboard
- **Data Types**: Indexed tickets, knowledge base articles, log analytics, search embeddings
- **Features**: Real-time search, aggregations, machine learning capabilities

## Directory Structure

```
/src/lib/db/
├── index.ts          # Unified database manager
├── postgres.ts       # Enhanced Prisma client
├── mongo.ts          # Enhanced MongoDB client
└── elastic.ts        # Elasticsearch client

/prisma/
├── schema.prisma     # Complete data model
└── migrations/       # Database migrations

/test/
└── database-setup.test.js  # Validation testing
```

## Environment Configuration

The following environment variables control the database setup:

```bash
# PostgreSQL (Core Data)
DATABASE_URL=postgresql://user:pass@localhost:5432/nova_universe
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_user
POSTGRES_PASSWORD=secure_password

# MongoDB (Logs and Telemetry)
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=nova_logs
MONGO_USER=nova_user
MONGO_PASSWORD=secure_password

# Elasticsearch (Search and Analytics)
ELASTIC_URL=http://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=changeme
```

## Key Features

### 🔐 Enhanced Security

- Role-based access control (RBAC)
- WebAuthn passkey support
- Comprehensive audit logging
- Secure connection management

### 📈 Performance Optimization

- Connection pooling for PostgreSQL
- TTL indexes for MongoDB collections
- Elasticsearch index templates with optimized mappings
- Singleton pattern for database clients

### 🛡️ Error Handling & Monitoring

- Health checks for all database systems
- Automatic retry mechanisms
- Comprehensive error logging
- Performance metrics collection

### 🔍 Advanced Search Capabilities

- Full-text search across tickets and knowledge base
- Semantic search with embedding support
- Search analytics and user behavior tracking
- Real-time search suggestions

## Database Clients

### PostgreSQL Client (Enhanced Prisma)

```typescript
import { novaDb } from '../src/lib/db';

// Create user with automatic audit logging
const user = await novaDb.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
});

// Type-safe queries with middleware
const users = await novaDb.postgres.prisma.user.findMany({
  where: { active: true },
  include: { roles: true },
});
```

### MongoDB Client (Logs and Telemetry)

```typescript
// Log user activity
await novaDb.mongo.logUserActivity('user123', 'ticket_created', {
  ticketId: 'T001',
  priority: 'high',
});

// Log system performance
await novaDb.mongo.logPerformance('api', '/tickets/search', 150, { resultsCount: 25 });
```

### Elasticsearch Client (Search and Analytics)

```typescript
// Search tickets with filters
const results = await novaDb.searchTickets(
  'installation issue',
  { status: 'open', priority: 'high' },
  { size: 10 },
);

// Search knowledge base
const kbResults = await novaDb.searchKnowledgeBase('setup guide', { category: 'documentation' });
```

## Data Models

### Core PostgreSQL Schema

- **User**: User accounts with authentication
- **Role/Permission**: RBAC system
- **Passkey**: WebAuthn credentials
- **SupportTicket**: Customer support tickets
- **KnowledgeBaseArticle**: Documentation and guides
- **SystemConfig**: Application configuration
- **AuditLog**: Critical action tracking

### MongoDB Collections

- **audit_logs**: User actions and system changes (90 days TTL)
- **system_logs**: Application logs (30 days TTL)
- **user_activity**: User behavior tracking (30 days TTL)
- **performance_metrics**: System performance data (7 days TTL)
- **error_logs**: Error tracking (90 days TTL)
- **api_usage**: API usage statistics (30 days TTL)
- **search_analytics**: Search behavior analysis (90 days TTL)

### Elasticsearch Indexes

- **nova_tickets**: Searchable ticket index
- **nova_kb**: Knowledge base search index
- **nova_logs**: Log analytics index
- **nova_ai_context**: AI embeddings and context

## Docker Services

The complete stack runs with Docker Compose:

```bash
# Start the full stack
docker-compose up -d

# Individual services
docker-compose up postgres    # PostgreSQL + pgAdmin
docker-compose up mongodb     # MongoDB + Mongo Express
docker-compose up elasticsearch kibana  # Elasticsearch + Kibana

# Management interfaces
# pgAdmin: http://localhost:8080
# Mongo Express: http://localhost:8081
# Kibana: http://localhost:5601
```

## Operations Guide

### 🚀 Setup and Initialization

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
npx prisma generate

# 3. Start databases
docker-compose up -d postgres mongodb elasticsearch

# 4. Push database schema
npx prisma db push

# 5. Test setup
pnpm test test/database-setup.test.js
```

### 🔧 Database Management

```bash
# View database schema
npx prisma studio

# Create migration
npx prisma migrate dev --name add_feature

# Reset database
npx prisma migrate reset

# MongoDB operations
docker exec -it nova-mongodb mongosh

# Elasticsearch operations
curl -X GET "localhost:9200/_cluster/health"
```

### 📊 Monitoring and Analytics

```bash
# Check system health
curl -X GET "localhost:3000/api/health"

# View search analytics in Kibana
# Navigate to http://localhost:5601

# Export data
node -e "require('./src/lib/db').exportData({includeUsers: true})"
```

## Migration Guide

### From SQLite to Enhanced Architecture

1. **Backup existing data**:

   ```bash
   sqlite3 log.sqlite ".dump" > backup.sql
   ```

2. **Set up new databases**:

   ```bash
   docker-compose up -d
   ```

3. **Generate Prisma client**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Migrate data** (custom script needed based on existing schema)

5. **Update application code** to use new database manager:

   ```typescript
   // Old
   const db = require('./db.js');

   // New
   import { novaDb } from './src/lib/db';
   ```

## Best Practices

### 🔒 Security

- Use environment variables for all credentials
- Enable SSL/TLS in production
- Implement proper backup encryption
- Regular security audits of database access

### ⚡ Performance

- Use database connection pooling
- Implement proper indexing strategies
- Monitor query performance with Prisma logging
- Use TTL indexes for temporary data in MongoDB

### 🛠️ Maintenance

- Regular database backups
- Monitor disk space and performance
- Keep database software updated
- Regular cleanup of expired logs

### 📈 Scaling

- PostgreSQL: Read replicas, connection pooling
- MongoDB: Replica sets, sharding
- Elasticsearch: Multi-node clusters

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check Docker containers are running
   - Verify environment variables
   - Check network connectivity

2. **Migration Failures**
   - Ensure clean state: `npx prisma migrate reset`
   - Check database permissions
   - Verify schema syntax

3. **Search Not Working**
   - Check Elasticsearch health
   - Verify index creation
   - Check mapping conflicts

4. **Performance Issues**
   - Review query patterns
   - Check index usage
   - Monitor connection pools

### Logs and Debugging

```bash
# Application logs
tail -f server.log

# Database logs
docker logs nova-postgres
docker logs nova-mongodb
docker logs nova-elasticsearch

# Prisma query debugging
DEBUG=prisma:query npm start
```

## API Reference

### Health Check Endpoint

```typescript
GET / api / health;
// Returns comprehensive health status of all databases
```

### Search Endpoints

```typescript
GET /api/tickets/search?q=query&status=open
GET /api/kb/search?q=query&category=docs
```

### Analytics Endpoints

```typescript
GET /api/analytics/search?timeRange=24h
GET /api/analytics/performance?service=api
```

## Contributing

When contributing to the database layer:

1. Always update the Prisma schema for structural changes
2. Add appropriate indexes for new query patterns
3. Include MongoDB logging for new operations
4. Update Elasticsearch mappings for searchable data
5. Add tests for new database functionality
6. Update this documentation

## Support

For database-related issues:

1. Check the troubleshooting section above
2. Review application logs
3. Test individual database connections
4. Consult the test file for validation examples
5. Create an issue with detailed error information

---

This enhanced database architecture provides Nova Universe with enterprise-grade capabilities for data management, search, and analytics while maintaining simplicity for developers.
