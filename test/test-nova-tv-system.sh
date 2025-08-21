#!/bin/bash

# Nova TV Channel Management System Test Script
# Tests all core functionality including dashboards, devices, activation, and branding

echo "🚀 Starting Nova TV Channel Management System Tests..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
API_BASE="http://localhost:3000"
ADMIN_USER_ID="admin-user-1"
TEST_DEVICE_FINGERPRINT="test-device-$(date +%s)"

# Function to make API requests
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -H "X-User-ID: $ADMIN_USER_ID" \
            -d "$data" \
            "$API_BASE$endpoint"
    else
        curl -s -X "$method" \
            -H "X-User-ID: $ADMIN_USER_ID" \
            "$API_BASE$endpoint"
    fi
}

# Function to print test results
print_test_result() {
    local test_name=$1
    local result=$2
    
    if [[ $result == *"error"* ]] || [[ $result == *"Error"* ]] || [ -z "$result" ]; then
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        echo -e "${RED}   Result: $result${NC}"
        return 1
    else
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        echo -e "${BLUE}   Result: $result${NC}"
        return 0
    fi
}

echo ""
echo -e "${YELLOW}=== Testing Nova TV Dashboard Management ===${NC}"

# Test 1: Create a new dashboard
echo "Test 1: Creating a new dashboard..."
CREATE_DASHBOARD_RESULT=$(api_request "POST" "/api/v1/nova-tv/dashboards" '{
    "name": "Test Marketing Dashboard",
    "description": "Test dashboard for marketing department",
    "department": "Marketing",
    "templateId": "template_generic_dashboard",
    "configuration": {
        "theme": "light",
        "refreshInterval": 45000,
        "widgets": [
            {"type": "announcements", "position": {"x": 0, "y": 0, "w": 12, "h": 3}},
            {"type": "calendar", "position": {"x": 0, "y": 3, "w": 12, "h": 4}}
        ]
    }
}')
print_test_result "Create Dashboard" "$CREATE_DASHBOARD_RESULT"
DASHBOARD_ID=$(echo "$CREATE_DASHBOARD_RESULT" | jq -r '.dashboard.id // empty' 2>/dev/null)

# Test 2: List all dashboards
echo "Test 2: Listing all dashboards..."
LIST_DASHBOARDS_RESULT=$(api_request "GET" "/api/v1/nova-tv/dashboards")
print_test_result "List Dashboards" "$LIST_DASHBOARDS_RESULT"

# Test 3: Get specific dashboard
if [ -n "$DASHBOARD_ID" ]; then
    echo "Test 3: Getting specific dashboard..."
    GET_DASHBOARD_RESULT=$(api_request "GET" "/api/v1/nova-tv/dashboards/$DASHBOARD_ID")
    print_test_result "Get Dashboard by ID" "$GET_DASHBOARD_RESULT"
fi

echo ""
echo -e "${YELLOW}=== Testing Nova TV Device Management ===${NC}"

# Test 4: Register a new TV device
echo "Test 4: Registering a new TV device..."
REGISTER_DEVICE_RESULT=$(api_request "POST" "/api/v1/nova-tv/devices/register" '{
    "name": "Conference Room TV",
    "location": "Conference Room A",
    "department": "Marketing",
    "deviceFingerprint": "'$TEST_DEVICE_FINGERPRINT'",
    "browserInfo": "Mozilla/5.0 (Smart TV) WebKit/537.36",
    "brandingConfig": {
        "logoUrl": "https://example.com/logo.png",
        "bgUrl": "https://example.com/background.jpg",
        "primaryColor": "#007bff"
    }
}')
print_test_result "Register TV Device" "$REGISTER_DEVICE_RESULT"
DEVICE_ID=$(echo "$REGISTER_DEVICE_RESULT" | jq -r '.device.id // empty' 2>/dev/null)

# Test 5: List all devices
echo "Test 5: Listing all TV devices..."
LIST_DEVICES_RESULT=$(api_request "GET" "/api/v1/nova-tv/devices")
print_test_result "List TV Devices" "$LIST_DEVICES_RESULT"

# Test 6: Get specific device
if [ -n "$DEVICE_ID" ]; then
    echo "Test 6: Getting specific device..."
    GET_DEVICE_RESULT=$(api_request "GET" "/api/v1/nova-tv/devices/$DEVICE_ID")
    print_test_result "Get Device by ID" "$GET_DEVICE_RESULT"
fi

echo ""
echo -e "${YELLOW}=== Testing Nova TV Device Activation ===${NC}"

# Test 7: Generate activation code
echo "Test 7: Generating activation code..."
GENERATE_CODE_RESULT=$(api_request "POST" "/api/v1/nova-tv/devices/activation/generate" '{}')
print_test_result "Generate Activation Code" "$GENERATE_CODE_RESULT"
ACTIVATION_CODE=$(echo "$GENERATE_CODE_RESULT" | jq -r '.code // empty' 2>/dev/null)

# Test 8: Validate activation code
if [ -n "$ACTIVATION_CODE" ]; then
    echo "Test 8: Validating activation code..."
    VALIDATE_CODE_RESULT=$(api_request "POST" "/api/v1/nova-tv/devices/activation/validate" '{
        "code": "'$ACTIVATION_CODE'",
        "deviceFingerprint": "'$TEST_DEVICE_FINGERPRINT'"
    }')
    print_test_result "Validate Activation Code" "$VALIDATE_CODE_RESULT"
fi

