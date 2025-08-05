#!/bin/bash

# Script to replace custom UI components with HeroUI components

echo "Replacing custom UI components with HeroUI across the codebase..."

# Files to process
FILES=(
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/TicketsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/ModuleManagementPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/APIDocumentationPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/AnalyticsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/knowledge/KnowledgeDetailPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/knowledge/KnowledgeEditPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/knowledge/KnowledgeListPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/ConfigurationPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/IntegrationsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/NotificationsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/UserManagementPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/UsersPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/KiosksPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/EmailAccountsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/auth/LoginPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/CatalogItemsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/SettingsPage.tsx"
  "/Users/tneibarger/Documents/GitHub/nova-universe/apps/core/nova-core/src/pages/VIPManagementPage.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Replace @/components/ui imports with @heroui/react
    sed -i '' 's/from '\''@\/components\/ui'\'';/from '\''@heroui\/react'\'';/g' "$file"
    
    # Add common HeroUI imports that might be missing
    # This is a basic replacement - manual fixes may still be needed
    echo "  - Updated imports"
  else
    echo "File not found: $file"
  fi
done

echo "Basic replacements complete. Manual fixes may still be needed for component-specific props."
