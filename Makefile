# Nova Universe - Development Makefile
# Common commands for development and deployment

.PHONY: help setup dev build test clean docker-up docker-down docker-logs reset

# Default target
help:
	@echo "Nova Universe - Available Commands"
	@echo "=================================="
	@echo ""
	@echo "Setup & Development:"
	@echo "  setup          Run complete setup (databases + dependencies)"
	@echo "  dev            Start development environment"
	@echo "  build          Build for production"
	@echo "  test           Run tests"
	@echo "  clean          Clean build artifacts and dependencies"
	@echo ""
	@echo "Docker Management:"
	@echo "  docker-up      Start core database services"
	@echo "  docker-full    Start all services (full profile)"
	@echo "  docker-down    Stop all services"
	@echo "  docker-logs    View service logs"
	@echo "  docker-status  Check service status"
	@echo ""
	@echo "Database:"
	@echo "  db-migrate     Run database migrations"
	@echo "  db-reset       Reset database (WARNING: destroys data)"
	@echo ""
	@echo "Utilities:"
	@echo "  reset          Complete system reset (WARNING: destroys all data)"
	@echo "  logs           View application logs"

# Setup and development
setup:
	@echo "🚀 Setting up Nova Universe..."
	./setup.sh

dev:
	@echo "🖥️  Starting development environment..."
	./dev.sh

build:
	@echo "🔨 Building for production..."
	cd apps/unified && pnpm build

test:
	@echo "🧪 Running tests..."
	cd apps/unified && pnpm test

clean:
	@echo "🧹 Cleaning build artifacts..."
	cd apps/unified && rm -rf dist node_modules
	rm -rf node_modules

# Docker management
docker-up:
	@echo "🐳 Starting core database services..."
	docker-compose up -d postgres mongodb redis

docker-full:
	@echo "🐳 Starting all services (full profile)..."
	docker-compose --profile full up -d

docker-down:
	@echo "🐳 Stopping all services..."
	docker-compose down

docker-logs:
	@echo "📋 Viewing service logs..."
	docker-compose logs -f

docker-status:
	@echo "🔍 Checking service status..."
	docker-compose ps

# Database operations
db-migrate:
	@echo "🗃️  Running database migrations..."
	cd prisma && npx prisma migrate deploy && npx prisma generate

db-reset:
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
		docker-compose up -d postgres mongodb redis; \
		sleep 10; \
		cd prisma && npx prisma migrate deploy && npx prisma generate; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Database reset cancelled"; \
	fi

# Utilities
reset:
	@echo "⚠️  WARNING: This will destroy ALL data and reset everything!"
	@read -p "Are you sure? Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v; \
		rm -rf node_modules apps/*/node_modules; \
		rm -f .env; \
		echo "✅ Complete reset complete. Run 'make setup' to start over."; \
	else \
		echo "❌ Reset cancelled"; \
	fi

logs:
	@echo "📋 Viewing application logs..."
	@if [ -f "apps/unified/ui.log" ]; then \
		tail -f apps/unified/ui.log; \
	else \
		echo "No log file found. Start the application first."; \
	fi

# Quick start for new developers
quickstart:
	@echo "🚀 Quick start for new developers..."
	@echo "1. Run: make setup"
	@echo "2. Run: make dev"
	@echo "3. Visit: http://localhost:5173"
	@echo "4. Run setup wizard at: http://localhost:5173/setup"
