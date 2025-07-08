#!/bin/bash

# iOS Kiosk API Connectivity Test
echo "🧪 Testing iOS Kiosk API Connectivity"
echo "======================================"

API_BASE="http://localhost:3000"
KIOSK_TOKEN="oh+uHRXGt1f5kww5JEnQJ7JGK0c6Wnbe"

# Test function
test_api() {
    echo "Testing: $1"
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$2" 2>/dev/null || echo "HTTPSTATUS:000")
    
    if [[ $response == *"HTTPSTATUS:200"* ]]; then
        echo "✅ PASS - $1"
        body=$(echo "$response" | sed 's/HTTPSTATUS:.*$//')
        echo "   Response: $(echo "$body" | head -c 100)..."
    elif [[ $response == *"HTTPSTATUS:000"* ]]; then
        echo "❌ FAIL - $1 (Connection failed)"
    else
        status=$(echo "$response" | grep -o 'HTTPSTATUS:[0-9]*' | cut -d: -f2)
        echo "⚠️  WARN - $1 (HTTP $status)"
    fi
    echo
}

# Run tests
test_api "Health Check" "$API_BASE/api/health"
test_api "Remote Config (with token)" "$API_BASE/api/kiosks/unknown/remote-config?token=$KIOSK_TOKEN"
test_api "Remote Config (no token)" "$API_BASE/api/kiosks/unknown/remote-config"
test_api "Categories (with token)" "$API_BASE/api/categories?token=$KIOSK_TOKEN"

echo "🏁 Test Complete"

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo ""
    echo "❌ API server may not be running on localhost:3000"
    echo "   Try starting it with: cd cueit-api && npm start"
fi
