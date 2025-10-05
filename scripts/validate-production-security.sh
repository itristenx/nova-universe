#!/bin/bash
# Production Security Validation Script for Nova Universe API
# This script validates that all required security configurations are in place

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
PASSED=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Nova Universe API - Production Security Validation         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if variable is set and not a placeholder
check_required_env() {
    local var_name=$1
    local var_value="${!var_name}"
    local min_length=${2:-16}  # Default minimum length
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ CRITICAL: $var_name is not set${NC}"
        ((ERRORS++))
        return 1
    fi
    
    # Check for placeholder values
    if [[ "$var_value" == *"CHANGE_ME"* ]] || \
       [[ "$var_value" == *"placeholder"* ]] || \
       [[ "$var_value" == *"demo"* ]] || \
       [[ "$var_value" == *"test"* ]] || \
       [[ "$var_value" == *"example"* ]]; then
        echo -e "${RED}✗ CRITICAL: $var_name contains placeholder value${NC}"
        ((ERRORS++))
        return 1
    fi
    
    # Check minimum length
    if [ ${#var_value} -lt $min_length ]; then
        echo -e "${YELLOW}⚠ WARNING: $var_name is too short (${#var_value} chars, minimum $min_length)${NC}"
        ((WARNINGS++))
        return 1
    fi
    
    echo -e "${GREEN}✓ $var_name is configured (${#var_value} chars)${NC}"
    ((PASSED++))
    return 0
}

# Function to check optional env
check_optional_env() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠ INFO: $var_name is not set (optional)${NC}"
        return 0
    fi
    
    echo -e "${GREEN}✓ $var_name is configured${NC}"
    ((PASSED++))
    return 0
}

# Function to check if variable is explicitly false
check_disabled_flag() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ "$var_value" == "true" ] || [ "$var_value" == "1" ]; then
        echo -e "${RED}✗ CRITICAL: $var_name must be false in production${NC}"
        ((ERRORS++))
        return 1
    fi
    
    echo -e "${GREEN}✓ $var_name is disabled${NC}"
    ((PASSED++))
    return 0
}

echo -e "\n${BLUE}1. Environment Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}⚠ WARNING: NODE_ENV is not set to 'production' (current: ${NODE_ENV:-not set})${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ NODE_ENV is set to production${NC}"
    ((PASSED++))
fi

echo -e "\n${BLUE}2. Database Credentials${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_required_env "DATABASE_URL" 30
check_required_env "MONGODB_URI" 30
check_required_env "REDIS_URL" 20

check_required_env "CORE_DB_PASSWORD" 20
check_required_env "AUTH_DB_PASSWORD" 20
check_required_env "AUDIT_DB_PASSWORD" 20

# Legacy database vars
check_required_env "POSTGRES_PASSWORD" 20
check_required_env "POSTGRES_USER" 8
check_required_env "POSTGRES_DB" 4

echo -e "\n${BLUE}3. Authentication & Security${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_required_env "JWT_SECRET" 32
check_required_env "SESSION_SECRET" 32
check_required_env "KIOSK_TOKEN" 32
check_required_env "SCIM_TOKEN" 32

# Check that secrets are different
if [ "$JWT_SECRET" == "$SESSION_SECRET" ]; then
    echo -e "${RED}✗ CRITICAL: JWT_SECRET and SESSION_SECRET must be different${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ JWT_SECRET and SESSION_SECRET are different${NC}"
    ((PASSED++))
fi

echo -e "\n${BLUE}4. Email Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_required_env "SMTP_HOST" 4
check_required_env "SMTP_USER" 5
check_required_env "SMTP_PASS" 8
check_optional_env "SMTP_PORT"
check_optional_env "SMTP_FROM"

echo -e "\n${BLUE}5. CORS Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$CORS_ORIGINS" ]; then
    echo -e "${YELLOW}⚠ WARNING: CORS_ORIGINS not set - will use defaults${NC}"
    ((WARNINGS++))
elif [[ "$CORS_ORIGINS" == *"*"* ]]; then
    echo -e "${RED}✗ CRITICAL: CORS_ORIGINS contains wildcard (*) - security risk!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ CORS_ORIGINS is configured without wildcards${NC}"
    echo -e "  Allowed origins: $CORS_ORIGINS"
    ((PASSED++))
fi

