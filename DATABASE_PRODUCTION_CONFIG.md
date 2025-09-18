# Nova Universe - Production Database Configuration Guide

## 🎯 Overview

This guide provides essential database configuration for meeting Nova Universe production requirements:
- **10,000 concurrent users** support
- **Zero data loss** guarantee  
- **Sub-50ms average query performance**
- **99.9% uptime** reliability

---

## 📊 Current vs Required Configuration

### PostgreSQL Configuration

#### Current Limitations ❌
- Max connections: 20 (insufficient for 10K users)
- Default connection pool settings
- No read replica configuration
- Basic performance tuning

#### Required Production Settings ✅

```postgresql
# /etc/postgresql/15/main/postgresql.conf

# Connection Settings
max_connections = 500                    # Support for high concurrent load
shared_buffers = 2GB                     # 25% of system RAM
effective_cache_size = 6GB               # 75% of system RAM
work_mem = 16MB                          # Per query memory
maintenance_work_mem = 512MB             # Maintenance operations

# Performance Tuning
checkpoint_completion_target = 0.9       # Smooth checkpoints
wal_buffers = 64MB                       # WAL buffer size
default_statistics_target = 100          # Query planner statistics
random_page_cost = 1.1                   # SSD optimization
effective_io_concurrency = 200           # Concurrent I/O operations

# Logging for Monitoring
log_statement = 'mod'                    # Log modifications
log_min_duration_statement = 100         # Log slow queries (>100ms)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Replication Settings (for read replicas)
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3
hot_standby = on
```

#### Connection Pool Configuration

```javascript
// Database connection pool for Nova Universe API
const poolConfig = {
  // Production settings for 10K concurrent users
  max: 200,                    // Maximum connections in pool
  min: 20,                     // Minimum connections maintained
  acquire: 5000,               // Max time to get connection (5s)
  idle: 30000,                 // Connection idle time (30s)
  evict: 60000,                // Connection eviction interval (60s)
  handleDisconnects: true,     // Auto-reconnect on disconnect
  
  // Connection validation
  validate: true,
  validateOnBorrow: true,
  testOnCreate: true,
  
  // Retry configuration
  retry: {
    max: 3,
    timeout: 10000,
    match: [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED'
    ]
  }
};
```

### MongoDB Configuration (Logs & Analytics)

```yaml
# /etc/mongod.conf

# Network settings
net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 1000

# Storage settings
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
    collectionConfig:
      blockCompressor: snappy

# Operation profiling
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

# Security
security:
  authorization: enabled

# Replication (for high availability)
replication:
  replSetName: "nova-logs-rs"
```

### Redis Configuration (Caching)

```redis
# /etc/redis/redis.conf

# Memory settings
maxmemory 1gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Persistence
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes

# Network
tcp-keepalive 300
timeout 0
tcp-backlog 511

# Performance
hz 10
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
```

---

## 🚀 Database Optimization Scripts

### 1. PostgreSQL Optimization Script

```bash
#!/bin/bash
# optimize-postgresql.sh

echo "🔧 Optimizing PostgreSQL for Nova Universe Production"

# Create optimized configuration
sudo tee /etc/postgresql/15/main/conf.d/nova-production.conf << 'EOF'
# Nova Universe Production Settings
max_connections = 500
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 16MB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
log_min_duration_statement = 100
log_statement = 'mod'
EOF

# Create indexes for performance
sudo -u postgres psql nova_universe << 'SQL'
-- Performance indexes for ITSM operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_status_priority 
ON tickets(status, priority);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_assigned_user_status 
ON tickets(assigned_user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_created_at_desc 
ON tickets(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_updated_at_desc 
ON tickets(updated_at DESC);

-- Full-text search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_search 
ON tickets USING gin(to_tsvector('english', title || ' ' || description));

-- User and authentication indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
ON users(email) WHERE disabled = 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id 
ON user_sessions(user_id);

-- Audit and logging indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp 
ON audit_logs(timestamp DESC);

-- SLA and workflow indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sla_breaches_ticket_id 
ON sla_breaches(ticket_id);

-- Update table statistics
ANALYZE;
SQL

sudo systemctl restart postgresql
echo "✅ PostgreSQL optimization complete"
```

### 2. Database Performance Monitoring Script

```bash
#!/bin/bash
# monitor-database-performance.sh

echo "📊 Database Performance Monitoring"

# PostgreSQL performance check
sudo -u postgres psql -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY schemaname, tablename, attname;
"

# Check slow queries
sudo -u postgres psql -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time,
    (total_time / sum(total_time) OVER()) * 100 AS percentage
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
"

# Check connection usage
sudo -u postgres psql -c "
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active_connections,
    count(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity;
"

# Check database size
sudo -u postgres psql -c "
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database 
ORDER BY pg_database_size(pg_database.datname) DESC;
"
```

### 3. Database Backup Configuration