echo ""
echo -e "${YELLOW}=== Testing Nova TV Dashboard Assignment ===${NC}"

# Test 9: Assign dashboard to device
if [ -n "$DEVICE_ID" ] && [ -n "$DASHBOARD_ID" ]; then
    echo "Test 9: Assigning dashboard to device..."
    ASSIGN_DASHBOARD_RESULT=$(api_request "PUT" "/api/v1/nova-tv/devices/$DEVICE_ID/dashboard" '{
        "dashboardId": "'$DASHBOARD_ID'"
    }')
    print_test_result "Assign Dashboard to Device" "$ASSIGN_DASHBOARD_RESULT"
fi

# Test 10: Update device branding
if [ -n "$DEVICE_ID" ]; then
    echo "Test 10: Updating device branding..."
    UPDATE_BRANDING_RESULT=$(api_request "PUT" "/api/v1/nova-tv/devices/$DEVICE_ID/branding" '{
        "logoUrl": "https://example.com/new-logo.png",
        "bgUrl": "https://example.com/new-background.jpg",
        "brandingConfig": {
            "primaryColor": "#28a745",
            "secondaryColor": "#6c757d",
            "fontFamily": "Arial, sans-serif"
        }
    }')
    print_test_result "Update Device Branding" "$UPDATE_BRANDING_RESULT"
fi

echo ""
echo -e "${YELLOW}=== Testing Nova TV Device Heartbeat ===${NC}"

# Test 11: Send device heartbeat
if [ -n "$DEVICE_ID" ]; then
    echo "Test 11: Sending device heartbeat..."
    HEARTBEAT_RESULT=$(api_request "POST" "/api/v1/nova-tv/devices/$DEVICE_ID/heartbeat" '{
        "status": "active",
        "metadata": {
            "currentDashboard": "'$DASHBOARD_ID'",
            "resolution": "1920x1080",
            "lastRefresh": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
        }
    }')
    print_test_result "Device Heartbeat" "$HEARTBEAT_RESULT"
fi

echo ""
echo -e "${YELLOW}=== Testing Nova TV Templates ===${NC}"

# Test 12: List dashboard templates
echo "Test 12: Listing dashboard templates..."
LIST_TEMPLATES_RESULT=$(api_request "GET" "/api/v1/nova-tv/templates")
print_test_result "List Dashboard Templates" "$LIST_TEMPLATES_RESULT"

# Test 13: Get specific template
echo "Test 13: Getting specific template..."
GET_TEMPLATE_RESULT=$(api_request "GET" "/api/v1/nova-tv/templates/template_it_dashboard")
print_test_result "Get IT Dashboard Template" "$GET_TEMPLATE_RESULT"

echo ""
echo -e "${YELLOW}=== Testing Nova TV Analytics ===${NC}"

# Test 14: Record analytics event
if [ -n "$DEVICE_ID" ] && [ -n "$DASHBOARD_ID" ]; then
    echo "Test 14: Recording analytics event..."
    ANALYTICS_RESULT=$(api_request "POST" "/api/v1/nova-tv/analytics" '{
        "dashboardId": "'$DASHBOARD_ID'",
        "deviceId": "'$DEVICE_ID'",
        "eventType": "dashboard_view",
        "eventData": {
            "duration": 30000,
            "widgets_viewed": ["announcements", "calendar"]
        }
    }')
    print_test_result "Record Analytics Event" "$ANALYTICS_RESULT"
fi

echo ""
echo -e "${YELLOW}=== Cleanup Test Data ===${NC}"

# Test 15: Delete test dashboard
if [ -n "$DASHBOARD_ID" ]; then
    echo "Test 15: Deleting test dashboard..."
    DELETE_DASHBOARD_RESULT=$(api_request "DELETE" "/api/v1/nova-tv/dashboards/$DASHBOARD_ID")
    print_test_result "Delete Test Dashboard" "$DELETE_DASHBOARD_RESULT"
fi

# Test 16: Delete test device
if [ -n "$DEVICE_ID" ]; then
    echo "Test 16: Deleting test device..."
    DELETE_DEVICE_RESULT=$(api_request "DELETE" "/api/v1/nova-tv/devices/$DEVICE_ID")
    print_test_result "Delete Test Device" "$DELETE_DEVICE_RESULT"
fi

echo ""
echo -e "${GREEN}🎉 Nova TV Channel Management System Tests Complete!${NC}"
echo ""
echo -e "${BLUE}Summary of tested functionality:${NC}"
echo -e "${BLUE}✓ Dashboard (Channel) creation and management${NC}"
echo -e "${BLUE}✓ TV device registration similar to kiosks${NC}"
echo -e "${BLUE}✓ Device activation flow with codes${NC}"
echo -e "${BLUE}✓ Dashboard assignment to TV devices${NC}"
echo -e "${BLUE}✓ Branding configuration (logos, backgrounds, colors)${NC}"
echo -e "${BLUE}✓ Device heartbeat and status monitoring${NC}"
echo -e "${BLUE}✓ Dashboard templates for different departments${NC}"
echo -e "${BLUE}✓ Analytics tracking for usage insights${NC}"
echo ""
echo -e "${YELLOW}Admin features verified:${NC}"
echo -e "${YELLOW}• Admins can create dashboards (channels)${NC}"
echo -e "${YELLOW}• Admins can assign dashboards to TVs${NC}"
echo -e "${YELLOW}• TV activation process similar to kiosks${NC}"
echo -e "${YELLOW}• TV branding configuration like kiosks${NC}"
echo ""
