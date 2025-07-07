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

# Test Admin UI
echo "Testing Admin UI..."
admin_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [[ "$admin_response" == "200" ]]; then
  echo "✅ Admin UI is running at http://localhost:5173"
else
  echo "❌ Admin UI is not responding correctly"
fi

echo ""
echo "🚀 Access your applications:"
echo "   Admin UI:      http://localhost:5173"
echo "   API:           http://localhost:3000"
echo ""
echo "📝 Note: Authentication is disabled for development (DISABLE_AUTH=true)"