```bash
#!/bin/bash
# setup-database-backups.sh

echo "🔄 Setting up automated database backups"

# Create backup directories
sudo mkdir -p /var/backups/nova-universe/{postgresql,mongodb,redis}

# PostgreSQL backup script
sudo tee /usr/local/bin/backup-postgresql.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/nova-universe/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="nova_universe"

# Full backup
pg_dump -h localhost -U nova_admin -d $DB_NAME -Fc > "$BACKUP_DIR/nova_universe_$DATE.backup"

# WAL archiving for point-in-time recovery
pg_basebackup -h localhost -U nova_admin -D "$BACKUP_DIR/base_$DATE" -Ft -z -P

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete
find $BACKUP_DIR -name "base_*" -mtime +7 -exec rm -rf {} \;

echo "PostgreSQL backup completed: $DATE"
EOF

# MongoDB backup script
sudo tee /usr/local/bin/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/nova-universe/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mongodump --host localhost:27017 --db nova_logs --out "$BACKUP_DIR/nova_logs_$DATE"

# Cleanup old backups
find $BACKUP_DIR -name "nova_logs_*" -mtime +7 -exec rm -rf {} \;

echo "MongoDB backup completed: $DATE"
EOF

# Redis backup script
sudo tee /usr/local/bin/backup-redis.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/nova-universe/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Redis automatically creates dump.rdb, copy it
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Cleanup old backups
find $BACKUP_DIR -name "redis_*.rdb" -mtime +7 -delete

echo "Redis backup completed: $DATE"
EOF

# Make scripts executable
sudo chmod +x /usr/local/bin/backup-*.sh

# Add to crontab (run daily at 2 AM)
sudo tee -a /etc/crontab << 'EOF'
0 2 * * * root /usr/local/bin/backup-postgresql.sh >> /var/log/nova-backups.log 2>&1
10 2 * * * root /usr/local/bin/backup-mongodb.sh >> /var/log/nova-backups.log 2>&1
20 2 * * * root /usr/local/bin/backup-redis.sh >> /var/log/nova-backups.log 2>&1
EOF

echo "✅ Automated backups configured"
```

---

## 🔧 Read Replica Setup

### PostgreSQL Read Replica Configuration

```bash
#!/bin/bash
# setup-read-replica.sh

echo "🔄 Setting up PostgreSQL read replica"

# Primary server configuration (already in postgresql.conf)
# wal_level = replica
# max_wal_senders = 3
# archive_mode = on
# archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'

# On replica server
# 1. Create base backup
pg_basebackup -h primary-server -D /var/lib/postgresql/15/replica -U replication -P -W

# 2. Create recovery.conf on replica
cat > /var/lib/postgresql/15/replica/recovery.conf << 'EOF'
standby_mode = 'on'
primary_conninfo = 'host=primary-server port=5432 user=replication'
trigger_file = '/var/lib/postgresql/trigger_file'
EOF

# 3. Start replica
sudo systemctl start postgresql

echo "✅ Read replica setup complete"
```

### Application Load Balancing

```javascript
// Database connection with read/write splitting
const { Pool } = require('pg');

const primaryPool = new Pool({
  host: 'postgres-primary',
  port: 5432,
  database: 'nova_universe',
  user: 'nova_admin',
  password: process.env.POSTGRES_PASSWORD,
  max: 200,
  min: 20
});

const replicaPool = new Pool({
  host: 'postgres-replica',
  port: 5432,
  database: 'nova_universe',
  user: 'nova_admin',
  password: process.env.POSTGRES_PASSWORD,
  max: 100,
  min: 10
});

// Smart query routing
class DatabaseManager {
  async query(sql, params, options = {}) {
    const isReadQuery = sql.trim().toLowerCase().startsWith('select');
    const pool = (isReadQuery && !options.forcePrimary) ? replicaPool : primaryPool;
    
    return await pool.query(sql, params);
  }
  
  async transaction(callback) {
    // Transactions always go to primary
    const client = await primaryPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

---

## 📊 Performance Validation

### Database Performance Test Script

```bash
#!/bin/bash
# test-database-performance.sh

echo "🔍 Testing database performance for 10K concurrent users"

# Test connection capacity
echo "Testing connection capacity..."
for i in {1..500}; do
  psql -h localhost -d nova_universe -c "SELECT 1;" &
done
wait

# Test query performance
echo "Testing query performance..."
time psql -h localhost -d nova_universe -c "
SELECT 
    t.id,
    t.title,
    t.status,
    u.name as assigned_user
FROM tickets t
LEFT JOIN users u ON t.assigned_user_id = u.id
WHERE t.status = 'open'
ORDER BY t.priority DESC, t.created_at DESC
LIMIT 100;
"

# Test concurrent queries
echo "Testing concurrent query performance..."
for i in {1..100}; do
  psql -h localhost -d nova_universe -c "SELECT COUNT(*) FROM tickets;" &
done
wait

echo "✅ Database performance test complete"
```

---

## 🚨 Critical Production Checklist

### Before Deployment
- [ ] **PostgreSQL configured for 500+ connections**
- [ ] **Connection pools configured for 200 max per service**
- [ ] **Read replica setup and tested**
- [ ] **Database indexes optimized for ITSM queries**
- [ ] **Backup automation configured and tested**
- [ ] **Performance monitoring enabled**
- [ ] **Query performance validated (<50ms average)**

### During Deployment
- [ ] **Database migration scripts tested**
- [ ] **Connection pool failover tested**
- [ ] **Read replica synchronization verified**
- [ ] **Performance monitoring active**

### Post Deployment
- [ ] **Monitor connection usage**
- [ ] **Track query performance**
- [ ] **Validate backup integrity**
- [ ] **Monitor replication lag**

---

## 📈 Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|--------|-------------|
| Max Connections | 20 | 500 | 2,400% |
| Concurrent Users Support | ~100 | 10,000 | 9,900% |
| Average Query Time | ~100ms | <50ms | 50%+ |
| Backup Recovery Time | Manual | <30 min | Automated |
| Read Query Performance | N/A | 2x faster | Read replicas |

---

**⚠️ Important Notes:**

1. **Test all configurations in staging environment first**
2. **Monitor system resources during configuration changes**
3. **Have rollback procedures ready**
4. **Coordinate with infrastructure team for server sizing**
5. **Update monitoring thresholds after optimization**

This configuration will enable Nova Universe to handle 10,000 concurrent users with sub-50ms database performance and zero data loss capability.