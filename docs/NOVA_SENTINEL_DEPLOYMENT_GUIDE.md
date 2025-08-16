# Nova Sentinel Monitoring System - Deployment Guide

## 🚀 Complete Implementation Overview

Nova Sentinel has been **fully implemented** with Apple-inspired design across all three Nova Universe applications. The system provides enterprise-grade uptime monitoring with comprehensive notification capabilities.

### ✅ Implementation Status

**All phases completed successfully:**

- ✅ **Database Infrastructure**: 7-table PostgreSQL schema with monitoring, incidents, subscriptions, heartbeats, maintenance, groups, and status page configuration
- ✅ **API Integration**: Complete Uptime Kuma integration with webhook processing and real-time synchronization
- ✅ **User Interfaces**: Apple-inspired monitoring dashboards for Core (admin), Pulse (technician), and Orbit (end-user)
- ✅ **Notification System**: Multi-channel notifications (Email, SMS, Slack, Discord, Webhook) with templating
- ✅ **TypeScript Integration**: Full type safety with comprehensive monitoring type definitions
- ✅ **Docker Infrastructure**: Production-ready containerized deployment with health checks

## 🏗️ Architecture Components

### Backend Services

- **Nova API**: Enhanced with monitoring endpoints and Kuma integration
- **Uptime Kuma**: Headless monitoring backend (port 3001)
- **Redis**: Caching layer for monitoring data (port 6379)
- **Grafana**: Advanced visualization and dashboards (port 3002)

### Frontend Applications

- **Nova Core**: Administrator monitoring dashboard with full system control
- **Nova Pulse**: Technician interface for incident response and monitoring oversight
- **Nova Orbit**: Public status page for end-user service transparency

### Database Schema

```
monitors                  - Core monitoring configurations
monitor_incidents         - Incident tracking and management
monitor_subscriptions     - User notification preferences
monitor_heartbeats        - Real-time monitoring data
monitor_maintenance       - Scheduled maintenance windows
monitor_groups           - Monitor organization and grouping
monitor_group_members    - Group membership relationships
status_page_configs      - Public status page customization
```

## 🚀 Deployment Instructions

### 1. Environment Setup

Copy the monitoring environment template:

```bash
cp .env.monitoring .env.local
```

Configure the following required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nova_universe

# Uptime Kuma Integration
UPTIME_KUMA_URL=http://localhost:3001
UPTIME_KUMA_API_KEY=your_api_key_here

# Notification Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASS=your_app_password
SMTP_FROM="Nova Sentinel <notifications@yourdomain.com>"

# Optional: SMS Notifications
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URLs
FRONTEND_URL=http://localhost:3000
```

### 2. Database Migration

Run the monitoring system migration:

```bash
cd apps/api
npm run db:migrate
```

This creates all 7 monitoring tables with proper relationships and indexes.

### 3. Start Monitoring Stack

Deploy the complete monitoring infrastructure:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts:

- Uptime Kuma (localhost:3001)
- Redis cache (localhost:6379)
- Grafana dashboards (localhost:3002)

### 4. Configure Uptime Kuma

1. Access Uptime Kuma at `http://localhost:3001`
2. Complete initial setup and create admin account
3. Navigate to Settings → API Keys
4. Generate an API key and update your `.env.local`
5. Set webhook URL to: `http://your-domain:3000/api/monitoring/events`

### 5. Start Nova Universe Applications

Start all three applications:

```bash
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Core (Admin)
cd apps/core/nova-core && npm run dev

# Terminal 3 - Pulse (Technician)
cd apps/pulse/nova-pulse && npm run dev

# Terminal 4 - Orbit (End-user)
cd apps/orbit && npm run dev
```

## 🎯 Application URLs

- **Nova Core (Admin)**: `http://localhost:3000/monitoring`
- **Nova Pulse (Technician)**: `http://localhost:3001/monitoring`
- **Nova Orbit (Public Status)**: `http://localhost:3002/status`
- **Uptime Kuma**: `http://localhost:3001`
- **Grafana**: `http://localhost:3002` (admin/admin)

## 🔧 Configuration

### Setting Up Monitors

1. **Via Nova Core Admin Interface:**
   - Navigate to Monitoring → Monitors
   - Click "Add Monitor"
   - Configure monitoring target (HTTP, TCP, Ping, DNS, SSL)
   - Set check intervals and notification preferences

2. **Monitor Types Supported:**
   - **HTTP/HTTPS**: Website and API endpoint monitoring
   - **TCP**: Port connectivity monitoring
   - **Ping**: Network connectivity monitoring
   - **DNS**: DNS resolution monitoring
   - **SSL**: Certificate expiration monitoring

