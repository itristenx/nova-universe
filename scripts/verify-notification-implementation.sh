#!/bin/bash

# Nova Universal Notification Platform Implementation Verification
echo "🚀 Nova Universal Notification Platform - Implementation Verification"
echo "====================================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "✅" ]; then
        echo -e "${GREEN}$status $message${NC}"
    elif [ "$status" = "⚠️" ]; then
        echo -e "${YELLOW}$status $message${NC}"
    else
        echo -e "${RED}$status $message${NC}"
    fi
}

echo
echo "📋 Checking Implementation Completeness..."
echo

# Check core files
files_to_check=(
    "prisma/notification/schema.prisma"
    "src/lib/notification/nova-notification-platform.ts"
    "apps/api/routes/notifications.js"
    "apps/api/middleware/auth.js"
    "src/lib/database/clients.js"
    "test/notification-platform.test.js"
    "docs/NOVA_UNIVERSAL_NOTIFICATION_PLATFORM.md"
    "prisma/notification/migrations/20241226_001_init_notification_system/migration.sql"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "✅" "Core file exists: $file"
    else
        print_status "❌" "Missing core file: $file"
    fi
done

echo
echo "🗄️ Database Schema Verification..."
echo

# Check if Prisma generated client exists
if [ -d "prisma/generated/notification" ]; then
    print_status "✅" "Notification Prisma client generated"
else
    print_status "⚠️" "Notification Prisma client not generated - run 'npx prisma generate --schema=prisma/notification/schema.prisma'"
fi

# Check schema components
schema_components=(
    "NotificationEvent"
    "NotificationPreference"
    "NotificationDelivery"
    "NotificationProvider"
    "NotificationQueue"
    "NotificationTemplate"
    "NotificationAnalytics"
    "HelixUserNotificationProfile"
    "NotificationRoleDefault"
    "NotificationAuditLog"
)

for component in "${schema_components[@]}"; do
    if grep -q "model $component" prisma/notification/schema.prisma 2>/dev/null; then
        print_status "✅" "Schema model: $component"
    else
        print_status "❌" "Missing schema model: $component"
    fi
done

echo
echo "🔌 API Integration Verification..."
echo

# Check if notification routes are registered in main API
if grep -q "notificationsRouter" apps/api/index.js 2>/dev/null; then
    print_status "✅" "Notification routes registered in main API"
else
    print_status "❌" "Notification routes not registered in main API"
fi

# Check API endpoints
api_endpoints=(
    "POST /api/v2/notifications/send"
    "POST /api/v2/notifications/send/batch"
    "GET /api/v2/notifications/preferences"
    "PUT /api/v2/notifications/preferences"
    "GET /api/v2/notifications/health"
)

for endpoint in "${api_endpoints[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    path=$(echo $endpoint | cut -d' ' -f2)
    
    if grep -q "router\.$method.*$path" apps/api/routes/notifications.js 2>/dev/null; then
        print_status "✅" "API endpoint: $endpoint"
    else
        print_status "❌" "Missing API endpoint: $endpoint"
    fi
done

echo
echo "🔧 Service Implementation Verification..."
echo

# Check service class methods
service_methods=(
    "sendNotification"
    "getUserPreferences"
    "updateUserPreferences"
    "sendBatch"
    "scheduleNotification"
    "cancelNotification"
)

for method in "${service_methods[@]}"; do
    if grep -q "async $method" src/lib/notification/nova-notification-platform.ts 2>/dev/null; then
        print_status "✅" "Service method: $method"
    else
        print_status "❌" "Missing service method: $method"
    fi
done

echo
echo "🛡️ Security & Middleware Verification..."
echo

# Check middleware components
middleware_components=(
    "authenticateJWT"
    "requirePermission"
    "createRateLimit"
)

for component in "${middleware_components[@]}"; do
    if grep -q "$component" apps/api/middleware/auth.js 2>/dev/null; then
        print_status "✅" "Middleware: $component"
    else
        print_status "❌" "Missing middleware: $component"
    fi
done

echo
echo "📊 Test Coverage Verification..."
echo

# Check test components
test_components=(
    "NovaUniversalNotificationPlatform"
    "sendNotification"
    "getUserPreferences"
    "updateUserPreferences"
    "API Routes"
    "Authentication"
    "Rate Limiting"
)

for component in "${test_components[@]}"; do
    if grep -q "$component" test/notification-platform.test.js 2>/dev/null; then
        print_status "✅" "Test coverage: $component"
    else
        print_status "❌" "Missing test coverage: $component"
    fi
done

echo
echo "📚 Documentation Verification..."
echo

# Check documentation sections
doc_sections=(
    "Implementation Status"
    "Architecture"
    "API Endpoints"
    "Usage Examples"
    "Security Features"
    "Migration Guide"
)

for section in "${doc_sections[@]}"; do
    if grep -q "$section" docs/NOVA_UNIVERSAL_NOTIFICATION_PLATFORM.md 2>/dev/null; then
        print_status "✅" "Documentation section: $section"
    else
        print_status "❌" "Missing documentation section: $section"
    fi
done

echo
echo "🔄 Integration Points Verification..."
echo

# Check integration points
integration_points=(
    "Sentinel NotificationService"
    "GoAlert notifications"
    "Helix user management"
    "Nova Core integration"
    "Multi-database support"
)

for integration in "${integration_points[@]}"; do
    if grep -qi "$integration" docs/NOVA_UNIVERSAL_NOTIFICATION_PLATFORM.md 2>/dev/null; then
        print_status "✅" "Integration documented: $integration"
    else
        print_status "⚠️" "Integration needs attention: $integration"
    fi
done

echo
echo "📈 Analytics & Monitoring Verification..."
echo

# Check analytics components
analytics_components=(
    "NotificationAnalytics"
    "DeliveryStatus"
    "Performance metrics"
    "Health checks"
)

for component in "${analytics_components[@]}"; do
    if grep -qi "$component" src/lib/notification/nova-notification-platform.ts 2>/dev/null || grep -qi "$component" prisma/notification/schema.prisma 2>/dev/null; then
        print_status "✅" "Analytics component: $component"
    else
        print_status "❌" "Missing analytics component: $component"
    fi
done

echo
echo "====================================================================="
echo "🎯 IMPLEMENTATION SUMMARY"
echo "====================================================================="

total_checks=0
passed_checks=0

# Count total files
for file in "${files_to_check[@]}"; do
    total_checks=$((total_checks + 1))
    if [ -f "$file" ]; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Count schema models
for component in "${schema_components[@]}"; do
    total_checks=$((total_checks + 1))
    if grep -q "model $component" prisma/notification/schema.prisma 2>/dev/null; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Count API endpoints
for endpoint in "${api_endpoints[@]}"; do
    total_checks=$((total_checks + 1))
    method=$(echo $endpoint | cut -d' ' -f1 | tr '[:upper:]' '[:lower:]')
    if grep -q "router\.$method" apps/api/routes/notifications.js 2>/dev/null; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Count service methods
for method in "${service_methods[@]}"; do
    total_checks=$((total_checks + 1))
    if grep -q "async $method" src/lib/notification/nova-notification-platform.ts 2>/dev/null; then
        passed_checks=$((passed_checks + 1))
    fi
done

completion_percentage=$(( (passed_checks * 100) / total_checks ))

echo
print_status "📊" "Implementation Progress: $passed_checks/$total_checks checks passed ($completion_percentage%)"

if [ $completion_percentage -ge 90 ]; then
    print_status "🎉" "EXCELLENT: Implementation is nearly complete and ready for production!"
elif [ $completion_percentage -ge 75 ]; then
    print_status "👍" "GOOD: Implementation is mostly complete with minor items remaining"
elif [ $completion_percentage -ge 50 ]; then
    print_status "⚠️" "PARTIAL: Implementation is in progress but needs more work"
else
    print_status "❌" "INCOMPLETE: Implementation needs significant work"
fi

echo
echo "🔧 Next Steps:"
echo "1. Generate Prisma client: npx prisma generate --schema=prisma/notification/schema.prisma"
echo "2. Run database migrations: npx prisma migrate deploy --schema=prisma/notification/schema.prisma"
echo "3. Test API endpoints with authentication"
echo "4. Configure notification providers (SMTP, SMS, etc.)"
echo "5. Integrate with existing Nova modules"
echo
echo "📖 Full documentation: docs/NOVA_UNIVERSAL_NOTIFICATION_PLATFORM.md"
echo "🧪 Run tests: npm test test/notification-platform.test.js"
echo
echo "✨ Nova Universal Notification Platform - Unifying Nova's notification experience!"
