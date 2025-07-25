#!/bin/bash
# Test script to verify API fixes

echo "🔍 Testing CueIT API fixes..."

# Test 1: Health check
echo "1. Testing API health endpoint..."
if curl -s -f http://localhost:3000/api/health > /dev/null; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
fi

# Test 2: Remote config for unknown kiosk (should now work)
echo "2. Testing remote config for unknown kiosk..."
RESPONSE=$(curl -s http://localhost:3000/api/kiosks/unknown/remote-config)
if echo "$RESPONSE" | grep -q "config"; then
    echo "✅ Remote config endpoint working"
else
    echo "❌ Remote config endpoint failed"
    echo "Response: $RESPONSE"
fi

# Test 3: Kiosk endpoint with UUID
echo "3. Testing kiosk endpoint with UUID..."
RESPONSE=$(curl -s http://localhost:3000/api/kiosks/85201C53-7ABC-46DF-AE0B-661860ACB1FD)
if echo "$RESPONSE" | grep -q -v "Unauthorized"; then
    echo "✅ Kiosk UUID endpoint working"
else
    echo "❌ Kiosk UUID endpoint still unauthorized"
    echo "Response: $RESPONSE"
fi

# Test 4: Admin UI connectivity
echo "4. Testing admin UI..."
if curl -s -f http://localhost:5173 > /dev/null; then
    echo "✅ Admin UI accessible"
else
    echo "❌ Admin UI not accessible"
fi

echo "🏁 Test completed"
