#!/bin/bash
# Database restore script for Nova Universe
# Supports PostgreSQL and MongoDB restore from backups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Configuration
BACKUP_DIR="/backups"

# Usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --postgres FILE    Restore PostgreSQL from backup file"
    echo "  -m, --mongodb FILE     Restore MongoDB from backup file"
    echo "  -l, --list             List available backups"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Environment:"
    echo "  FORCE=true             Skip interactive confirmation prompts"
    echo ""
    echo "Examples:"
    echo "  FORCE=true $0 --postgres /backups/postgres/nova_universe_20240315_120000.sql.gz"
}

# List available backups
list_backups() {
    log "Available backups:"
    echo ""
    
    info "PostgreSQL Backups:"
    if [ -d "$BACKUP_DIR/postgres" ]; then
        ls -la "$BACKUP_DIR/postgres"/*.sql.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        echo "  No PostgreSQL backups found"
    fi
    
    echo ""
    info "MongoDB Backups:"
    if [ -d "$BACKUP_DIR/mongodb" ]; then
        ls -la "$BACKUP_DIR/mongodb"/*.tar.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        echo "  No MongoDB backups found"
    fi
}

# Restore PostgreSQL
restore_postgres() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        error "PostgreSQL backup file not found: $backup_file"
    fi
    
    log "Restoring PostgreSQL from: $backup_file"
    
    # Check if PostgreSQL is available
    if ! pg_isready -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" >/dev/null 2>&1; then
        error "PostgreSQL is not available at $POSTGRES_HOST:5432"
    fi
    
    # Confirmation prompt (skip with FORCE=true)
    if [[ "${FORCE:-}" != "true" ]]; then
        warn "This will COMPLETELY REPLACE the current database!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Restore cancelled by user"
            exit 0
        fi
    else
        warn "FORCE=true set - skipping confirmation prompt"
    fi
    
    # Decompress and restore
    if [[ "$backup_file" == *.gz ]]; then
        log "Decompressing and restoring backup..."
        gunzip -c "$backup_file" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
            -h "$POSTGRES_HOST" \
            -U "$POSTGRES_USER" \
            -d postgres \
            --single-transaction \
            --set ON_ERROR_STOP=on
    else
        log "Restoring uncompressed backup..."
        PGPASSWORD="$POSTGRES_PASSWORD" psql \
            -h "$POSTGRES_HOST" \
            -U "$POSTGRES_USER" \
            -d postgres \
            --single-transaction \
            --set ON_ERROR_STOP=on \
            -f "$backup_file"
    fi
    
    log "PostgreSQL restore completed successfully"
}

# Restore MongoDB
restore_mongodb() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        error "MongoDB backup file not found: $backup_file"
    fi
    
    log "Restoring MongoDB from: $backup_file"
    
    # Check if MongoDB is available
    if ! mongosh --host "$MONGO_HOST" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        error "MongoDB is not available at $MONGO_HOST:27017"
    fi
    
    # Create a confirmation prompt
    warn "This will COMPLETELY REPLACE the current database!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    
    # Extract backup
    log "Extracting backup..."
    tar -xzf "$backup_file" -C "$temp_dir"
    
    # Find the extracted directory
    local extracted_dir=$(find "$temp_dir" -type d -name "nova_universe_*" | head -1)
    if [ -z "$extracted_dir" ]; then
        error "Could not find extracted database directory"
    fi
    
    # Drop existing database
    log "Dropping existing database..."
    mongosh --host "$MONGO_HOST" --eval "db.getSiblingDB('$MONGO_DB').dropDatabase()"
    
    # Restore database
    log "Restoring database..."
    mongorestore \
        --host "$MONGO_HOST" \
        --db "$MONGO_DB" \
        --drop \
        --gzip \
        "$extracted_dir/$MONGO_DB"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    log "MongoDB restore completed successfully"
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        usage
        exit 1
    fi
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--postgres)
                restore_postgres "$2"
                shift 2
                ;;
            -m|--mongodb)
                restore_mongodb "$2"
                shift 2
                ;;
            -l|--list)
                list_backups
                shift
                ;;
            -h|--help)
                usage
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
}

# Run main function
main "$@"
