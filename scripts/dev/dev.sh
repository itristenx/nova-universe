#!/usr/bin/env bash
set -euo pipefail

# Nova Universe - Development Startup Script
# Quick start for development environment

echo "🚀 Starting Nova Universe Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start core database services
echo "🗄️  Starting database services..."
docker-compose up -d postgres mongodb redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Start the unified app
echo "🖥️  Starting unified UI..."
cd apps/unified

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if command -v pnpm >/dev/null 2>&1; then
        pnpm install
    else
        npm install
    fi
fi

# Start development server
echo "🌐 Starting development server..."
if command -v pnpm >/dev/null 2>&1; then
    pnpm dev
else
    npm run dev
fi