### Notification Channels

Configure notification channels in Nova Core:

1. **Email Notifications:**
   - SMTP configuration in environment variables
   - HTML email templates with Apple design
   - Individual and group subscriptions

2. **SMS Notifications:**
   - Twilio integration for SMS alerts
   - Emergency escalation capabilities
   - International number support

3. **Slack Integration:**
   - Webhook-based Slack notifications
   - Rich message formatting
   - Channel-specific routing

4. **Discord Integration:**
   - Discord webhook support
   - Embed-based rich notifications
   - Server and channel targeting

5. **Custom Webhooks:**
   - HTTP POST notifications to any endpoint
   - HMAC signature verification
   - Configurable payloads and headers

### Public Status Page

Configure the public status page in Nova Core:

- Custom branding and logos
- Service group organization
- Incident history display
- Maintenance schedule visibility
- Subscription management for end users

## 🎨 Apple Design Implementation

All interfaces follow Apple's design principles:

### Design System Features

- **SF Pro Typography**: System font stack with proper weights
- **Semantic Colors**: Blue (primary), green (success), orange (warning), red (critical)
- **Spatial Consistency**: 8pt grid system with consistent spacing
- **Visual Hierarchy**: Clear information architecture with proper contrast
- **Accessibility**: WCAG compliant with proper focus states and screen reader support

### Component Library

- Glass morphism effects with backdrop blur
- Smooth animations and micro-interactions
- Consistent button styles and form elements
- Responsive layout with adaptive design
- Dark mode support (planned)

## 📊 Monitoring Dashboard Features

### Nova Core (Administrator)

- **System Overview**: Real-time statistics and health indicators
- **Monitor Management**: Full CRUD operations for monitoring configurations
- **Incident Response**: Complete incident lifecycle management
- **Notification Settings**: Channel configuration and template management
- **Analytics**: Uptime trends and performance metrics

### Nova Pulse (Technician)

- **Incident Dashboard**: Active incident prioritization and response
- **Monitor Status Grid**: Real-time status across all monitors
- **Quick Actions**: Rapid incident acknowledgment and resolution
- **Performance Insights**: Response time trends and availability metrics

### Nova Orbit (End User)

- **Service Status**: Current operational status display
- **Incident History**: Public incident timeline and updates
- **Maintenance Schedule**: Upcoming and current maintenance windows
- **Subscription Management**: User notification preferences

## 🔒 Security Features

- **JWT Authentication**: Secure API access with role-based permissions
- **Webhook Signatures**: HMAC verification for incoming webhooks
- **Tenant Isolation**: Multi-tenant data scoping and access control
- **Input Validation**: Comprehensive request validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Redis Caching**: Real-time data caching for dashboard performance
- **Lazy Loading**: Component-based lazy loading for faster page loads
- **API Pagination**: Efficient data loading with pagination support

## 🧪 Testing

Run the validation script to ensure proper deployment:

```bash
./validate-implementation.sh
```

For comprehensive testing including Docker services:

```bash
./test-monitoring-stack.sh
```

## 📚 API Documentation

Comprehensive API documentation is available at:

- Swagger UI: `http://localhost:3000/api-docs`
- Monitor endpoints: `/api/monitoring/monitors`
- Incident endpoints: `/api/monitoring/incidents`
- Notification endpoints: `/api/monitoring/notifications`
- Webhook endpoints: `/api/monitoring/events`

## 🆘 Troubleshooting

### Common Issues

1. **Uptime Kuma Not Responding:**
   - Check Docker container status: `docker ps`
   - Verify port 3001 is available
   - Check Kuma logs: `docker logs nova-monitoring-kuma`

2. **Database Connection Issues:**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Run migration: `npm run db:migrate`

3. **Notification Failures:**
   - Validate SMTP/Twilio credentials
   - Check notification service logs
   - Test individual channels via admin interface

4. **Frontend Build Errors:**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript compilation: `npm run type-check`
   - Verify environment variables

### Support

For additional support or feature requests:

- Review logs in `apps/api/error.log`
- Check browser console for frontend issues
- Validate environment configuration
- Ensure all dependencies are installed

## 🎉 Deployment Complete!

Nova Sentinel is now fully operational with:

- ✅ Complete monitoring infrastructure
- ✅ Apple-inspired user interfaces
- ✅ Multi-channel notification system
- ✅ Real-time incident management
- ✅ Public status page
- ✅ Enterprise-grade security

The system is ready for production use and can scale to monitor hundreds of services across multiple tenants with comprehensive notification and incident management capabilities.
