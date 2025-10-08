#!/bin/bash

# Week 3 API Testing Script
# Tests Change Management and Workflow APIs

BASE_URL="http://localhost:3000/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Week 3 API Testing - Change & Workflow"
echo "========================================"
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Test endpoint with JSON response
test_endpoint_with_response() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo "Testing: $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BASE_URL$endpoint")
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    fi
    
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $http_code)"
        echo ""
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Status: $http_code)"
        echo ""
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "1. CHANGE MANAGEMENT ENDPOINTS"
echo "====================================="
echo ""

test_endpoint_with_response "GET" "/changes" "GET /changes (List changes - expect 401/403)"
test_endpoint_with_response "GET" "/changes?state=NEW" "GET /changes?state=NEW (Filtered - expect 401/403)"

echo ""
echo "2. WORKFLOW ENDPOINTS"
echo "====================================="
echo ""

test_endpoint_with_response "GET" "/workflows" "GET /workflows (List workflows - expect 401/403)"
test_endpoint_with_response "GET" "/workflows/templates" "GET /workflows/templates (Templates - expect 401/403)"

echo ""
echo "3. WEEK 1-2 REGRESSION TESTS"
echo "====================================="
echo ""

test_endpoint_with_response "GET" "/knowledge/popular" "GET /knowledge/popular (Week 1)"
test_endpoint_with_response "GET" "/services/popular" "GET /services/popular (Week 1)"
test_endpoint_with_response "GET" "/webhooks/events" "GET /webhooks/events (Week 2)"

echo ""
echo "========================================"
echo "TEST SUMMARY"
echo "========================================"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${YELLOW}⚠ SOME TESTS FAILED${NC}"
    echo ""
    echo "Note: Tests may fail due to:"
    echo "1. Missing auth tokens (401/403 expected for protected endpoints)"
    echo "2. Database not configured"
    echo "3. API server not running"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    exit 0
fi
