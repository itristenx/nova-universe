# Nova-Alert (GoAlert) UI Removal Guide

## 🎯 **Objective**

This guide provides step-by-step instructions for safely removing the Nova-Alert native UI after confirming 100% feature parity has been achieved in the unified Nova platform.

## ⚠️ **Prerequisites**

### 1. **Feature Parity Verification**

- ✅ All GoAlert features are working in the unified system
- ✅ Service management is fully functional
- ✅ Integration keys are working correctly
- ✅ Heartbeat monitors are operational
- ✅ Escalation policies are functioning
- ✅ Schedule overrides are working
- ✅ Service labels and notices are operational
- ✅ Alert metrics are accessible

### 2. **System Requirements**

- Unified monitoring API is running and accessible
- Unified monitoring UI is accessible at `/monitoring`
- All GoAlert API endpoints are responding correctly
- Database migration has been completed successfully

### 3. **Backup Requirements**

- Full backup of Nova-Alert directory
- Database backup completed
- Configuration files backed up

## 🚀 **Removal Process**

### **Step 1: Pre-Removal Verification**

Run the automated verification script to ensure everything is working:

```bash
# Verify feature parity
./scripts/remove-nova-alert-ui.sh
```

The script will:

- Check prerequisites
- Verify all API endpoints
- Confirm unified system accessibility
- Create comprehensive backups

### **Step 2: Manual Verification (Optional)**

If you prefer manual verification, test these endpoints:

```bash
# Test unified monitoring API
curl -f "http://localhost:3000/api/v2/monitoring/system-health"
curl -f "http://localhost:3000/api/v2/monitoring/services"
curl -f "http://localhost:3000/api/v2/monitoring/integration-keys"
curl -f "http://localhost:3000/api/v2/monitoring/heartbeat-monitors"
curl -f "http://localhost:3000/api/v2/monitoring/escalation-policies"
curl -f "http://localhost:3000/api/v2/monitoring/schedule-overrides"
curl -f "http://localhost:3000/api/v2/monitoring/service-notices"
curl -f "http://localhost:3000/api/v2/monitoring/service-labels"
curl -f "http://localhost:3000/api/v2/monitoring/alert-metrics"

# Test unified UI
curl -f "http://localhost:3000/monitoring"
```

### **Step 3: Execute Removal**

Run the removal script:

```bash
./scripts/remove-nova-alert-ui.sh
```

**What the script removes:**

- Web UI source files (`web/`)
- UI build files (`dist/`, `build/`)
- UI configuration files
- UI dependencies from `package.json`
- UI scripts and build tools
- UI environment files
- UI documentation

**What the script preserves:**

- Core GoAlert functionality
- Database schemas and data
- API endpoints and logic
- Configuration files
- Logs and audit trails
- Go backend services

### **Step 4: Post-Removal Verification**

After removal, verify that:

1. **Unified API is working:**

   ```bash
   curl -f "http://localhost:3000/api/v2/monitoring/services"
   ```

2. **Unified UI is accessible:**

   ```bash
   curl -f "http://localhost:3000/monitoring"
   ```

3. **All GoAlert features work:**
   - Service creation and management
   - Integration key configuration
   - Heartbeat monitor setup
   - Escalation policy management
   - Schedule override creation
   - Service notice management

## 📁 **What Gets Removed**

### **UI Source Files**

- `apps/nova-alert/web/` - Complete React/GraphQL frontend
- `apps/nova-alert/dist/` - Built UI files
- `apps/nova-alert/build/` - Build artifacts

### **UI Configuration**

- `esbuild.config.js` - Build configuration
- `cypress.config.js` - Testing configuration
- `playwright.config.ts` - E2E testing
- `.storybook/` - Component documentation

### **UI Dependencies**

- React ecosystem (react, react-dom, react-redux)
- GraphQL clients (@apollo/client, urql)
- Material-UI components
- Build tools (esbuild, webpack)
- Testing frameworks (cypress, playwright)

### **UI Scripts**

- `dev` - Development server
- `build` - Production build
- `cypress` - Testing
- `storybook` - Component docs

## 🔒 **What Gets Preserved**

### **Core Functionality**

- Service management and configuration
- Integration key generation and management
- Heartbeat monitor functionality
- Escalation policy logic
- Schedule management and overrides
- Service labeling and categorization
- Service notice system
- Alert metrics and analytics

### **Data and Configuration**

- Database schemas and existing data
- API endpoints and business logic
- Configuration files and settings
- Logs and audit trails
- User permissions and roles

### **Backend Services**

- Go-based alerting engine
- Notification delivery system
- Database connections and queries
- Authentication and authorization
- Rate limiting and security

## 🔄 **Backup and Rollback**

### **Automatic Backup**

The removal script creates:

- Full directory backup in `backups/nova-alert-ui-YYYYMMDD-HHMMSS/`
- Original `package.json` backup
- Detailed removal summary
- Log file with all actions

### **Manual Rollback**

If rollback is needed:

```bash
# Restore from backup
cp -r backups/nova-alert-ui-YYYYMMDD-HHMMSS/* apps/nova-alert/

# Reinstall dependencies
cd apps/nova-alert
npm install
cd -

# Restart services
npm run dev
```

### **Database Rollback**

