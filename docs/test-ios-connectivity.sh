#!/bin/bash

# Test iOS Kiosk API Connectivity
# This script simulates the API calls that the iOS kiosk app makes

API_BASE="http://localhost:3000"
KIOSK_TOKEN="oh+uHRXGt1f5kww5JEnQJ7JGK0c6Wnbe"

echo "🧪 Testing iOS Kiosk API Connectivity"
echo "======================================"
echo ""

# Function to test API endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local extra_args="$4"
    
    echo "Testing: $name"
    echo "URL: $url"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" $extra_args "$url")
    http_body=$(echo "$response" | sed -E '$d')
    http_status=$(echo "$response" | tail -n1 | cut -d: -f2)
    
    if [ "$http_status" = "$expected_status" ]; then
        echo "✅ SUCCESS (HTTP $http_status)"
        if [ ! -z "$http_body" ]; then
            echo "Response: $http_body" | head -3
        fi
    else
        echo "❌ FAILED (HTTP $http_status, expected $expected_status)"
        echo "Response: $http_body"
    fi
    echo ""
}

# 1. Test Health Check
test_endpoint "Health Check" "$API_BASE/api/health" "200"

# 2. Test Remote Config for unknown kiosk (should return default config)
test_endpoint "Remote Config (unknown kiosk)" "$API_BASE/api/kiosks/unknown/remote-config?token=$KIOSK_TOKEN" "200"

# 3. Test Kiosk Registration
registration_data='{"name":"Test iOS Kiosk","location":"Test Location","description":"iOS Simulator Test"}'
test_endpoint "Kiosk Registration" "$API_BASE/api/kiosks" "201" "-H 'Content-Type: application/json' -H 'Authorization: Bearer $KIOSK_TOKEN' -d '$registration_data'"

# 4. Test Categories endpoint
test_endpoint "Categories" "$API_BASE/api/categories?token=$KIOSK_TOKEN" "200"

# 5. Test Organizations endpoint
test_endpoint "Organizations" "$API_BASE/api/organizations?token=$KIOSK_TOKEN" "200"

# 6. Test without token (should fail)
test_endpoint "Remote Config (no token)" "$API_BASE/api/kiosks/unknown/remote-config" "401"

echo "🏁 Test Complete"
echo ""
echo "If all tests pass, the iOS kiosk should be able to connect successfully."
echo "If any tests fail, check the API server logs and configuration."
