# Nova Universe Monitoring & Alerting Integration

Complete integration guide for GoAlert and Uptime-Kuma with Nova Universe, using Nova's PostgreSQL database as the single source of truth for all user authentication and data management.

## 🏗️ Architecture Overview

### Unified Database Architecture
- **Single Source of Truth**: Nova's PostgreSQL database stores all user data, monitoring configurations, and alerting settings
- **Schema Separation**: GoAlert data in `goalert` schema, Uptime-Kuma data in `uptime_kuma` schema
- **User Synchronization**: Automatic bi-directional sync between Nova users and monitoring services
- **API-Only Access**: GoAlert and Uptime-Kuma UIs are completely disabled, all access through Nova's unified interface

### Security Model
- **No Direct Access**: Direct UI access to GoAlert (port 8081) and Uptime-Kuma (port 3001) is blocked
- **Nova Authentication**: All authentication handled through Nova's JWT system
- **Role-Based Permissions**: Granular permissions for monitoring and alerting features
- **Network Isolation**: Services only accessible within Nova's Docker network

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy monitoring environment template
cp .env.monitoring.template .env.monitoring

# Edit configuration
nano .env.monitoring
```

### 2. Database Initialization
```bash
# Run database migrations
cd apps/api
npm run migrate

# The following schemas will be created:
# - goalert schema with GoAlert tables
# - uptime_kuma schema with Uptime-Kuma tables
# - User sync triggers and functions
```

### 3. Start Monitoring Stack
```bash
# Start core Nova services first
docker compose up -d postgres mongodb redis

# Start monitoring services
docker compose -f docker-compose.monitoring.yml up -d

# Start Nova API and UI
cd apps/api && npm run dev &
cd apps/unified && npm run dev &
```

### 4. Access Points
- **Nova Unified UI**: `http://localhost:3002` - Complete monitoring interface
- **Nova API**: `http://localhost:3000` - Backend services
- **GoAlert**: ❌ Direct access disabled (Use Nova UI)
- **Uptime-Kuma**: ❌ Direct access disabled (Use Nova UI)

## 📊 Database Schema Integration

### GoAlert Schema (`goalert`)
```sql
-- Core tables synchronized with Nova
goalert.users              -- Synced from public.users
goalert.services           -- Linked to public.monitors
goalert.alerts             -- Correlated with public.nova_alerts
goalert.escalation_policies -- Escalation management
goalert.schedules          -- On-call scheduling
goalert.contact_methods    -- User notification preferences
```

### Uptime-Kuma Schema (`uptime_kuma`)
```sql
-- Core tables synchronized with Nova
uptime_kuma.monitors       -- Synced from public.monitors
uptime_kuma.heartbeats     -- Monitor check results
uptime_kuma.incidents      -- Linked to public.monitor_incidents
uptime_kuma.status_pages   -- Linked to public.status_page_configs
uptime_kuma.notifications  -- User notification settings
```

### User Synchronization
- **Automatic Sync**: Users created/updated in Nova are automatically synced to GoAlert and Uptime-Kuma
- **Role Mapping**: Nova roles mapped to service-specific permissions
- **Contact Methods**: User contact preferences synchronized across all services

## 🔧 Configuration Guide

### Environment Variables

#### Database Configuration
```bash
# Nova Database (Single Source of Truth)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_admin
POSTGRES_PASSWORD=secure_password_here
```

#### GoAlert Integration
```bash
# GoAlert uses Nova database
GOALERT_DB_URL=postgres://nova_admin:password@postgres:5432/nova_universe?search_path=goalert,public
GOALERT_API_KEY=nova-system-api-key
GOALERT_WEBHOOK_SECRET=secure-webhook-secret

# SMTP for alert notifications
GOALERT_SMTP_FROM=alerts@yourdomain.com
GOALERT_SMTP_HOST=smtp.yourdomain.com
GOALERT_SMTP_PORT=587
```

#### Uptime-Kuma Integration
```bash
# Uptime-Kuma uses Nova database
UPTIME_KUMA_USE_NOVA_DB=true
UPTIME_KUMA_NOVA_DB_HOST=postgres
UPTIME_KUMA_NOVA_DB_USER=nova_admin
UPTIME_KUMA_DISABLE_WEB_UI=true
```

### Docker Compose Services

