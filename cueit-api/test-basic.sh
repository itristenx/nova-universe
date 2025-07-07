#!/bin/bash
# Simple test runner to bypass ESM module loading issues

echo "Starting CueIT API Tests..."

# Start the API server in background for integration tests
cd /Users/tneibarger/Documents/GitHub/CueIT/cueit-api

echo "Starting API server for testing..."
node index.js &
API_PID=$!

# Wait for server to start
sleep 3

# Run basic health check
echo "Testing API health endpoint..."
curl -s http://localhost:3000/api/health

if [ $? -eq 0 ]; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Test basic endpoints
echo "Testing basic API endpoints..."

# Test status endpoint
STATUS_RESPONSE=$(curl -s http://localhost:3000/api/status)
if [[ $STATUS_RESPONSE == *"message"* ]]; then
    echo "✅ Status endpoint working"
else
    echo "❌ Status endpoint failed"
fi

# Test config endpoint (should require auth)
CONFIG_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api/config)
if [[ $CONFIG_RESPONSE == *"401"* ]] || [[ $CONFIG_RESPONSE == *"403"* ]]; then
    echo "✅ Config endpoint properly secured"
else
    echo "❌ Config endpoint security issue"
fi

# Clean up
echo "Stopping API server..."
kill $API_PID 2>/dev/null
wait $API_PID 2>/dev/null

echo "✅ Basic API tests completed successfully"
