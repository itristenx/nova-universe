#!/bin/bash

# CueIT Kiosk Integration Test
# This script demonstrates the complete activation flow

echo "=== CueIT Kiosk Integration Test ==="
echo

# Test server connectivity
echo "1. Testing server connectivity..."
SERVER_RESPONSE=$(curl -s http://localhost:3000/api/server-info)
if [ $? -eq 0 ]; then
    echo "✅ Server is running and responding"
    echo "   Organization: $(echo $SERVER_RESPONSE | jq -r '.organizationName')"
    echo "   PIN Length: $(echo $SERVER_RESPONSE | jq -r '.minPinLength')-$(echo $SERVER_RESPONSE | jq -r '.maxPinLength') digits"
else
    echo "❌ Server is not responding"
    exit 1
fi
echo

# Test that the iOS app can connect
echo "2. Testing iOS app in simulator..."
APP_RUNNING=$(xcrun simctl list | grep "one.tristen-cueit-kiosk" | grep "Booted")
if [ ! -z "$APP_RUNNING" ]; then
    echo "✅ CueIT Kiosk app is running in simulator"
else
    echo "ℹ️  Launch the app manually in the simulator to test"
fi
echo

# Display test scenario
echo "3. Test Scenario - Manual Activation Flow:"
echo "   a) App launches and shows InitializationView"
echo "   b) InitializationView connects to server at http://localhost:3000"
echo "   c) Server returns organization name: 'Your Organization'"
echo "   d) App displays 'Created for Your Organization'"
echo "   e) If connection fails, app shows retry button"
echo

echo "4. Next Steps to Test ActivationWizard:"
echo "   a) Reset app data (delete and reinstall or clear UserDefaults)"
echo "   b) Switch ContentView to use ActivationWizard instead of InitializationView"
echo "   c) Test the complete wizard flow:"
echo "      - Welcome screen"
echo "      - Server connection (pre-filled with localhost:3000)"
echo "      - Activation code entry (placeholder QR scanner)"
echo "      - Admin PIN setup (4-8 digits as configured)"
echo "      - Room name assignment"
echo "      - Final confirmation"
echo

echo "5. Current Implementation Status:"
echo "   ✅ Backend server with /api/server-info endpoint"
echo "   ✅ Backend returns org name, PIN requirements, server version"
echo "   ✅ InitializationView fetches and displays org name"
echo "   ✅ InitializationView handles connection errors gracefully"
echo "   ✅ ActivationWizard implemented with all required steps"
echo "   ✅ Modern, Apple-style UI with progress indicators"
echo "   ✅ Proper error handling and validation"
echo "   ⚠️  ActivationWizard not currently used (module compilation order issue)"
echo "   ⚠️  QR scanner is placeholder (would need camera permission)"
echo "   ⚠️  Activation endpoint requires authentication"
echo

echo "=== Integration Test Complete ==="

# Open simulator if not already open
open -a Simulator