#### Core Monitoring Stack
- **nova-goalert**: GoAlert container (API-only, no UI)
- **nova-uptime-kuma-backend**: Uptime-Kuma container (API-only, no UI)
- **nova-access-control**: Nginx container blocking direct UI access
- **nova-sentinel-redis**: Redis for monitoring data caching

#### Access Control
```yaml
nova-access-control:
  image: nginx:alpine
  ports:
    - '8081:8081'  # Blocks GoAlert UI
    - '3001:3001'  # Blocks Uptime-Kuma UI
  volumes:
    - ./nginx/monitoring-access-control.conf:/etc/nginx/conf.d/default.conf
```

## 🔐 Security & Access Control

### UI Access Blocking
- **Nginx Proxy**: Intercepts requests to ports 8081 and 3001
- **403 Responses**: Direct access returns JSON error with Nova redirect
- **Network Isolation**: Services only accessible within Nova network

### Authentication Flow
1. User authenticates with Nova (JWT)
2. Nova validates user permissions
3. User data automatically synced to monitoring services
4. API requests include Nova user context
5. All operations logged in Nova audit system

### Permission Model
```javascript
// GoAlert Permissions
'goalert:services:read'     // View services
'goalert:services:create'   // Create services
'goalert:alerts:acknowledge' // Acknowledge alerts
'goalert:admin:manage'      // Administrative access

// Uptime-Kuma Permissions
'uptime-kuma:monitors:read'  // View monitors
'uptime-kuma:monitors:create' // Create monitors
'uptime-kuma:admin:manage'   // Administrative access
```

## 📡 API Integration

### Nova API Endpoints

#### GoAlert Integration
```bash
# Services Management
GET    /api/v2/goalert/services
POST   /api/v2/goalert/services
PUT    /api/v2/goalert/services/:id
DELETE /api/v2/goalert/services/:id

# Alert Management
GET    /api/v2/goalert/alerts
POST   /api/v2/goalert/alerts
POST   /api/v2/goalert/alerts/:id/acknowledge
POST   /api/v2/goalert/alerts/:id/close

# Administration
GET    /api/v2/goalert/admin/health
POST   /api/v2/goalert/admin/sync-users
```

#### Uptime-Kuma Integration
```bash
# Monitor Management
GET    /api/v1/uptime-kuma/monitors
GET    /api/v1/uptime-kuma/monitors/:id
POST   /api/v1/uptime-kuma/monitors
PUT    /api/v1/uptime-kuma/monitors/:id

# Administration
GET    /api/v1/uptime-kuma/admin/health
POST   /api/v1/uptime-kuma/admin/sync-monitors
```

### User Synchronization API
```bash
# Sync all users to monitoring services
POST /api/v2/goalert/admin/sync-users
POST /api/v1/uptime-kuma/admin/sync-monitors

# Health checks
GET /api/v2/goalert/admin/health
GET /api/v1/uptime-kuma/admin/health
```

## 🖥️ Nova Unified UI Integration

### Monitoring Dashboard
- **Real-time Status**: Live monitor status from Uptime-Kuma data
- **Performance Metrics**: Response times, uptime percentages
- **Alert Management**: GoAlert alerts with acknowledge/close actions
- **On-call Schedule**: Current on-call assignments from GoAlert

### UI Components
```javascript
// React components in Nova Unified UI
<MonitoringDashboard />     // Main monitoring overview
<AlertsPanel />            // Active alerts from GoAlert
<UptimeMetrics />          // Uptime statistics
<OnCallSchedule />         // Current on-call assignments
<ServiceHealth />          // Service health indicators
```

### Screenshots Integration
The unified UI provides complete visual coverage:
- Monitor status dashboards
- Alert management interfaces  
- Performance analytics
- Configuration management
- User preference panels

## 🔄 Data Synchronization

### Automatic Sync Triggers
```sql
-- User sync trigger
CREATE TRIGGER sync_user_to_goalert_trigger
    AFTER INSERT OR UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_to_goalert();

-- Monitor sync trigger  
CREATE TRIGGER sync_monitor_to_uptime_kuma_trigger
    AFTER INSERT OR UPDATE ON public.monitors
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_monitor_to_uptime_kuma();
```

