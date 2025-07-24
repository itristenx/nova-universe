#!/bin/bash

# Nova Beacon - Clean Build Script
# This script cleans Xcode derived data and rebuilds the project

echo "🧹 Cleaning Nova Beacon build environment..."

# Clean Xcode derived data
echo "Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Nova*

# Navigate to project directory
cd "$(dirname "$0")/Nova Beacon"

# Clean the project
echo "Cleaning Xcode project..."
xcodebuild clean -project "Nova Beacon.xcodeproj" -scheme "Nova Beacon" -configuration Debug

# Build the project
echo "Building Nova Beacon..."
xcodebuild build -project "Nova Beacon.xcodeproj" -scheme "Nova Beacon" -configuration Debug -destination "platform=iOS Simulator,name=iPad Pro 13-inch (M4)"

echo "✅ Build complete!"
