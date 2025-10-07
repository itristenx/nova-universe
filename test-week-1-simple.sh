#!/bin/bash

# Week 1 Backend API Testing Script (Simplified)
echo "=================================================="
echo "Week 1 Backend API Testing"
echo "=================================================="
echo ""

API_URL="http://localhost:3000"

echo "1. Testing Knowledge Base APIs (Public)"
echo "--------------------------------------------------"
echo "GET /api/v1/knowledge/popular"
curl -s "${API_URL}/api/v1/knowledge/popular" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/knowledge/popular"
echo -e "\n"

echo "GET /api/v1/knowledge/categories"
curl -s "${API_URL}/api/v1/knowledge/categories" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/knowledge/categories"
echo -e "\n"

echo "GET /api/v1/knowledge/search?q=password"
curl -s "${API_URL}/api/v1/knowledge/search?q=password" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/knowledge/search?q=password"
echo -e "\n"

echo ""
echo "2. Testing Services APIs (Public)"
echo "--------------------------------------------------"
echo "GET /api/v1/services/popular"
curl -s "${API_URL}/api/v1/services/popular" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/services/popular"
echo -e "\n"

echo "GET /api/v1/services/featured"
curl -s "${API_URL}/api/v1/services/featured" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/services/featured"
echo -e "\n"

echo "GET /api/v1/services/categories"
curl -s "${API_URL}/api/v1/services/categories" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/services/categories"
echo -e "\n"

echo ""
echo "3. Testing Agent Portal APIs (Protected - expect 401)"
echo "--------------------------------------------------"
echo "GET /api/v1/agent/queue"
curl -s "${API_URL}/api/v1/agent/queue" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/agent/queue"
echo -e "\n"

echo "GET /api/v1/agent/stats"
curl -s "${API_URL}/api/v1/agent/stats" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/agent/stats"
echo -e "\n"

echo ""
echo "4. Testing Directory APIs (Protected - expect 401)"
echo "--------------------------------------------------"
echo "GET /api/v1/directory/users"
curl -s "${API_URL}/api/v1/directory/users" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/directory/users"
echo -e "\n"

echo "GET /api/v1/directory/groups"
curl -s "${API_URL}/api/v1/directory/groups" | jq '.' 2>/dev/null || curl -s "${API_URL}/api/v1/directory/groups"
echo -e "\n"

echo ""
echo "=================================================="
echo "Testing Complete"
echo "=================================================="