### Manual Sync Commands
```bash
# Sync all users to GoAlert
curl -X POST http://localhost:3000/api/v2/goalert/admin/sync-users \
  -H "Authorization: Bearer $JWT_TOKEN"

# Sync all monitors to Uptime-Kuma
curl -X POST http://localhost:3000/api/v1/uptime-kuma/admin/sync-monitors \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## 📈 Monitoring & Health Checks

### Service Health Endpoints
```bash
# Check GoAlert integration health
curl http://localhost:3000/api/v2/goalert/admin/health

# Check Uptime-Kuma integration health  
curl http://localhost:3000/api/v1/uptime-kuma/admin/health
```

### Health Check Response
```json
{
  "success": true,
  "health": {
    "goalert_api": {"status": "healthy", "message": "API accessible"},
    "database": {"status": "healthy", "message": "Database accessible"},
    "user_sync": {
      "status": "healthy",
      "total_users": 25,
      "synced_users": 25,
      "failed_users": 0,
      "last_sync": "2024-01-01T12:00:00Z"
    },
    "overall_status": "healthy"
  }
}
```

### Performance Monitoring
- **Database Views**: Pre-computed performance metrics
- **Materialized Views**: Cached uptime statistics  
- **Audit Logging**: Complete activity tracking
- **Error Monitoring**: Failed sync detection and retry

## 🛠️ Troubleshooting

### Common Issues

#### User Sync Failures
```bash
# Check sync status
SELECT nova_user_id, sync_status, last_sync_at 
FROM goalert.users 
WHERE sync_status = 'failed';

# Manual resync
SELECT goalert.sync_nova_user_to_goalert(nova_user_id) 
FROM goalert.users 
WHERE sync_status = 'failed';
```

#### Monitor Sync Issues
```bash
# Check monitor sync status
SELECT nova_monitor_id, sync_status, name
FROM uptime_kuma.monitors
WHERE sync_status = 'failed';

# Manual monitor resync
SELECT uptime_kuma.sync_nova_monitor_to_kuma(id)
FROM monitors
WHERE url IS NOT NULL;
```

#### Service Connectivity
```bash
# Test GoAlert connectivity
docker exec nova-goalert curl -f http://localhost:8081/api/v2/user/profile

# Test Uptime-Kuma connectivity  
docker exec nova-uptime-kuma-backend curl -f http://localhost:3001/api/ping

# Check database connectivity
docker exec nova-postgres psql -U nova_admin -d nova_universe -c "SELECT COUNT(*) FROM goalert.users;"
```

### Log Analysis
```bash
# GoAlert logs
docker logs nova-goalert

# Uptime-Kuma logs
docker logs nova-uptime-kuma-backend

# Nova API logs (monitoring integration)
docker logs nova-api | grep -E "(goalert|uptime-kuma)"

# Access control logs
docker logs nova-access-control
```

## 🔒 Security Considerations

### Network Security
- Services bound to internal Docker network only
- No direct external access to monitoring service UIs
- Nginx proxy blocks unauthorized access attempts

### Data Security
- All sensitive data encrypted in Nova database
- API keys and tokens stored securely
- Audit logging for all administrative actions

### Access Control
- Role-based permissions enforced at API level
- User context passed to all monitoring operations
- Session management through Nova authentication system

## 📚 Additional Resources

### API Documentation
- GoAlert API: Available through Nova's OpenAPI spec at `/api/docs`
- Uptime-Kuma API: Integrated endpoints documented in Nova API
- Complete Swagger documentation at `http://localhost:3000/api/docs`

### Database Documentation
- Schema documentation in migration files
- View definitions for performance queries
- Function documentation for sync operations

### Development Guidelines
- Extend monitoring features through Nova API
- Add new monitoring services using similar integration pattern
- Maintain database schema migrations for new features

---

## ✅ Deployment Checklist

- [ ] Environment variables configured (`.env.monitoring`)
- [ ] Database migrations applied
- [ ] Docker network created (`nova-network`)
- [ ] Monitoring services started
- [ ] User synchronization verified
- [ ] Monitor synchronization verified
- [ ] Direct UI access blocked (ports 8081, 3001)
- [ ] Nova UI monitoring dashboards accessible
- [ ] Health checks passing
- [ ] Audit logging enabled
- [ ] Backup procedures configured

This integration provides a complete, production-ready monitoring and alerting solution with Nova Universe as the single source of truth for all user management and configuration data.