#!/bin/bash
# PostgreSQL Backup Script for Nova Universe
# Supports automated backups with rotation, compression, and S3 upload
# Production-ready with error handling and notifications

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Backup configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d")
BACKUP_FILE="nova_universe_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Database configuration
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-nova_universe}"
DB_USER="${POSTGRES_USER:-nova_admin}"
DB_PASSWORD="${POSTGRES_PASSWORD}"

# S3 configuration (optional)
S3_ENABLED="${BACKUP_S3_ENABLED:-false}"
S3_BUCKET="${AWS_S3_BUCKET}"
S3_PREFIX="${BACKUP_S3_PREFIX:-backups/postgres}"

# Notification configuration
SLACK_WEBHOOK="${SECURITY_ALERT_WEBHOOK}"
NOTIFY_ON_SUCCESS="${BACKUP_NOTIFY_SUCCESS:-false}"
NOTIFY_ON_FAILURE="${BACKUP_NOTIFY_FAILURE:-true}"

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO] $1"
}

warn() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN] $1" >&2
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
}

fatal() {
    error "$1"
    send_notification "error" "Backup Failed" "$1"
    exit 1
}

# =============================================================================
# NOTIFICATION FUNCTIONS
# =============================================================================

send_notification() {
    local severity="$1"
    local title="$2"
    local message="$3"
    
    if [ "$NOTIFY_ON_FAILURE" != "true" ] && [ "$severity" = "error" ]; then
        return 0
    fi
    
    if [ "$NOTIFY_ON_SUCCESS" != "true" ] && [ "$severity" = "success" ]; then
        return 0
    fi
    
    if [ -z "$SLACK_WEBHOOK" ]; then
        return 0
    fi
    
    local color="#36a64f"
    local emoji="✅"
    
    if [ "$severity" = "error" ]; then
        color="#ff0000"
        emoji="🚨"
    elif [ "$severity" = "warning" ]; then
        color="#ff9800"
        emoji="⚠️"
    fi
    
    local payload=$(cat <<EOF
{
    "text": "${emoji} *${title}*",
    "attachments": [
        {
            "color": "${color}",
            "fields": [
                {
                    "title": "Message",
                    "value": "${message}",
                    "short": false
                },
                {
                    "title": "Database",
                    "value": "${DB_NAME}",
                    "short": true
                },
                {
                    "title": "Timestamp",
                    "value": "$(date)",
                    "short": true
                }
            ],
            "footer": "Nova Universe Backup System"
        }
    ]
}
EOF
)
    
    curl -X POST -H 'Content-type: application/json' \
        --data "$payload" \
        "$SLACK_WEBHOOK" \
        2>/dev/null || warn "Failed to send notification"
}

# =============================================================================
# PREREQUISITE CHECKS
# =============================================================================

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        fatal "pg_dump not found. Please install PostgreSQL client tools."
    fi
    
    # Check if gzip is available
    if ! command -v gzip &> /dev/null; then
        fatal "gzip not found. Please install gzip."
    fi
    
    # Check database password
    if [ -z "$DB_PASSWORD" ]; then
        fatal "POSTGRES_PASSWORD is not set"
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Check if directory is writable
    if [ ! -w "$BACKUP_DIR" ]; then
        fatal "Backup directory $BACKUP_DIR is not writable"
    fi
    
    # Check database connection
    if ! PGPASSWORD="$DB_PASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
        fatal "Cannot connect to PostgreSQL database at $DB_HOST:$DB_PORT"
    fi
    
    log "✅ Prerequisites check passed"
}

# =============================================================================
# BACKUP FUNCTIONS
# =============================================================================

perform_backup() {
    log "Starting PostgreSQL backup..."
    log "Database: $DB_NAME"
    log "Backup file: $COMPRESSED_FILE"
    
    local full_path="$BACKUP_DIR/$BACKUP_FILE"
    local compressed_path="$BACKUP_DIR/$COMPRESSED_FILE"
    
    # Perform backup
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --no-owner \
        --no-privileges \
        --no-comments \
        > "$full_path" 2>&1 || fatal "pg_dump failed"
    
    # Compress backup
    log "Compressing backup..."
    gzip -9 "$full_path" || fatal "Compression failed"
    
    # Verify backup file exists and has content
    if [ ! -f "$compressed_path" ]; then
        fatal "Backup file not found after compression"
    fi
    
    local file_size=$(du -h "$compressed_path" | cut -f1)
    log "✅ Backup completed successfully"
    log "File: $compressed_path"
    log "Size: $file_size"
    
    echo "$compressed_path"
}

# =============================================================================
# S3 UPLOAD
# =============================================================================

upload_to_s3() {
    local backup_file="$1"
    
    if [ "$S3_ENABLED" != "true" ]; then
        return 0
    fi
    
    if [ -z "$S3_BUCKET" ]; then
        warn "S3 upload enabled but AWS_S3_BUCKET not set"
        return 1
    fi
    
    if ! command -v aws &> /dev/null; then
        warn "AWS CLI not found. Skipping S3 upload."
        return 1
    fi
    
    log "Uploading backup to S3..."
    log "Bucket: s3://$S3_BUCKET/$S3_PREFIX/"
    
    local s3_path="s3://$S3_BUCKET/$S3_PREFIX/$(basename $backup_file)"
    
    if aws s3 cp "$backup_file" "$s3_path" --storage-class STANDARD_IA; then
        log "✅ Backup uploaded to S3: $s3_path"
        return 0
    else
        warn "Failed to upload backup to S3"
        return 1
    fi
}

# =============================================================================
# CLEANUP
# =============================================================================

cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Delete local backups older than retention period
    find "$BACKUP_DIR" -name "nova_universe_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    local remaining=$(find "$BACKUP_DIR" -name "nova_universe_*.sql.gz" -type f | wc -l)
    log "✅ Cleanup completed. $remaining backup(s) remaining."
    
    # Cleanup S3 backups if enabled
    if [ "$S3_ENABLED" = "true" ] && command -v aws &> /dev/null; then
        log "Cleaning up S3 backups older than $RETENTION_DAYS days..."
        
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)
        
        aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" | while read -r line; do
            local file_date=$(echo $line | awk '{print $1}')
            local file_name=$(echo $line | awk '{print $4}')
            
            if [[ "$file_date" < "$cutoff_date" ]]; then
                log "Deleting old S3 backup: $file_name"
                aws s3 rm "s3://$S3_BUCKET/$S3_PREFIX/$file_name" || warn "Failed to delete $file_name"
            fi
        done
    fi
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    log "========================================="
    log "Nova Universe PostgreSQL Backup"
    log "========================================="
    
    check_prerequisites
    
    local backup_path=$(perform_backup)
    
    upload_to_s3 "$backup_path"
    
    cleanup_old_backups
    
    log "========================================="
    log "Backup completed successfully!"
    log "========================================="
    
    send_notification "success" "Backup Completed" "PostgreSQL backup completed successfully. File: $(basename $backup_path)"
}

# Run main function
main "$@"
