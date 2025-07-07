#!/bin/bash

echo "🧪 Testing CueIT Local Setup"
echo "================================="

# Test API
echo "Testing API..."
api_response=$(curl -s http://localhost:3000/api/health)
if [[ "$api_response" == '{"ok":true}' ]]; then
  echo "✅ API is running at http://localhost:3000"
else
  echo "❌ API is not responding correctly"
fi

# Test Admin UI (try both possible ports)
echo "Testing Admin UI..."
admin_response_5173=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null)
admin_response_5174=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174 2>/dev/null)

admin_port=""
if [[ "$admin_response_5173" == "200" ]]; then
  admin_port="5173"
elif [[ "$admin_response_5174" == "200" ]]; then
  admin_port="5174"
fi

if [[ -n "$admin_port" ]]; then
  echo "✅ Admin UI is running at http://localhost:$admin_port"
else
  echo "❌ Admin UI is not responding correctly"
  exit 1
fi

echo ""
echo "🚀 Access your applications:"
if [[ -n "$admin_port" ]]; then
  echo "   Admin UI:      http://localhost:$admin_port"
else
  echo "   Admin UI:      http://localhost:5173 (default)"
fi
echo "   API:           http://localhost:3000"
echo ""
echo "📝 Note: Authentication is disabled for development (DISABLE_AUTH=true)"
