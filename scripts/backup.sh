#!/bin/bash
# Database backup script for Nova Universe
# Supports PostgreSQL and MongoDB backups with rotation

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directories
mkdir -p "$BACKUP_DIR/postgres"
mkdir -p "$BACKUP_DIR/mongodb"

# PostgreSQL Backup
backup_postgres() {
    log "Starting PostgreSQL backup..."
    
    local backup_file="$BACKUP_DIR/postgres/nova_universe_$TIMESTAMP.sql"
    local compressed_file="$backup_file.gz"
    
    # Check if PostgreSQL is available
    if ! pg_isready -h "$POSTGRES_HOST" -p 5432 -U "$POSTGRES_USER" >/dev/null 2>&1; then
        error "PostgreSQL is not available at $POSTGRES_HOST:5432"
    fi
    
    # Create backup
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
        -h "$POSTGRES_HOST" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --no-owner \
        --no-privileges \
        > "$backup_file"
    
    # Compress backup
    gzip "$backup_file"
    
    # Verify backup
    if [ -f "$compressed_file" ]; then
        local size=$(du -h "$compressed_file" | cut -f1)
        log "PostgreSQL backup completed: $compressed_file ($size)"
    else
        error "PostgreSQL backup failed - file not found"
    fi
}

# MongoDB Backup
backup_mongodb() {
    log "Starting MongoDB backup..."
    
    local backup_dir="$BACKUP_DIR/mongodb/nova_universe_$TIMESTAMP"
    local compressed_file="$backup_dir.tar.gz"
    
    # Check if MongoDB is available
    if ! mongosh --host "$MONGO_HOST" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        warn "MongoDB is not available at $MONGO_HOST:27017 - skipping MongoDB backup"
        return 0
    fi
    
    # Create backup
    mongodump \
        --host "$MONGO_HOST" \
        --db "$MONGO_DB" \
        --out "$backup_dir" \
        --gzip
    
    # Compress backup directory
    tar -czf "$compressed_file" -C "$BACKUP_DIR/mongodb" "$(basename "$backup_dir")"
    rm -rf "$backup_dir"
    
    # Verify backup
    if [ -f "$compressed_file" ]; then
        local size=$(du -h "$compressed_file" | cut -f1)
        log "MongoDB backup completed: $compressed_file ($size)"
    else
        error "MongoDB backup failed - file not found"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Cleanup PostgreSQL backups
    find "$BACKUP_DIR/postgres" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    # Cleanup MongoDB backups
    find "$BACKUP_DIR/mongodb" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log "Backup cleanup completed"
}

# Main execution
main() {
    log "Starting database backup process..."
    
    # Backup PostgreSQL
    backup_postgres
    
    # Backup MongoDB (if available)
    backup_mongodb
    
    # Cleanup old backups
    cleanup_old_backups
    
    log "Database backup process completed successfully"
}

# Run main function
main "$@"
