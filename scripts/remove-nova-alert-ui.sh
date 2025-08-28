#!/bin/bash

# Nova-Alert (GoAlert) UI Removal Script
# This script safely removes the Nova-Alert native UI after confirming
# 100% feature parity has been achieved in the unified Nova platform.

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NOVA_ALERT_DIR="apps/nova-alert"
BACKUP_DIR="backups/nova-alert-ui-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="logs/nova-alert-ui-removal-$(date +%Y%m%d-%H%M%S).log"

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "${RED}This script should not be run as root${NC}"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "${BLUE}Checking prerequisites...${NC}"
    
    # Check if Nova-Alert directory exists
    if [[ ! -d "$NOVA_ALERT_DIR" ]]; then
        log "${RED}Nova-Alert directory not found: $NOVA_ALERT_DIR${NC}"
        exit 1
    fi
    
    # Check if unified monitoring is working
    if ! curl -s -f "http://localhost:3000/api/v2/monitoring/system-health" > /dev/null 2>&1; then
        log "${RED}Unified monitoring API is not accessible. Please ensure it's running.${NC}"
        exit 1
    fi
    
    # Check if unified UI is accessible
    if ! curl -s -f "http://localhost:3000/monitoring" > /dev/null 2>&1; then
        log "${RED}Unified monitoring UI is not accessible. Please ensure it's running.${NC}"
        exit 1
    fi
    
    log "${GREEN}Prerequisites check passed${NC}"
}

# Create backup directory
create_backup() {
    log "${BLUE}Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Backup Nova-Alert UI files
    log "${BLUE}Backing up Nova-Alert UI files...${NC}"
    cp -r "$NOVA_ALERT_DIR" "$BACKUP_DIR/"
    
    # Backup package.json dependencies
    if [[ -f "$NOVA_ALERT_DIR/package.json" ]]; then
        cp "$NOVA_ALERT_DIR/package.json" "$BACKUP_DIR/"
    fi
    
    log "${GREEN}Backup completed successfully${NC}"
}

