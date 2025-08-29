# Nova Unified Monitoring & Alerting Integration

## Overview

This document outlines the comprehensive integration strategy to unify Nova-Sentinel (Uptime Kuma) and Nova-Alert (GoAlert) into a single cohesive Nova platform. The integration eliminates the need for separate UIs, databases, and APIs while maintaining full functionality and providing a seamless user experience.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nova Unified Platform                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Unified UI    │  │  Unified API    │  │ Unified Database│ │
│  │                 │  │                 │  │                 │ │
│  │ • Monitoring    │  │ • /monitoring   │  │ • monitors      │ │
│  │ • Alerting      │  │ • /alerts       │  │ • nova_alerts   │ │
│  │ • On-Call       │  │ • /system-health│  │ • incidents     │ │
│  │ • Maintenance   │  │ • /oncall       │  │ • maintenance   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Legacy System Integration                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                    ┌─────────────────┐   │
│  │ Nova-Sentinel   │                    │   Nova-Alert    │   │
│  │ (Uptime Kuma)   │                    │   (GoAlert)     │   │
│  │                 │                    │                 │   │
│  │ • Monitoring    │                    │ • Alerting      │   │
│  │ • Uptime        │                    │ • On-Call       │   │
│  │ • Status Pages  │                    │ • Escalation    │   │
│  └─────────────────┘                    └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Benefits

### 1. **Unified User Experience**

- Single interface for all monitoring and alerting functions
- Consistent design language and user workflows
- Integrated dashboard with real-time updates

### 2. **Simplified Management**

- One database to maintain and backup
- Single authentication system
- Unified configuration management

### 3. **Enhanced Functionality**

- Cross-system alert correlation
- Unified escalation policies
- Integrated incident management
- Real-time system health overview

### 4. **Operational Efficiency**

- Reduced system complexity
- Lower maintenance overhead
- Faster incident response
- Better resource utilization

## Implementation Strategy

### Phase 1: Database Consolidation

- [x] Create unified monitoring schema
- [x] Migrate existing Uptime Kuma data
- [x] Migrate existing GoAlert data
- [x] Establish data relationships

### Phase 2: API Unification

- [x] Create unified monitoring API endpoints
- [x] Implement data transformation layers
- [x] Add authentication and authorization
- [x] Enable real-time updates

### Phase 3: UI Integration

- [x] Build unified monitoring dashboard
- [x] Integrate with existing Nova UI
- [x] Add real-time monitoring widgets
- [x] Implement alert management interface

### Phase 4: Legacy System Deprecation

- [ ] Redirect legacy UIs to unified interface
- [ ] Deprecate old API endpoints
- [ ] Remove legacy database tables
- [ ] Update documentation and training

## Database Schema

### Core Tables

#### `monitors`

Central table for all monitoring targets, regardless of source system.

