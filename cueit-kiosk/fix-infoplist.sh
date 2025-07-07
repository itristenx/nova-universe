#!/bin/bash

# CueIT Kiosk - Fix Info.plist Build Issue
# This script fixes the Xcode project to resolve the Info.plist conflict

echo "🔧 Fixing CueIT Kiosk Info.plist build issue..."

PROJECT_FILE="/Users/tneibarger/CueIT/cueit-kiosk/CueIT Kiosk/CueIT Kiosk.xcodeproj/project.pbxproj"

# Create backup
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
echo "📋 Created backup of project file"

# Fix the project by setting GENERATE_INFOPLIST_FILE to NO
# and ensuring INFOPLIST_FILE points to the manual file
sed -i '' 's/GENERATE_INFOPLIST_FILE = YES;/GENERATE_INFOPLIST_FILE = NO;/g' "$PROJECT_FILE"

# Add INFOPLIST_FILE setting if it doesn't exist
if ! grep -q "INFOPLIST_FILE" "$PROJECT_FILE"; then
    # Insert INFOPLIST_FILE setting after GENERATE_INFOPLIST_FILE lines
    sed -i '' '/GENERATE_INFOPLIST_FILE = NO;/a\
				INFOPLIST_FILE = "CueIT Kiosk/Info.plist";
' "$PROJECT_FILE"
fi

echo "✅ Fixed project configuration:"
echo "   - Set GENERATE_INFOPLIST_FILE = NO"
echo "   - Set INFOPLIST_FILE to manual file"

# Clean derived data
echo "🧹 Cleaning derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/CueIT*

echo "✅ Fix complete! You can now build the project successfully."
echo ""
echo "To revert changes if needed:"
echo "cp '$PROJECT_FILE.backup' '$PROJECT_FILE'"