If database changes need reversal:

```bash
# Restore database from backup
pg_restore -d nova_universe backups/nova-alert-db-YYYYMMDD-HHMMSS.sql
```

## 🧪 **Testing Checklist**

### **Service Management**

- [ ] Create new service
- [ ] Edit existing service
- [ ] Delete service
- [ ] Assign escalation policy
- [ ] Configure service labels
- [ ] Update service status

### **Integration Keys**

- [ ] Generate new integration key
- [ ] Configure key settings
- [ ] Test key functionality
- [ ] Deactivate/reactivate key
- [ ] Delete integration key

### **Heartbeat Monitors**

- [ ] Create heartbeat monitor
- [ ] Configure health checks
- [ ] Test monitor functionality
- [ ] Update monitor settings
- [ ] Delete monitor

### **Escalation Policies**

- [ ] Create escalation policy
- [ ] Add escalation steps
- [ ] Configure timeouts
- [ ] Test escalation flow
- [ ] Update policy settings

### **Schedule Management**

- [ ] Create schedule
- [ ] Add schedule overrides
- [ ] Configure rotations
- [ ] Test schedule logic
- [ ] Update schedule settings

### **Service Operations**

- [ ] Create service notice
- [ ] Update service labels
- [ ] Manage service dependencies
- [ ] Test notification delivery
- [ ] Verify audit logging

## 📊 **Success Indicators**

### **API Endpoints**

- All `/api/v2/monitoring/*` endpoints respond correctly
- No 404 or 500 errors on GoAlert-specific routes
- Response times are acceptable (< 200ms)

### **UI Functionality**

- Unified dashboard loads without errors
- All GoAlert features are accessible
- No broken links or missing functionality
- Real-time updates work correctly

### **Data Integrity**

- All existing services are accessible
- Integration keys work correctly
- Escalation policies function properly
- Schedule overrides are applied correctly

### **Performance**

- No significant performance degradation
- Database queries are optimized
- Real-time updates are responsive
- UI interactions are smooth

## 🚨 **Troubleshooting**

### **Common Issues**

#### **API Endpoints Not Working**

```bash
# Check if unified monitoring router is loaded
grep -r "unifiedMonitoringRouter" apps/api/

# Verify route configuration
cat apps/api/index.js | grep -A 5 -B 5 "monitoring"
```

#### **UI Not Accessible**

```bash
# Check if route is configured in App.tsx
grep -r "UnifiedMonitoringDashboard" apps/unified/src/

# Verify component import
cat apps/unified/src/App.tsx | grep -A 3 -B 3 "monitoring"
```

#### **Missing Dependencies**

```bash
# Reinstall dependencies
cd apps/nova-alert
npm install
cd -

# Check for missing packages
npm list --depth=0
```

### **Recovery Steps**

1. **Stop the removal process** if issues arise
2. **Check logs** for specific error messages
3. **Verify prerequisites** are met
4. **Restore from backup** if necessary
5. **Fix underlying issues** before retrying

## 📈 **Post-Removal Benefits**

### **Unified Experience**

- Single interface for all monitoring and alerting
- Consistent user experience across features
- Integrated workflows and processes

### **Maintenance Efficiency**

- Single codebase to maintain
- Unified testing and deployment
- Consistent error handling and logging

### **Performance Improvements**

- Reduced resource usage
- Optimized database queries
- Faster response times

### **Security Enhancements**

- Unified authentication system
- Consistent permission model
- Centralized audit logging

## 🔮 **Future Enhancements**

### **Planned Improvements**

- Enhanced real-time notifications
- Advanced analytics and reporting
- Mobile-responsive design
- Dark mode support
- Customizable dashboards

### **Integration Opportunities**

- Additional monitoring tools
- Third-party service integrations
- Advanced automation workflows
- Machine learning insights

## 📞 **Support and Resources**

### **Documentation**

- [Unified Monitoring Integration Guide](UNIFIED_MONITORING_INTEGRATION.md)
- [Nova-Alert Feature Parity Checklist](NOVA_ALERT_FEATURE_PARITY_CHECKLIST.md)
- [Quick Start Guide](UNIFIED_MONITORING_QUICK_START.md)

### **Scripts and Tools**

- `scripts/remove-nova-alert-ui.sh` - Automated removal script
- `scripts/unified-monitoring-integration.sh` - Integration setup script

### **Verification Tools**

- API endpoint testing scripts
- Feature parity checklists
- Performance monitoring tools

## ✅ **Completion Checklist**

- [ ] Feature parity verification completed
- [ ] Prerequisites checked and confirmed
- [ ] Backup created successfully
- [ ] Removal script executed
- [ ] Post-removal verification passed
- [ ] All GoAlert features working
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Monitoring alerts configured

## 🎉 **Congratulations!**

You have successfully removed the Nova-Alert native UI and achieved a fully unified Nova platform. All GoAlert functionality is now available through the unified interface, providing a seamless experience for users and developers alike.

The unified platform now offers:

- **Single interface** for all monitoring and alerting needs
- **Consistent API** for all operations
- **Unified authentication** and permissions
- **Integrated workflows** across features
- **Enhanced performance** and reliability

Your Nova platform is now ready for production use with a clean, unified architecture that eliminates redundancy while preserving all functionality.