```sql
CREATE TABLE monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kuma_id VARCHAR(255) UNIQUE,           -- Uptime Kuma reference
    goalert_service_id VARCHAR(255),       -- GoAlert reference
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,             -- http, tcp, ping, dns, push, ssl
    url TEXT,                              -- For HTTP/TCP monitors
    hostname VARCHAR(255),                 -- For ping/DNS monitors
    port INTEGER,                          -- For TCP monitors
    status VARCHAR(20) DEFAULT 'active',   -- up, down, degraded, maintenance
    alert_enabled BOOLEAN DEFAULT true,
    escalation_policy_id VARCHAR(255),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `nova_alerts`

Unified alert store that consolidates alerts from all sources.

```sql
CREATE TABLE nova_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID REFERENCES monitors(id),
    goalert_alert_id VARCHAR(255),         -- GoAlert reference
    summary TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,         -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'active',   -- active, acknowledged, resolved
    source VARCHAR(50) NOT NULL,           -- monitoring, manual, api, automated
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    tags VARCHAR(255)[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `monitor_incidents`

Track and manage monitoring incidents with ticket integration.

```sql
CREATE TABLE monitor_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id),
    ticket_id UUID,                        -- Link to Nova ticketing
    status VARCHAR(20) DEFAULT 'open',     -- open, acknowledged, investigating, resolved
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    summary TEXT,                          -- AI-generated summary
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Supporting Tables

- **`monitor_heartbeats`** - Historical uptime and performance data
- **`monitor_maintenance`** - Scheduled maintenance windows
- **`oncall_schedules`** - On-call rotation management
- **`notification_channels`** - Unified notification configuration
- **`escalation_policies`** - Configurable alert escalation rules

## API Endpoints

### Unified Monitoring API (v2)

#### Monitor Management

```
GET    /api/v2/monitoring/monitors          # List all monitors
GET    /api/v2/monitoring/monitors/:id      # Get specific monitor
POST   /api/v2/monitoring/monitors          # Create new monitor
PATCH  /api/v2/monitoring/monitors/:id      # Update monitor
DELETE /api/v2/monitoring/monitors/:id      # Delete monitor
```

#### Alert Management

```
GET    /api/v2/monitoring/alerts            # List all alerts
GET    /api/v2/monitoring/alerts/:id        # Get specific alert
POST   /api/v2/monitoring/alerts/:id/ack   # Acknowledge alert
POST   /api/v2/monitoring/alerts/:id/resolve # Resolve alert
```

#### System Health

```
GET    /api/v2/monitoring/system-health     # Overall system health
GET    /api/v2/monitoring/oncall-schedules  # On-call schedules
GET    /api/v2/monitoring/maintenance       # Maintenance windows
```

### Legacy API Support (v1)

Legacy endpoints remain available for backward compatibility:

```
GET    /api/v1/uptime-kuma/monitors        # Legacy Uptime Kuma
GET    /api/v1/goalert/alerts              # Legacy GoAlert
```

## User Interface

### Unified Monitoring Dashboard

The unified dashboard provides a comprehensive view of all monitoring and alerting functions:

#### Overview Tab

- System health metrics
- Active monitor count
- Alert summary
- Performance indicators
- Quick action buttons

#### Monitors Tab

- List all monitoring targets
- Real-time status updates
- Monitor configuration
- Performance metrics
- Maintenance scheduling

#### Alerts Tab

- Active and historical alerts
- Severity-based filtering
- Assignment and escalation
- Resolution tracking
- Alert correlation

#### On-Call Tab

- Current on-call schedules
- User assignments
- Schedule management
- Contact information

#### Maintenance Tab

- Scheduled maintenance windows
- Affected services
- Status tracking
- Notification management

### Real-Time Updates

The interface provides real-time updates through WebSocket connections:

- Monitor status changes
- New alert notifications
- System health updates
- Maintenance window events

## Data Migration

### Migration Process

1. **Backup Existing Data**
   - Create full backups of current systems
   - Verify backup integrity
   - Document current configurations

2. **Schema Creation**
   - Deploy unified database schema
   - Create indexes and constraints
   - Set up triggers and functions

3. **Data Migration**
   - Migrate Uptime Kuma monitors
   - Migrate GoAlert alerts and schedules
   - Preserve data relationships
   - Validate data integrity

4. **Verification**
   - Test all functionality
   - Verify data accuracy
   - Performance testing
   - User acceptance testing

### Migration Script

Use the provided integration script to automate the migration:

```bash
# Set database credentials
export DB_PASSWORD="your_password"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="nova_universe"
export DB_USER="nova_user"

# Run integration script
./scripts/unified-monitoring-integration.sh
```

## Configuration

### Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nova_universe
DB_USER=nova_user
DB_PASSWORD=your_secure_password

# Service URLs (for legacy integration)
UPTIME_KUMA_URL=http://localhost:3001
GOALERT_URL=http://localhost:8081

# API Configuration
UNIFIED_MONITORING_ENABLED=true
LEGACY_API_ENABLED=true
REAL_TIME_UPDATES_ENABLED=true
```

### Service Configuration

#### Nova-Sentinel Integration

```json
{
  "service_name": "uptime_kuma",
  "config": {
    "base_url": "http://localhost:3001",
    "api_key": "your_api_key",
    "sync_interval": 300,
    "enabled": true
  }
}
```

#### Nova-Alert Integration

```json
{
  "service_name": "goalert",
  "config": {
    "base_url": "http://localhost:8081",
    "api_key": "your_api_key",
    "sync_interval": 300,
    "enabled": true
  }
}
```

## Testing

### Integration Testing

1. **API Endpoint Testing**
   - Verify all endpoints respond correctly
   - Test authentication and authorization
   - Validate data formats and schemas

2. **Data Migration Testing**
   - Confirm all data migrated correctly
   - Verify data relationships
   - Test data integrity constraints

3. **Functionality Testing**
   - Monitor creation and management
   - Alert generation and handling
   - On-call schedule management
   - Maintenance window scheduling

4. **Performance Testing**
   - Response time benchmarks
   - Database query performance
   - Real-time update latency
   - System resource usage

### User Acceptance Testing

1. **End-User Scenarios**
   - Monitor status checking
   - Alert acknowledgment and resolution
   - On-call schedule viewing
   - Maintenance window creation

2. **Administrator Scenarios**
   - System configuration
   - User management
   - Policy configuration
   - System monitoring

## Deployment

### Production Deployment

1. **Pre-Deployment Checklist**
   - [ ] Complete testing in staging environment
   - [ ] Backup production databases
   - [ ] Schedule maintenance window
   - [ ] Prepare rollback plan

2. **Deployment Steps**
   - [ ] Deploy unified schema
   - [ ] Migrate production data
   - [ ] Deploy updated applications
   - [ ] Update API routing
   - [ ] Verify functionality

3. **Post-Deployment**
   - [ ] Monitor system performance
   - [ ] Verify all functionality
   - [ ] Update documentation
   - [ ] Train users

### Rollback Plan

If issues arise during deployment:

1. **Immediate Rollback**
   - Restore original database from backup
   - Revert API routing changes
   - Restart legacy services

2. **Data Recovery**
   - Verify backup integrity
   - Restore user data
   - Re-establish configurations

3. **Investigation**
   - Analyze failure points
   - Document lessons learned
   - Plan revised deployment

## Monitoring and Maintenance

### System Monitoring

- **Database Performance**: Monitor query performance and connection usage
- **API Response Times**: Track endpoint response times and error rates
- **Real-Time Updates**: Monitor WebSocket connection health
- **Resource Usage**: Track CPU, memory, and disk usage

### Regular Maintenance

- **Data Cleanup**: Archive old heartbeat and alert data
- **Index Optimization**: Monitor and optimize database indexes
- **Performance Tuning**: Adjust configuration based on usage patterns
- **Security Updates**: Keep authentication and authorization systems current

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connectivity
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# Verify database permissions
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\du"
```

#### API Endpoint Issues

```bash
# Test API endpoints
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/v2/monitoring/system-health

# Check API logs
tail -f logs/api.log
```

#### Real-Time Update Issues

```bash
# Check WebSocket connections
netstat -an | grep :3000 | grep ESTABLISHED

# Verify WebSocket configuration
grep -r "websocket" config/
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
export DEBUG_MONITORING=true
export LOG_LEVEL=debug
export DB_VERBOSE_LOGGING=true
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Predictive failure analysis
   - Performance trend analysis
   - Capacity planning insights

2. **AI-Powered Operations**
   - Automated incident classification
   - Intelligent alert correlation
   - Predictive maintenance scheduling

3. **Enhanced Integration**
   - Additional monitoring tools
   - Third-party service integration
   - Advanced notification channels

4. **Mobile Optimization**
   - Mobile-first dashboard design
   - Push notifications
   - Offline capability

### Scalability Improvements

1. **Database Optimization**
   - Partitioning for large datasets
   - Read replicas for reporting
   - Advanced caching strategies

2. **API Performance**
   - GraphQL implementation
   - Advanced caching
   - Rate limiting optimization

3. **Real-Time Updates**
   - WebSocket clustering
   - Message queuing
   - Event streaming

## Support and Documentation

### Getting Help

- **Documentation**: This document and related technical docs
- **Code Repository**: Source code and examples
- **Issue Tracking**: Bug reports and feature requests
- **Community**: Developer forums and discussions

### Contributing

1. **Code Contributions**
   - Follow coding standards
   - Include tests for new features
   - Update documentation

2. **Documentation Improvements**
   - Clarify unclear sections
   - Add examples and use cases
   - Improve troubleshooting guides

3. **Testing and Feedback**
   - Test new features
   - Report bugs and issues
   - Suggest improvements

## Conclusion

The Nova Unified Monitoring & Alerting Integration provides a comprehensive solution for consolidating monitoring and alerting systems into a single, cohesive platform. By following this implementation strategy, organizations can achieve:

- **Simplified Operations**: Single system to manage and maintain
- **Enhanced User Experience**: Unified interface for all functions
- **Improved Efficiency**: Better resource utilization and faster response times
- **Future-Proof Architecture**: Scalable foundation for growth and enhancement

The integration maintains backward compatibility while providing a clear path forward for modernizing monitoring and alerting operations. With careful planning and execution, this integration can significantly improve operational efficiency and user satisfaction.

For questions or support, please refer to the documentation or contact the Nova development team.