echo -e "\n${BLUE}6. Security Flags${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_disabled_flag "DISABLE_AUTH"
check_disabled_flag "DEBUG_CORS"

echo -e "\n${BLUE}7. Optional Monitoring Services${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_optional_env "UPTIME_KUMA_API_URL"
check_optional_env "UPTIME_KUMA_API_KEY"
check_optional_env "GOALERT_API_BASE"
check_optional_env "GOALERT_API_KEY"

echo -e "\n${BLUE}8. SAML Configuration (if using SSO)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_optional_env "SAML_CERT"
check_optional_env "SAML_PRIVATE_KEY"
check_optional_env "SAML_ENTRY_POINT"

echo -e "\n${BLUE}9. File Permissions Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env files have proper permissions (not world-readable)
if [ -f ".env" ]; then
    PERMS=$(stat -c %a .env 2>/dev/null || stat -f %A .env 2>/dev/null)
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
        echo -e "${YELLOW}⚠ WARNING: .env file has permissive permissions ($PERMS). Should be 600 or 400${NC}"
        echo -e "  Run: chmod 600 .env"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ .env file has secure permissions ($PERMS)${NC}"
        ((PASSED++))
    fi
fi

if [ -f ".env.production" ]; then
    PERMS=$(stat -c %a .env.production 2>/dev/null || stat -f %A .env.production 2>/dev/null)
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
        echo -e "${YELLOW}⚠ WARNING: .env.production has permissive permissions ($PERMS). Should be 600 or 400${NC}"
        echo -e "  Run: chmod 600 .env.production"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ .env.production has secure permissions ($PERMS)${NC}"
        ((PASSED++))
    fi
fi

echo -e "\n${BLUE}10. SSL/TLS Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$TLS_CERT_PATH" ] && [ -f "$TLS_CERT_PATH" ]; then
    echo -e "${GREEN}✓ TLS certificate found at $TLS_CERT_PATH${NC}"
    ((PASSED++))
    
    # Check certificate expiration
    if command -v openssl &> /dev/null; then
        EXPIRY=$(openssl x509 -enddate -noout -in "$TLS_CERT_PATH" 2>/dev/null | cut -d= -f2)
        if [ -n "$EXPIRY" ]; then
            echo -e "  Certificate expires: $EXPIRY"
            
            # Warn if expiring in less than 30 days
            EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null)
            NOW_EPOCH=$(date +%s)
            DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
            
            if [ $DAYS_LEFT -lt 30 ]; then
                echo -e "${YELLOW}⚠ WARNING: TLS certificate expires in $DAYS_LEFT days${NC}"
                ((WARNINGS++))
            fi
        fi
    fi
elif [ -n "$TLS_CERT_PATH" ]; then
    echo -e "${YELLOW}⚠ WARNING: TLS_CERT_PATH is set but file not found: $TLS_CERT_PATH${NC}"
    ((WARNINGS++))
else
    echo -e "${YELLOW}⚠ INFO: TLS_CERT_PATH not configured (using HTTP)${NC}"
fi

if [ -n "$TLS_KEY_PATH" ] && [ -f "$TLS_KEY_PATH" ]; then
    echo -e "${GREEN}✓ TLS key found at $TLS_KEY_PATH${NC}"
    ((PASSED++))
    
    # Check key file permissions
    PERMS=$(stat -c %a "$TLS_KEY_PATH" 2>/dev/null || stat -f %A "$TLS_KEY_PATH" 2>/dev/null)
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
        echo -e "${YELLOW}⚠ WARNING: TLS key has permissive permissions ($PERMS). Should be 600${NC}"
        echo -e "  Run: chmod 600 $TLS_KEY_PATH"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ TLS key has secure permissions ($PERMS)${NC}"
        ((PASSED++))
    fi
fi

# Summary
echo -e "\n${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Validation Summary                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Errors:   $ERRORS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  CRITICAL ERRORS FOUND - DO NOT DEPLOY TO PRODUCTION!       ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Please review and fix all critical errors before deployment.${NC}"
    echo -e "${YELLOW}See PRODUCTION_SECURITY_CONFIGURATION.md for guidance.${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  WARNINGS FOUND - Review before production deployment       ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}While not critical, please review warnings for best practices.${NC}"
    exit 0
else
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ALL SECURITY VALIDATIONS PASSED - Ready for deployment!    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Production security configuration looks good!${NC}"
    exit 0
fi
