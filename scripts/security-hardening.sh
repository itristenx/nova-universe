#!/bin/bash
# =============================================================================
# Nova Universe API - Production Security Hardening Script
# =============================================================================
# This script implements security best practices and validates the production
# environment before deployment
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Track issues
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0

# =============================================================================
# 1. ENVIRONMENT VALIDATION
# =============================================================================
check_environment() {
    log_info "Checking environment configuration..."
    
    # Check if NODE_ENV is set to production
    if [ "${NODE_ENV:-}" != "production" ]; then
        log_error "NODE_ENV must be set to 'production'"
        ((CRITICAL_ISSUES++))
    else
        log_success "NODE_ENV is set to production"
    fi
    
    # Check for required environment variables
    required_vars=(
        "POSTGRES_PASSWORD"
        "MONGO_ROOT_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
        "SESSION_SECRET"
        "CORS_ORIGINS"
        "API_BASE_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable $var is not set"
            ((CRITICAL_ISSUES++))
        else
            log_success "$var is configured"
        fi
    done
}

# =============================================================================
# 2. SECRET VALIDATION
# =============================================================================
check_secrets() {
    log_info "Validating secrets..."
    
    # Check JWT secret strength
    if [ -n "${JWT_SECRET:-}" ]; then
        jwt_length=${#JWT_SECRET}
        if [ "$jwt_length" -lt 32 ]; then
            log_error "JWT_SECRET must be at least 32 characters (current: $jwt_length)"
            ((CRITICAL_ISSUES++))
        else
            log_success "JWT_SECRET length is sufficient ($jwt_length chars)"
        fi
    fi
    
    # Check Session secret strength
    if [ -n "${SESSION_SECRET:-}" ]; then
        session_length=${#SESSION_SECRET}
        if [ "$session_length" -lt 32 ]; then
            log_error "SESSION_SECRET must be at least 32 characters (current: $session_length)"
            ((CRITICAL_ISSUES++))
        else
            log_success "SESSION_SECRET length is sufficient ($session_length chars)"
        fi
    fi
    
    # Check for default/weak passwords
    weak_passwords=("password" "admin" "changeme" "123456" "test")
    for weak in "${weak_passwords[@]}"; do
        if [ "${POSTGRES_PASSWORD:-}" == "$weak" ]; then
            log_error "POSTGRES_PASSWORD is using a weak/default password: $weak"
            ((CRITICAL_ISSUES++))
        fi
    done
}

# =============================================================================
# 3. DEPENDENCY SECURITY AUDIT
# =============================================================================
check_dependencies() {
    log_info "Running dependency security audit..."
    
    if command -v npm &> /dev/null; then
        # Run npm audit
        if npm audit --production --audit-level=high; then
            log_success "No high/critical vulnerabilities found in dependencies"
        else
            log_error "High or critical vulnerabilities found in dependencies"
            ((CRITICAL_ISSUES++))
        fi
    else
        log_warning "npm not found, skipping dependency audit"
        ((MEDIUM_ISSUES++))
    fi
}

# =============================================================================
# 4. SSL/TLS CERTIFICATE VALIDATION
# =============================================================================
check_ssl_certificates() {
    log_info "Checking SSL/TLS certificates..."
    
    if [ -n "${TLS_CERT_PATH:-}" ] && [ -n "${TLS_KEY_PATH:-}" ]; then
        if [ -f "$TLS_CERT_PATH" ] && [ -f "$TLS_KEY_PATH" ]; then
            # Check certificate expiration
            expiry=$(openssl x509 -enddate -noout -in "$TLS_CERT_PATH" | cut -d= -f2)
            expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry" +%s)
            current_epoch=$(date +%s)
            days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [ "$days_until_expiry" -lt 30 ]; then
                log_warning "SSL certificate expires in $days_until_expiry days"
                ((HIGH_ISSUES++))
            else
                log_success "SSL certificate is valid ($days_until_expiry days remaining)"
            fi
        else
            log_error "SSL certificate or key file not found"
            ((HIGH_ISSUES++))
        fi
    else
        log_warning "TLS not configured (using reverse proxy for SSL termination?)"
        ((MEDIUM_ISSUES++))
    fi
}

# =============================================================================
# 5. DATABASE CONNECTION SECURITY
# =============================================================================
check_database_security() {
    log_info "Validating database security configuration..."
    
    # Check if database SSL is enabled
    if [ "${POSTGRES_SSL:-false}" != "true" ]; then
        log_warning "PostgreSQL SSL is not enabled"
        ((HIGH_ISSUES++))
    else
        log_success "PostgreSQL SSL is enabled"
    fi
    
    # Check connection pool limits
    if [ -n "${POSTGRES_POOL_MAX:-}" ]; then
        if [ "${POSTGRES_POOL_MAX}" -gt 100 ]; then
            log_warning "PostgreSQL connection pool max is very high: ${POSTGRES_POOL_MAX}"
            ((MEDIUM_ISSUES++))
        fi
    fi
}

# =============================================================================
# 6. CORS CONFIGURATION VALIDATION
# =============================================================================
check_cors() {
    log_info "Validating CORS configuration..."
    
    if [ -z "${CORS_ORIGINS:-}" ]; then
        log_error "CORS_ORIGINS not configured"
        ((CRITICAL_ISSUES++))
    else
        # Check for wildcard CORS (security issue)
        if [[ "${CORS_ORIGINS}" == *"*"* ]]; then
            log_error "CORS is configured with wildcard (*) - CRITICAL SECURITY ISSUE"
            ((CRITICAL_ISSUES++))
        else
            log_success "CORS origins properly configured"
        fi
    fi
}

# =============================================================================
# 7. RATE LIMITING CONFIGURATION
# =============================================================================
check_rate_limiting() {
    log_info "Checking rate limiting configuration..."
    
    if [ -n "${RATE_LIMIT_MAX:-}" ]; then
        if [ "${RATE_LIMIT_MAX}" -gt 1000 ]; then
            log_warning "Rate limit is very high: ${RATE_LIMIT_MAX} requests"
            ((MEDIUM_ISSUES++))
        else
            log_success "Rate limiting configured: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW:-15} minutes"
        fi
    else
        log_warning "Rate limiting not configured"
        ((HIGH_ISSUES++))
    fi
}

# =============================================================================
# 8. LOGGING CONFIGURATION
# =============================================================================
check_logging() {
    log_info "Validating logging configuration..."
    
    # Check log level
    if [ "${LOG_LEVEL:-info}" == "debug" ]; then
        log_warning "LOG_LEVEL is set to 'debug' in production"
        ((MEDIUM_ISSUES++))
    else
        log_success "Log level appropriate for production: ${LOG_LEVEL:-info}"
    fi
    
    # Check if sensitive data logging is disabled
    if [ "${DEBUG_SQL:-false}" == "true" ]; then
        log_warning "DEBUG_SQL is enabled - may log sensitive data"
        ((HIGH_ISSUES++))
    fi
    
    if [ "${DEBUG_AUTH:-false}" == "true" ]; then
        log_warning "DEBUG_AUTH is enabled - may log sensitive data"
        ((HIGH_ISSUES++))
    fi
}

# =============================================================================
# 9. FILE PERMISSIONS
# =============================================================================
check_file_permissions() {
    log_info "Checking file permissions..."
    
    # Check if uploads directory exists and has correct permissions
    if [ -d "./uploads" ]; then
        perms=$(stat -c "%a" "./uploads" 2>/dev/null || stat -f "%A" "./uploads")
        if [ "$perms" != "750" ] && [ "$perms" != "755" ]; then
            log_warning "Uploads directory has insecure permissions: $perms"
            ((MEDIUM_ISSUES++))
        fi
    fi
    
    # Check .env file permissions (should not be world-readable)
    if [ -f ".env" ]; then
        perms=$(stat -c "%a" ".env" 2>/dev/null || stat -f "%A" ".env")
        if [ "${perms:2:1}" != "0" ]; then
            log_error ".env file is world-readable!"
            ((CRITICAL_ISSUES++))
        else
            log_success ".env file has secure permissions"
        fi
    fi
}

# =============================================================================
# 10. DOCKER SECURITY (if running in container)
# =============================================================================
check_docker_security() {
    log_info "Checking Docker security configuration..."
    
    if command -v docker &> /dev/null; then
        # Check if running as root
        if docker info 2>/dev/null | grep -q "rootless"; then
            log_success "Docker is running in rootless mode"
        else
            log_warning "Docker is not running in rootless mode"
            ((MEDIUM_ISSUES++))
        fi
    fi
}

# =============================================================================
# 11. BACKUP CONFIGURATION
# =============================================================================
check_backups() {
    log_info "Validating backup configuration..."
    
    if [ -z "${BACKUP_SCHEDULE:-}" ]; then
        log_warning "Automated backups not configured"
        ((HIGH_ISSUES++))
    else
        log_success "Backup schedule configured: ${BACKUP_SCHEDULE}"
    fi
    
    if [ -z "${BACKUP_RETENTION_DAYS:-}" ]; then
        log_warning "Backup retention policy not configured"
        ((MEDIUM_ISSUES++))
    else
        log_success "Backup retention: ${BACKUP_RETENTION_DAYS} days"
    fi
}

# =============================================================================
# 12. MONITORING & ALERTING
# =============================================================================
check_monitoring() {
    log_info "Checking monitoring configuration..."
    
    # Check if health check endpoint is configured
    if curl -sf "http://localhost:${PORT:-3000}/health" > /dev/null 2>&1; then
        log_success "Health check endpoint is accessible"
    else
        log_warning "Health check endpoint not accessible (API may not be running)"
        ((MEDIUM_ISSUES++))
    fi
    
    # Check for monitoring integrations
    if [ -z "${SENTRY_DSN:-}" ]; then
        log_warning "Error monitoring (Sentry) not configured"
        ((MEDIUM_ISSUES++))
    fi
}

# =============================================================================
# REPORT GENERATION
# =============================================================================
generate_report() {
    echo ""
    echo "============================================================================="
    echo "                    SECURITY HARDENING REPORT                                "
    echo "============================================================================="
    echo ""
    
    if [ $CRITICAL_ISSUES -eq 0 ] && [ $HIGH_ISSUES -eq 0 ]; then
        log_success "✅ PASSED - No critical or high severity issues found"
        echo ""
        if [ $MEDIUM_ISSUES -gt 0 ]; then
            log_warning "⚠️  $MEDIUM_ISSUES medium severity issue(s) found - review recommended"
        fi
    else
        log_error "❌ FAILED - Security issues must be resolved before production deployment"
        echo ""
        echo "Issues found:"
        echo "  - Critical: $CRITICAL_ISSUES"
        echo "  - High:     $HIGH_ISSUES"
        echo "  - Medium:   $MEDIUM_ISSUES"
        echo ""
        echo "DO NOT DEPLOY TO PRODUCTION until all critical and high issues are resolved"
    fi
    
    echo "============================================================================="
    
    # Exit with error if critical issues found
    if [ $CRITICAL_ISSUES -gt 0 ]; then
        exit 1
    fi
    
    # Exit with warning if high issues found
    if [ $HIGH_ISSUES -gt 0 ]; then
        exit 2
    fi
    
    exit 0
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    echo "============================================================================="
    echo "         Nova Universe API - Production Security Hardening                   "
    echo "============================================================================="
    echo ""
    
    # Run all checks
    check_environment
    check_secrets
    check_dependencies
    check_ssl_certificates
    check_database_security
    check_cors
    check_rate_limiting
    check_logging
    check_file_permissions
    check_docker_security
    check_backups
    check_monitoring
    
    # Generate report
    generate_report
}

# Run main function
main "$@"
