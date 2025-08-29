# Nova Unified Monitoring - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly implement the Nova Unified Monitoring & Alerting integration to consolidate Nova-Sentinel and Nova-Alert into a single platform.

## Prerequisites

- ✅ PostgreSQL database with Nova Universe
- ✅ Nova API running (apps/api)
- ✅ Nova Unified UI running (apps/unified)
- ✅ Database credentials ready

## Step 1: Run the Integration Script

```bash
# Navigate to project root
cd /path/to/nova-universe

# Set your database credentials
export DB_PASSWORD="your_actual_password"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="nova_universe"
export DB_USER="nova_user"

# Make script executable and run
chmod +x scripts/unified-monitoring-integration.sh
./scripts/unified-monitoring-integration.sh
```

**Expected Output:**

```
================================
Nova Unified Monitoring Integration
================================

Checking database connection...
Database connection successful
Creating backup directory...
Backup directory created: /path/to/backups/unified-monitoring-20250120_143022
Backing up existing monitoring and alerting data...
Creating unified monitoring schema...
Unified monitoring schema created successfully
Migrating existing Uptime Kuma data...
Migrating existing GoAlert data...
Creating initial configuration...
Initial configuration created successfully
Verifying integration...
✓ Integration verification completed
  - Monitors: 0
  - Alerts: 0

================================
Integration completed successfully!
================================
```

## Step 2: Verify the Integration

### Check Database Tables

```bash
# Connect to your database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# List new tables
\dt monitors
\dt nova_alerts
\dt monitor_incidents
\dt monitor_heartbeats
\dt monitor_maintenance
\dt oncall_schedules
\dt notification_channels
\dt escalation_policies

# Exit psql
\q
```

### Test API Endpoints

```bash
# Test system health endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v2/monitoring/system-health

# Test monitors endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v2/monitoring/monitors

# Test alerts endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v2/monitoring/alerts
```

## Step 3: Access the Unified Dashboard

1. **Open your browser** and navigate to the Nova Unified UI
2. **Go to** `/monitoring`
3. **You should see** the new Unified Monitoring Dashboard with:
   - Overview tab with system health metrics
   - Monitors tab for service monitoring
   - Alerts tab for incident management
   - On-Call tab for schedule management
   - Maintenance tab for maintenance windows

## Step 4: Create Your First Monitor

### Via API

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova API Health Check",
    "type": "http",
    "url": "http://localhost:3000/api/v2/health",
    "interval_seconds": 60,
    "timeout_seconds": 30,
    "tags": ["api", "health", "nova"]
  }' \
  http://localhost:3000/api/v2/monitoring/monitors
```

### Via UI

1. Go to **Monitoring** → **Monitors** tab
2. Click **Add Monitor** button
3. Fill in the form:
   - **Name**: Nova API Health Check
   - **Type**: HTTP
   - **URL**: `http://localhost:3000/api/v2/health`
   - **Interval**: 60 seconds
   - **Tags**: api, health, nova
4. Click **Create Monitor**

## Step 5: Test Real-Time Updates

1. **Open the monitoring dashboard** in one browser tab
2. **Create or update a monitor** in another tab
3. **Watch for real-time updates** in the dashboard
4. **Check WebSocket connections** in browser dev tools

## Step 6: Configure Legacy System Integration

### Update Environment Variables

```bash
# Add to your .env file
UPTIME_KUMA_URL=http://localhost:3001
GOALERT_URL=http://localhost:8081
UNIFIED_MONITORING_ENABLED=true
LEGACY_API_ENABLED=true
```

### Test Legacy Integration

```bash
# Test Uptime Kuma proxy (still works)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/uptime-kuma/monitors

# Test GoAlert proxy (still works)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v2/goalert/alerts
```

## Step 7: Verify Everything Works

### Checklist

- [ ] Unified dashboard loads correctly
- [ ] Can create new monitors
- [ ] Real-time updates work
- [ ] Legacy APIs still function
- [ ] Database tables created
- [ ] API endpoints respond
- [ ] WebSocket connections established

## Troubleshooting

### Common Issues

#### "Database connection failed"

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;"
```

#### "API endpoint not found"

```bash
# Check if Nova API is running
curl http://localhost:3000/api/v2/health

# Verify API routes are loaded
grep -r "unified-monitoring" apps/api/index.js
```

#### "WebSocket connection failed"

```bash
# Check WebSocket configuration
grep -r "websocket" apps/api/index.js

# Verify port configuration
netstat -an | grep :3000
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG_MONITORING=true
export LOG_LEVEL=debug
export DB_VERBOSE_LOGGING=true

# Restart services and check logs
tail -f logs/api.log
tail -f logs/server.log
```

## Next Steps

### Immediate Actions

1. **Test all functionality** thoroughly
2. **Create sample monitors** for your services
3. **Configure notification channels**
4. **Set up escalation policies**

### Short Term (1-2 weeks)

1. **Migrate existing monitors** from legacy systems
2. **Train users** on new interface
3. **Configure monitoring policies**
4. **Set up alerting rules**

### Medium Term (1-2 months)

1. **Deprecate legacy UIs**
2. **Remove old API endpoints**
3. **Optimize performance**
4. **Add advanced features**

## Support

### Getting Help

- **Documentation**: `docs/UNIFIED_MONITORING_INTEGRATION.md`
- **Integration Script**: `scripts/unified-monitoring-integration.sh`
- **API Routes**: `apps/api/routes/unified-monitoring.js`
- **UI Components**: `apps/unified/src/pages/monitoring/`

### Quick Commands

```bash
# Check integration status
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM monitors;"

# View recent alerts
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM nova_alerts ORDER BY created_at DESC LIMIT 5;"

# Check system health
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v2/monitoring/system-health
```

## Success Indicators

You've successfully implemented the unified monitoring integration when:

✅ **Unified dashboard** loads and displays correctly  
✅ **New monitors** can be created and managed  
✅ **Real-time updates** work via WebSocket  
✅ **Legacy APIs** continue to function  
✅ **Database schema** is properly created  
✅ **All endpoints** respond correctly  
✅ **Users can access** monitoring functions

## 🎉 Congratulations!

You've successfully consolidated Nova-Sentinel and Nova-Alert into a unified Nova platform! Your users now have a single, cohesive interface for all monitoring and alerting needs.

**Next**: Explore the advanced features, configure monitoring policies, and start migrating your existing monitoring infrastructure to the new unified system.

---

_Need help? Check the full documentation at `docs/UNIFIED_MONITORING_INTEGRATION.md` or contact the Nova development team._
