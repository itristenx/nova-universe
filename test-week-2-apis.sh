#!/bin/bash

# =============================================================================
# Week 2 API Testing Script
# Tests Admin & Monitoring endpoints
# =============================================================================

BASE_URL="http://localhost:3000/api/v1"
ADMIN_TOKEN="your-admin-jwt-token-here"  # Replace with actual admin token
USER_TOKEN="your-user-jwt-token-here"    # Replace with actual user token

echo "========================================"
echo "Week 2 API Testing - Admin & Monitoring"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local auth="$4"
    local data="$5"
    local expected_status="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $name ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Authorization: Bearer $auth" \
            -H "Content-Type: application/json" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Authorization: Bearer $auth" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [[ "$status_code" == "$expected_status"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        if [ ! -z "$body" ] && [ "$body" != "null" ]; then
            echo "  Response: $(echo "$body" | jq -r '.message // .data.message // "Success"' 2>/dev/null || echo 'OK')"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        if [ ! -z "$body" ]; then
            echo "  Error: $(echo "$body" | jq -r '.error // .message' 2>/dev/null || echo "$body")"
        fi
    fi
    echo ""
}

# =============================================================================
# 1. WEBHOOK ENDPOINTS
# =============================================================================

echo "1. WEBHOOK CONFIGURATION ENDPOINTS"
echo "====================================="
echo ""

# List webhook events (any authenticated user)
test_endpoint \
    "GET /webhooks/events" \
    "GET" \
    "$BASE_URL/webhooks/events" \
    "$USER_TOKEN" \
    "" \
    "200"

# List webhooks (admin only)
test_endpoint \
    "GET /webhooks (Admin)" \
    "GET" \
    "$BASE_URL/webhooks" \
    "$ADMIN_TOKEN" \
    "" \
    "200"

# List webhooks (non-admin - should fail)
test_endpoint \
    "GET /webhooks (Non-Admin)" \
    "GET" \
    "$BASE_URL/webhooks" \
    "$USER_TOKEN" \
    "" \
    "403"

# Create webhook (admin only)
test_endpoint \
    "POST /webhooks (Create)" \
    "POST" \
    "$BASE_URL/webhooks" \
    "$ADMIN_TOKEN" \
    '{"name":"Test Webhook","url":"https://example.com/webhook","events":["ticket.created","alert.triggered"]}' \
    "201"

# Create webhook with invalid URL (should fail)
test_endpoint \
    "POST /webhooks (Invalid URL)" \
    "POST" \
    "$BASE_URL/webhooks" \
    "$ADMIN_TOKEN" \
    '{"name":"Bad Webhook","url":"http://example.com/webhook","events":["ticket.created"]}' \
    "400"

# =============================================================================
# 2. ALERT ENDPOINTS (Note: alerts.js already exists with GoAlert integration)
# =============================================================================

echo "2. ALERT MANAGEMENT ENDPOINTS"
echo "=============================="
echo ""

# Get active alerts
test_endpoint \
    "GET /alerts/active" \
    "GET" \
    "$BASE_URL/alerts/active" \
    "$USER_TOKEN" \
    "" \
    "200"

# Get alert statistics
test_endpoint \
    "GET /alerts/stats" \
    "GET" \
    "$BASE_URL/alerts/stats" \
    "$USER_TOKEN" \
    "" \
    "200"

# List all alerts
test_endpoint \
    "GET /alerts" \
    "GET" \
    "$BASE_URL/alerts?limit=10" \
    "$USER_TOKEN" \
    "" \
    "200"

# =============================================================================
# 3. KNOWLEDGE BASE CRUD ENDPOINTS
# =============================================================================

echo "3. KNOWLEDGE BASE CRUD ENDPOINTS"
echo "================================="
echo ""

# Create article (authenticated user)
test_endpoint \
    "POST /knowledge/articles (Create)" \
    "POST" \
    "$BASE_URL/knowledge/articles" \
    "$USER_TOKEN" \
    '{"title":"Test Article","content":"This is a test knowledge base article created via API.","categoryId":"test-category","tags":["test","api"],"status":"draft"}' \
    "201"

# Update article (requires article ID from previous step)
# Note: This test will fail if article doesn't exist
# test_endpoint \
#     "PUT /knowledge/articles/:id (Update)" \
#     "PUT" \
#     "$BASE_URL/knowledge/articles/YOUR_ARTICLE_ID" \
#     "$USER_TOKEN" \
#     '{"title":"Updated Test Article","changeNotes":"Updated via API"}' \
#     "200"

# =============================================================================
# 4. ARTICLE VERSIONING ENDPOINTS
# =============================================================================

echo "4. ARTICLE VERSIONING ENDPOINTS"
echo "================================"
echo ""

# List article versions
# Note: This test will fail if article doesn't exist
# test_endpoint \
#     "GET /knowledge/articles/:id/versions" \
#     "GET" \
#     "$BASE_URL/knowledge/articles/YOUR_ARTICLE_ID/versions" \
#     "$USER_TOKEN" \
#     "" \
#     "200"

# Get article history
# test_endpoint \
#     "GET /knowledge/articles/:id/history" \
#     "GET" \
#     "$BASE_URL/knowledge/articles/YOUR_ARTICLE_ID/history" \
#     "$USER_TOKEN" \
#     "" \
#     "200"

# =============================================================================
# 5. ARTICLE COMMENT ENDPOINTS
# =============================================================================

echo "5. ARTICLE COMMENT ENDPOINTS"
echo "============================="
echo ""

# Add comment to article
# Note: This test will fail if article doesn't exist
# test_endpoint \
#     "POST /knowledge/articles/:id/comments (Add Comment)" \
#     "POST" \
#     "$BASE_URL/knowledge/articles/YOUR_ARTICLE_ID/comments" \
#     "$USER_TOKEN" \
#     '{"content":"This is a test comment on the article."}' \
#     "201"

# List article comments
# test_endpoint \
#     "GET /knowledge/articles/:id/comments" \
#     "GET" \
#     "$BASE_URL/knowledge/articles/YOUR_ARTICLE_ID/comments" \
#     "$USER_TOKEN" \
#     "" \
#     "200"

# =============================================================================
# 6. EXISTING WEEK 1 ENDPOINTS (Regression Testing)
# =============================================================================

echo "6. WEEK 1 REGRESSION TESTS"
echo "==========================="
echo ""

# Test Week 1 endpoints still work
test_endpoint \
    "GET /knowledge/popular" \
    "GET" \
    "$BASE_URL/knowledge/popular" \
    "" \
    "" \
    "200"

test_endpoint \
    "GET /knowledge/categories" \
    "GET" \
    "$BASE_URL/knowledge/categories" \
    "" \
    "" \
    "200"

test_endpoint \
    "GET /services/popular" \
    "GET" \
    "$BASE_URL/services/popular" \
    "" \
    "" \
    "200"

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "========================================"
echo "TEST SUMMARY"
echo "========================================"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ SOME TESTS FAILED${NC}"
    echo ""
    echo "Note: Some tests may fail due to:"
    echo "1. Missing DATABASE_URL configuration"
    echo "2. Missing admin/user tokens"
    echo "3. Missing article IDs for versioning/comment tests"
    echo ""
    echo "Setup Instructions:"
    echo "1. Configure DATABASE_URL in .env"
    echo "2. Run: npx prisma generate && npx prisma db push"
    echo "3. Create test user and get JWT token"
    echo "4. Update ADMIN_TOKEN and USER_TOKEN in this script"
    echo "5. Run this script again"
    exit 1
fi
