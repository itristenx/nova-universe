#!/bin/bash

# Nova-Sentinel UI Removal Script
# This script safely removes the Nova-Sentinel native UI after confirming
# 100% feature parity has been achieved in the unified Nova platform.

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NOVA_SENTINEL_DIR="apps/nova-sentinal"
BACKUP_DIR="backups/nova-sentinel-ui-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="logs/nova-sentinel-ui-removal-$(date +%Y%m%d-%H%M%S).log"

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
    
    # Check if Nova-Sentinel directory exists
    if [[ ! -d "$NOVA_SENTINEL_DIR" ]]; then
        log "${RED}Nova-Sentinel directory not found: $NOVA_SENTINEL_DIR${NC}"
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
    
    # Backup Nova-Sentinel UI files
    log "${BLUE}Backing up Nova-Sentinel UI files...${NC}"
    cp -r "$NOVA_SENTINEL_DIR" "$BACKUP_DIR/"
    
    # Backup package.json dependencies
    if [[ -f "$NOVA_SENTINEL_DIR/package.json" ]]; then
        cp "$NOVA_SENTINEL_DIR/package.json" "$BACKUP_DIR/"
    fi
    
    log "${GREEN}Backup completed successfully${NC}"
}

# Verify feature parity
verify_feature_parity() {
    log "${BLUE}Verifying feature parity...${NC}"
    
    # Test unified monitoring API endpoints
    local endpoints=(
        "/api/v2/monitoring/monitors"
        "/api/v2/monitoring/alerts"
        "/api/v2/monitoring/system-health"
        "/api/v2/monitoring/status-pages"
        "/api/v2/monitoring/tags"
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

# Remove Nova-Sentinel UI
remove_nova_sentinel_ui() {
    log "${BLUE}Removing Nova-Sentinel native UI...${NC}"
    
    # Remove UI source files
    log "${BLUE}Removing UI source files...${NC}"
    rm -rf "$NOVA_SENTINEL_DIR/src"
    
    # Remove UI build files
    log "${BLUE}Removing UI build files...${NC}"
    rm -rf "$NOVA_SENTINEL_DIR/dist"
    rm -rf "$NOVA_SENTINEL_DIR/build"
    
    # Remove UI configuration files
    log "${BLUE}Removing UI configuration files...${NC}"
    rm -f "$NOVA_SENTINEL_DIR/vite.config.js"
    rm -f "$NOVA_SENTINEL_DIR/vite.config.ts"
    rm -f "$NOVA_SENTINEL_DIR/webpack.config.js"
    rm -f "$NOVA_SENTINEL_DIR/rollup.config.js"
    
    # Remove UI dependencies from package.json
    if [[ -f "$NOVA_SENTINEL_DIR/package.json" ]]; then
        log "${BLUE}Updating package.json to remove UI dependencies...${NC}"
        
        # Create a backup of the original package.json
        cp "$NOVA_SENTINEL_DIR/package.json" "$BACKUP_DIR/package.json.original"
        
        # Remove UI-related dependencies
        local ui_dependencies=(
            "vue"
            "vue-router"
            "vuex"
            "pinia"
            "@vue/compiler-sfc"
            "vite"
            "webpack"
            "rollup"
            "sass"
            "less"
            "stylus"
            "@heroicons/vue"
            "font-awesome"
            "bootstrap"
            "tailwindcss"
        )
        
        for dep in "${ui_dependencies[@]}"; do
            if grep -q "\"$dep\"" "$NOVA_SENTINEL_DIR/package.json"; then
                log "${BLUE}Removing UI dependency: $dep${NC}"
                # Use sed to remove the dependency line
                sed -i.bak "/\"$dep\"/d" "$NOVA_SENTINEL_DIR/package.json"
            fi
        done
        
        # Remove UI-related scripts
        sed -i.bak '/"dev":/d' "$NOVA_SENTINEL_DIR/package.json"
        sed -i.bak '/"build":/d' "$NOVA_SENTINEL_DIR/package.json"
        sed -i.bak '/"preview":/d' "$NOVA_SENTINEL_DIR/package.json"
        sed -i.bak '/"serve":/d' "$NOVA_SENTINEL_DIR/package.json"
        
        # Clean up backup files
        rm -f "$NOVA_SENTINEL_DIR/package.json.bak"
    fi
    
    # Remove UI-related environment files
    rm -f "$NOVA_SENTINEL_DIR/.env.local"
    rm -f "$NOVA_SENTINEL_DIR/.env.development"
    rm -f "$NOVA_SENTINEL_DIR/.env.production"
    
    # Remove UI-related documentation
    rm -f "$NOVA_SENTINEL_DIR/README.md"
    rm -f "$NOVA_SENTINEL_DIR/CHANGELOG.md"
    
    log "${GREEN}Nova-Sentinel UI removal completed${NC}"
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
    if [[ -d "$NOVA_SENTINEL_DIR/node_modules" ]]; then
        log "${BLUE}Removing node_modules...${NC}"
        rm -rf "$NOVA_SENTINEL_DIR/node_modules"
    fi
    
    # Remove package-lock.json
    if [[ -f "$NOVA_SENTINEL_DIR/package-lock.json" ]]; then
        log "${BLUE}Removing package-lock.json...${NC}"
        rm -f "$NOVA_SENTINEL_DIR/package-lock.json"
    fi
    
    # Reinstall dependencies
    log "${BLUE}Reinstalling dependencies...${NC}"
    cd "$NOVA_SENTINEL_DIR"
    npm install
    cd - > /dev/null
    
    log "${GREEN}Dependencies cleaned up${NC}"
}

# Create removal summary
create_summary() {
    log "${BLUE}Creating removal summary...${NC}"
    
    cat > "$BACKUP_DIR/REMOVAL_SUMMARY.md" << EOF
# Nova-Sentinel UI Removal Summary

## Removal Date
$(date)

## What Was Removed
- UI source files (src/)
- UI build files (dist/, build/)
- UI configuration files (vite.config.js, webpack.config.js, etc.)
- UI dependencies (Vue, React, build tools, etc.)
- UI scripts (dev, build, preview, serve)
- UI environment files
- UI documentation

## What Was Preserved
- Core monitoring functionality
- Database schemas
- API endpoints
- Configuration files
- Logs and data

## Backup Location
$BACKUP_DIR

## Verification Steps
1. Unified monitoring API is accessible at /api/v2/monitoring
2. Unified monitoring UI is accessible at /monitoring
3. All monitoring functions work correctly
4. No functionality has been lost

## Rollback Instructions
If rollback is needed, restore from backup:
\`\`\`bash
cp -r $BACKUP_DIR/* $NOVA_SENTINEL_DIR/
cd $NOVA_SENTINEL_DIR
npm install
\`\`\`

## Post-Removal Actions
1. Test all monitoring functionality
2. Verify status pages work correctly
3. Confirm alerting continues to function
4. Check real-time updates work properly
5. Update documentation and user guides
EOF
    
    log "${GREEN}Removal summary created: $BACKUP_DIR/REMOVAL_SUMMARY.md${NC}"
}

# Main execution
main() {
    log "${BLUE}========================================${NC}"
    log "${BLUE}Nova-Sentinel UI Removal Script${NC}"
    log "${BLUE}========================================${NC}"
    log ""
    
    # Check if user wants to proceed
    log "${YELLOW}WARNING: This script will permanently remove the Nova-Sentinel native UI.${NC}"
    log "${YELLOW}Make sure you have verified 100% feature parity before proceeding.${NC}"
    log ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "${BLUE}Operation cancelled by user${NC}"
        exit 0
    fi
    
    log ""
    log "${BLUE}Starting Nova-Sentinel UI removal process...${NC}"
    
    # Execute removal steps
    check_root
    check_prerequisites
    create_backup
    verify_feature_parity
    remove_nova_sentinel_ui
    update_routing
    cleanup_dependencies
    create_summary
    
    log ""
    log "${GREEN}========================================${NC}"
    log "${GREEN}Nova-Sentinel UI removal completed successfully!${NC}"
    log "${GREEN}========================================${NC}"
    log ""
    log "${GREEN}The Nova-Sentinel native UI has been removed.${NC}"
    log "${GREEN}All functionality is now available through the unified Nova platform.${NC}"
    log ""
    log "${BLUE}Backup location: $BACKUP_DIR${NC}"
    log "${BLUE}Log file: $LOG_FILE${NC}"
    log ""
    log "${YELLOW}Next steps:${NC}"
    log "1. Test all monitoring functionality"
    log "2. Verify status pages work correctly"
    log "3. Confirm alerting continues to function"
    log "4. Update documentation and user guides"
    log ""
    log "${GREEN}Removal process completed successfully!${NC}"
}

# Run main function
main "$@"
