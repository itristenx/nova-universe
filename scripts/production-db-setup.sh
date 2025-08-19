#!/bin/bash

# Nova Universe Production Database Setup and Migration Script
# This script handles database initialization, migrations, and health checks for production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PRISMA_DIR="$PROJECT_ROOT/prisma"
API_DIR="$PROJECT_ROOT/apps/api"

# Environment variables with defaults
DATABASE_URL="${DATABASE_URL:-}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-nova_universe}"
POSTGRES_USER="${POSTGRES_USER:-nova_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        log_error "psql (PostgreSQL client) is required but not installed"
        exit 1
    fi
    
    # Check if prisma is available
    if ! command -v npx &> /dev/null; then
        log_error "npx (Node.js) is required but not installed"
        exit 1
    fi
    
    # Check if required environment variables are set
    if [ -z "$POSTGRES_PASSWORD" ]; then
        log_error "POSTGRES_PASSWORD environment variable is required"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

wait_for_database() {
    log_info "Waiting for database to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" &> /dev/null; then
            log_success "Database is ready"
            return 0
        fi
        
        log_info "Database not ready, attempt $attempt/$max_attempts"
        sleep 2
        ((attempt++))
    done
    
    log_error "Database failed to become ready after $max_attempts attempts"
    exit 1
}

backup_database() {
    if [ "$1" == "true" ]; then
        log_info "Creating database backup..."
        
        # Create backup directory
        mkdir -p "$BACKUP_DIR"
        
        local backup_file="$BACKUP_DIR/nova_universe_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$backup_file"; then
            log_success "Database backup created: $backup_file"
        else
            log_warning "Failed to create database backup"
        fi
    fi
}

run_migrations() {
    log_info "Running database migrations..."

    cd "$PROJECT_ROOT"

    # Set DATABASE_URL if not provided
    if [ -z "$DATABASE_URL" ]; then
        export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"
    fi

    # Run migrations across all Prisma schemas
    if "$PROJECT_ROOT/scripts/run-prisma-migrations.sh"; then
        log_success "Database migrations completed"
    else
        log_error "Database migrations failed"
        exit 1
    fi

    # Generate Prisma clients for each schema
    for schema in core auth cmdb integration notification user360 audit; do
        if [ -f "$PRISMA_DIR/$schema/schema.prisma" ]; then
            if npx prisma generate --schema="$PRISMA_DIR/$schema/schema.prisma"; then
                log_info "Generated Prisma client for $schema"
            else
                log_error "Prisma client generation failed for $schema"
                exit 1
            fi
        fi
    done
}

seed_database() {
    if [ "$1" == "true" ]; then
        log_info "Seeding database with initial data..."
        
        cd "$API_DIR"
        
        # Run database seeding
        if node -e "
            const { initializeDatabase } = require('./db.js');
            initializeDatabase().then(() => {
                console.log('Database seeding completed');
                process.exit(0);
            }).catch((error) => {
                console.error('Database seeding failed:', error);
                process.exit(1);
            });
        "; then
            log_success "Database seeding completed"
        else
            log_error "Database seeding failed"
            exit 1
        fi
    fi
}

verify_database() {
    log_info "Verifying database setup..."
    
    # Check if tables exist
    local table_count=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    
    if [ "$table_count" -gt 0 ]; then
        log_success "Database verification passed - $table_count tables found"
    else
        log_error "Database verification failed - no tables found"
        exit 1
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only the last 7 days of backups
    find "$BACKUP_DIR" -name "nova_universe_backup_*.sql" -type f -mtime +7 -delete 2>/dev/null || true
    
    log_success "Old backups cleaned up"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backup          Create a backup before running migrations"
    echo "  --seed            Seed the database with initial data"
    echo "  --no-migrations   Skip running migrations"
    echo "  --help            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL      Full database connection string (optional)"
    echo "  POSTGRES_HOST     Database host (default: localhost)"
    echo "  POSTGRES_PORT     Database port (default: 5432)"
    echo "  POSTGRES_DB       Database name (default: nova_universe)"
    echo "  POSTGRES_USER     Database user (default: nova_user)"
    echo "  POSTGRES_PASSWORD Database password (required)"
    echo "  BACKUP_DIR        Backup directory (default: ./backups)"
}

# Main execution
main() {
    local create_backup=false
    local seed_data=false
    local run_migrations_flag=true
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backup)
                create_backup=true
                shift
                ;;
            --seed)
                seed_data=true
                shift
                ;;
            --no-migrations)
                run_migrations_flag=false
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Nova Universe Production Database Setup"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    wait_for_database
    backup_database "$create_backup"
    
    if [ "$run_migrations_flag" == "true" ]; then
        run_migrations
    fi
    
    seed_database "$seed_data"
    verify_database
    cleanup_old_backups
    
    echo ""
    log_success "Production database setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start your Nova Universe API server"
    echo "2. Verify the application is working correctly"
    echo "3. Set up monitoring and alerts"
}

# Run main function with all arguments
main "$@"