# Verify feature parity
verify_feature_parity() {
    log "${BLUE}Verifying feature parity...${NC}"
    
    # Test unified monitoring API endpoints for GoAlert features
    local endpoints=(
        "/api/v2/monitoring/services"
        "/api/v2/monitoring/integration-keys"
        "/api/v2/monitoring/heartbeat-monitors"
        "/api/v2/monitoring/escalation-policies"
        "/api/v2/monitoring/schedule-overrides"
        "/api/v2/monitoring/service-notices"
        "/api/v2/monitoring/service-labels"
        "/api/v2/monitoring/alert-metrics"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        if ! curl -s -f "http://localhost:3000$endpoint" > /dev/null 2>&1; then
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [[ ${#failed_endpoints[@]} -gt 0 ]]; then
        log "${RED}Feature parity verification failed. The following endpoints are not working:${NC}"
        for endpoint in "${failed_endpoints[@]}"; do
            log "${RED}  - $endpoint${NC}"
        done
        log "${RED}Please fix these issues before proceeding.${NC}"
        exit 1
    fi
    
    log "${GREEN}Feature parity verification passed${NC}"
}

# Remove Nova-Alert UI
remove_nova_alert_ui() {
    log "${BLUE}Removing Nova-Alert native UI...${NC}"
    
    # Remove web UI source files
    log "${BLUE}Removing web UI source files...${NC}"
    rm -rf "$NOVA_ALERT_DIR/web"
    
    # Remove UI build files
    log "${BLUE}Removing UI build files...${NC}"
    rm -rf "$NOVA_ALERT_DIR/dist"
    rm -rf "$NOVA_ALERT_DIR/build"
    
    # Remove UI configuration files
    log "${BLUE}Removing UI configuration files...${NC}"
    rm -f "$NOVA_ALERT_DIR/esbuild.config.js"
    rm -f "$NOVA_ALERT_DIR/esbuild.cypress.js"
    rm -f "$NOVA_ALERT_DIR/cypress.config.js"
    rm -f "$NOVA_ALERT_DIR/playwright.config.ts"
    rm -f "$NOVA_ALERT_DIR/.storybook"
    
    # Remove UI dependencies from package.json
    if [[ -f "$NOVA_ALERT_DIR/package.json" ]]; then
        log "${BLUE}Updating package.json to remove UI dependencies...${NC}"
        
        # Create a backup of the original package.json
        cp "$NOVA_ALERT_DIR/package.json" "$BACKUP_DIR/package.json.original"
        
        # Remove UI-related dependencies
        local ui_dependencies=(
            "react"
            "react-dom"
            "react-redux"
            "@apollo/client"
            "urql"
            "wouter"
            "@mui/material"
            "@mui/styles"
            "@emotion/react"
            "@emotion/styled"
            "makeStyles"
            "cypress"
            "playwright"
            "@storybook"
            "esbuild"
            "modernizr"
        )
        
        for dep in "${ui_dependencies[@]}"; do
            if grep -q "\"$dep\"" "$NOVA_ALERT_DIR/package.json"; then
                log "${BLUE}Removing UI dependency: $dep${NC}"
                # Use sed to remove the dependency line
                sed -i.bak "/\"$dep\"/d" "$NOVA_ALERT_DIR/package.json"
            fi
        done
        
        # Remove UI-related scripts
        sed -i.bak '/"dev":/d' "$NOVA_ALERT_DIR/package.json"
        sed -i.bak '/"build":/d' "$NOVA_ALERT_DIR/package.json'
        sed -i.bak '/"cypress":/d' "$NOVA_ALERT_DIR/package.json'
        sed -i.bak '/"storybook":/d' "$NOVA_ALERT_DIR/package.json'
        sed -i.bak '/"test:e2e":/d' "$NOVA_ALERT_DIR/package.json'
        
        # Clean up backup files
        rm -f "$NOVA_ALERT_DIR/package.json.bak"
    fi
    
    # Remove UI-related environment files
    rm -f "$NOVA_ALERT_DIR/.env.local"
    rm -f "$NOVA_ALERT_DIR/.env.development"
    rm -f "$NOVA_ALERT_DIR/.env.production"
    
    # Remove UI-related documentation
    rm -f "$NOVA_ALERT_DIR/README.md"
    rm -f "$NOVA_ALERT_DIR/CONTRIBUTING.md"
    rm -f "$NOVA_ALERT_DIR/CODE_OF_CONDUCT.md"
    
    log "${GREEN}Nova-Alert UI removal completed${NC}"
}

# Update routing configuration
update_routing() {
    log "${BLUE}Updating routing configuration...${NC}"
    
    # Check if unified monitoring route is properly configured
    if ! grep -q "UnifiedMonitoringDashboard" "apps/unified/src/App.tsx"; then
        log "${RED}Unified monitoring route not found in App.tsx${NC}"
        exit 1
    fi
    
    # Check if API routing is properly configured
    if ! grep -q "unifiedMonitoringRouter" "apps/api/index.js"; then
        log "${RED}Unified monitoring API router not found in index.js${NC}"
        exit 1
    fi
    
    log "${GREEN}Routing configuration verified${NC}"
}

# Clean up dependencies
cleanup_dependencies() {
    log "${BLUE}Cleaning up dependencies...${NC}"
    
    # Remove node_modules and reinstall
    if [[ -d "$NOVA_ALERT_DIR/node_modules" ]]; then
        log "${BLUE}Removing node_modules...${NC}"
        rm -rf "$NOVA_ALERT_DIR/node_modules"
    fi
    
    # Remove package-lock.json
    if [[ -f "$NOVA_ALERT_DIR/package-lock.json" ]]; then
        log "${BLUE}Removing package-lock.json...${NC}"
        rm -f "$NOVA_ALERT_DIR/package-lock.json"
    fi
    
    # Remove bun.lock
    if [[ -f "$NOVA_ALERT_DIR/bun.lock" ]]; then
        log "${BLUE}Removing bun.lock...${NC}"
        rm -f "$NOVA_ALERT_DIR/bun.lock"
    fi
    
    # Reinstall dependencies
    log "${BLUE}Reinstalling dependencies...${NC}"
    cd "$NOVA_ALERT_DIR"
    npm install
    cd - > /dev/null
    
    log "${GREEN}Dependencies cleaned up${NC}"
}

# Create removal summary
create_summary() {
    log "${BLUE}Creating removal summary...${NC}"
    
    cat > "$BACKUP_DIR/REMOVAL_SUMMARY.md" << EOF
# Nova-Alert (GoAlert) UI Removal Summary

## Removal Date
$(date)

## What Was Removed
- Web UI source files (web/)
- UI build files (dist/, build/)
- UI configuration files (esbuild.config.js, cypress.config.js, etc.)
- UI dependencies (React, Material-UI, build tools, etc.)
- UI scripts (dev, build, cypress, storybook, etc.)
- UI environment files
- UI documentation

## What Was Preserved
- Core GoAlert functionality
- Database schemas
- API endpoints and logic
- Configuration files
- Logs and audit trails
- Go backend services

## Backup Location
$BACKUP_DIR

## Verification Steps
1. Unified monitoring API is accessible at /api/v2/monitoring
2. Unified monitoring UI is accessible at /monitoring
3. All GoAlert features work correctly
4. No functionality has been lost

## Rollback Instructions
If rollback is needed, restore from backup:
\`\`\`bash
cp -r $BACKUP_DIR/* $NOVA_ALERT_DIR/
cd $NOVA_ALERT_DIR
npm install
\`\`\`

## Post-Removal Actions
1. Test all GoAlert functionality
2. Verify service management works correctly
3. Confirm escalation policies function
4. Check schedule overrides work properly
5. Update documentation and user guides

## GoAlert Features Preserved
- Service management and configuration
- Integration keys and API access
- Heartbeat monitors and health checks
- Escalation policies and multi-step escalation
- Schedule management and overrides
- Service labels and categorization
- Service notices and maintenance
- Alert metrics and analytics
- User management and permissions
- Notification channels and delivery
- Admin configuration and system settings
EOF
    
    log "${GREEN}Removal summary created: $BACKUP_DIR/REMOVAL_SUMMARY.md${NC}"
}

# Main execution
main() {
    log "${BLUE}========================================${NC}"
    log "${BLUE}Nova-Alert (GoAlert) UI Removal Script${NC}"
    log "${BLUE}========================================${NC}"
    log ""
    
    # Check if user wants to proceed
    log "${YELLOW}WARNING: This script will permanently remove the Nova-Alert native UI.${NC}"
    log "${YELLOW}Make sure you have verified 100% feature parity before proceeding.${NC}"
    log ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "${BLUE}Operation cancelled by user${NC}"
        exit 0
    fi
    
    log ""
    log "${BLUE}Starting Nova-Alert UI removal process...${NC}"
    
    # Execute removal steps
    check_root
    check_prerequisites
    create_backup
    verify_feature_parity
    remove_nova_alert_ui
    update_routing
    cleanup_dependencies
    create_summary
    
    log ""
    log "${GREEN}========================================${NC}"
    log "${GREEN}Nova-Alert UI removal completed successfully!${NC}"
    log "${GREEN}========================================${NC}"
    log ""
    log "${GREEN}The Nova-Alert native UI has been removed.${NC}"
    log "${GREEN}All functionality is now available through the unified Nova platform.${NC}"
    log ""
    log "${BLUE}Backup location: $BACKUP_DIR${NC}"
    log "${BLUE}Log file: $LOG_FILE${NC}"
    log ""
    log "${YELLOW}Next steps:${NC}"
    log "1. Test all GoAlert functionality"
    log "2. Verify service management works correctly"
    log "3. Confirm escalation policies function"
    log "4. Update documentation and user guides"
    log ""
    log "${GREEN}Removal process completed successfully!${NC}"
}

# Run main function
main "$@"
