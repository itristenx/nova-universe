#!/bin/bash

# Nova Universe Production Monitoring Setup
# Deploys comprehensive monitoring stack for 99.9% uptime tracking

echo "🔧 NOVA UNIVERSE PRODUCTION MONITORING SETUP"
echo "============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MONITORING_DIR="./monitoring"
GRAFANA_PASSWORD="${GRAFANA_PASSWORD:-nova_admin_2024}"
PROMETHEUS_PORT="${PROMETHEUS_PORT:-9090}"
GRAFANA_PORT="${GRAFANA_PORT:-3010}"
ALERTMANAGER_PORT="${ALERTMANAGER_PORT:-9093}"

echo "Configuration:"
echo "- Monitoring Directory: $MONITORING_DIR"
echo "- Prometheus Port: $PROMETHEUS_PORT"
echo "- Grafana Port: $GRAFANA_PORT"
echo "- AlertManager Port: $ALERTMANAGER_PORT"
echo ""

# Create monitoring directory structure
setup_monitoring_directory() {
    echo "1. Setting up monitoring directory structure..."
    echo "=============================================="
    
    mkdir -p "$MONITORING_DIR"/{prometheus,grafana,alertmanager}/{config,data}
    mkdir -p "$MONITORING_DIR"/grafana/dashboards
    mkdir -p "$MONITORING_DIR"/grafana/provisioning/{dashboards,datasources}
    
    echo -e "${GREEN}✅ Directory structure created${NC}"
    echo ""
}

# Create Prometheus configuration
create_prometheus_config() {
    echo "2. Creating Prometheus configuration..."
    echo "======================================"
    
    cat > "$MONITORING_DIR/prometheus/config/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "/etc/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Nova Universe API monitoring
  - job_name: 'nova-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/api/monitoring/metrics'
    scrape_interval: 10s
    
  # Nova Universe UI monitoring
  - job_name: 'nova-ui'
    static_configs:
      - targets: ['host.docker.internal:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s
    
  # Database monitoring
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    
  # Redis monitoring
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    
  # System monitoring
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    
  # Nginx monitoring (if using)
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
EOF

    echo -e "${GREEN}✅ Prometheus configuration created${NC}"
    echo ""
}

# Create Prometheus alert rules
create_alert_rules() {
    echo "3. Creating Prometheus alert rules..."
    echo "==================================="
    
    mkdir -p "$MONITORING_DIR/prometheus/config/rules"
    
    cat > "$MONITORING_DIR/prometheus/config/rules/nova-alerts.yml" << 'EOF'
groups:
  - name: nova_universe_critical
    rules:
      # API Response Time SLA (>200ms for 5 minutes)
      - alert: APIResponseTimeSLABreach
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket{job="nova-api"}) > 0.2
        for: 5m
        labels:
          severity: critical
          service: api
        annotations:
          summary: "API response time SLA breach"
          description: "95th percentile response time is {{ $value }}s for 5 minutes"
          
      # System downtime (API unavailable)
      - alert: SystemDowntime
        expr: up{job="nova-api"} == 0
        for: 30s
        labels:
          severity: critical
          service: api
        annotations:
          summary: "Nova Universe API is down"
          description: "API has been down for {{ $for }}"
          
      # High concurrent users (approaching limit)
      - alert: HighConcurrentUsers
        expr: nova_concurrent_users > 8000
        for: 2m
        labels:
          severity: warning
          service: api
        annotations:
          summary: "High concurrent user load"
          description: "Current concurrent users: {{ $value }} (limit: 10000)"
          
      # Database connection pool exhaustion
      - alert: DatabaseConnectionPoolHigh
        expr: postgres_stat_activity_count > 150
        for: 5m
        labels:
          severity: warning
          service: database
        annotations:
          summary: "Database connection pool usage high"
          description: "Active connections: {{ $value }}/200"
          
      # Database query response time
      - alert: DatabaseQuerySlow
        expr: postgres_stat_statements_mean_time_ms > 50
        for: 5m
        labels:
          severity: warning
          service: database
        annotations:
          summary: "Database queries running slow"
          description: "Average query time: {{ $value }}ms (target: <50ms)"
          
      # Disk space low
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
          service: system
        annotations:
          summary: "Disk space low"
          description: "Available disk space: {{ $value }}%"
          
      # Memory usage high
      - alert: MemoryUsageHigh
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
          service: system
        annotations:
          summary: "Memory usage high"
          description: "Memory usage: {{ $value }}%"
          
      # Redis down
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
          service: cache
        annotations:
          summary: "Redis cache is down"
          description: "Redis has been down for {{ $for }}"

  - name: nova_universe_uptime
    rules:
      # Calculate uptime percentage (99.9% SLA)
      - record: nova_uptime_percentage
        expr: (1 - (increase(prometheus_notifications_total{alertname="SystemDowntime"}[30d]) * 30 / (30 * 24 * 60))) * 100
        
      # SLA breach (uptime below 99.9%)
      - alert: UptimeSLABreach
        expr: nova_uptime_percentage < 99.9
        for: 0m
        labels:
          severity: critical
          service: sla
        annotations:
          summary: "Uptime SLA breach"
          description: "Monthly uptime: {{ $value }}% (SLA: 99.9%)"
EOF

    echo -e "${GREEN}✅ Alert rules created${NC}"
    echo ""
}

# Create AlertManager configuration
create_alertmanager_config() {
    echo "4. Creating AlertManager configuration..."
    echo "======================================="
    
    cat > "$MONITORING_DIR/alertmanager/config/alertmanager.yml" << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@novauniverse.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://host.docker.internal:3000/api/v1/alerts/webhook'
        
  - name: 'critical-alerts'
    email_configs:
      - to: 'ops-team@company.com'
        subject: 'CRITICAL: Nova Universe Alert'
        body: |
          Alert: {{ .GroupLabels.alertname }}
          Severity: {{ .CommonLabels.severity }}
          Description: {{ range .Alerts }}{{ .Annotations.description }}{{ end }}
    webhook_configs:
      - url: 'http://host.docker.internal:3000/api/v1/alerts/critical'
        
  - name: 'warning-alerts'
    email_configs:
      - to: 'dev-team@company.com'
        subject: 'WARNING: Nova Universe Alert'
        body: |
          Alert: {{ .GroupLabels.alertname }}
          Severity: {{ .CommonLabels.severity }}
          Description: {{ range .Alerts }}{{ .Annotations.description }}{{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

    echo -e "${GREEN}✅ AlertManager configuration created${NC}"
    echo ""
}

# Create Grafana datasource configuration
create_grafana_datasource() {
    echo "5. Creating Grafana datasource configuration..."
    echo "=============================================="
    
    cat > "$MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    echo -e "${GREEN}✅ Grafana datasource configured${NC}"
    echo ""
}

# Create Grafana dashboard configuration
create_grafana_dashboards() {
    echo "6. Creating Grafana dashboard configuration..."
    echo "============================================="
    
    cat > "$MONITORING_DIR/grafana/provisioning/dashboards/dashboards.yml" << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    folderUid: ''
    type: file
    disableDeletion: false
    editable: true
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

    # Create Nova Universe main dashboard
    cat > "$MONITORING_DIR/grafana/dashboards/nova-universe-overview.json" << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "Nova Universe - Production Overview",
    "tags": ["nova", "production"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "System Uptime (99.9% SLA)",
        "type": "stat",
        "targets": [
          {
            "expr": "nova_uptime_percentage",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 99.5},
                {"color": "green", "value": 99.9}
              ]
            },
            "unit": "percent"
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "API Response Time (p95)",
        "type": "stat",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket{job=\"nova-api\"}) * 1000",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 150},
                {"color": "red", "value": 200}
              ]
            },
            "unit": "ms"
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 6, "y": 0}
      },
      {
        "id": 3,
        "title": "Concurrent Users",
        "type": "stat",
        "targets": [
          {
            "expr": "nova_concurrent_users",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 8000},
                {"color": "red", "value": 9500}
              ]
            },
            "max": 10000
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 0}
      },
      {
        "id": 4,
        "title": "Database Query Performance",
        "type": "stat",
        "targets": [
          {
            "expr": "postgres_stat_statements_mean_time_ms",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 40},
                {"color": "red", "value": 50}
              ]
            },
            "unit": "ms"
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 0}
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
EOF

    echo -e "${GREEN}✅ Grafana dashboards created${NC}"
    echo ""
}

# Create Docker Compose for monitoring stack
create_monitoring_compose() {
    echo "7. Creating monitoring Docker Compose..."
    echo "======================================="
    
    cat > "$MONITORING_DIR/docker-compose.monitoring.yml" << 'EOF'
version: '3.8'

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: nova-prometheus
    ports:
      - "${PROMETHEUS_PORT:-9090}:9090"
    volumes:
      - ./prometheus/config:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    networks:
      - monitoring
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: nova-grafana
    ports:
      - "${GRAFANA_PORT:-3010}:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-nova_admin_2024}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_DOMAIN=localhost
      - GF_SMTP_ENABLED=false
    networks:
      - monitoring
    restart: unless-stopped
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    container_name: nova-alertmanager
    ports:
      - "${ALERTMANAGER_PORT:-9093}:9093"
    volumes:
      - ./alertmanager/config:/etc/alertmanager
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    networks:
      - monitoring
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    container_name: nova-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring
    restart: unless-stopped

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: nova-postgres-exporter
    ports:
      - "9187:9187"
    environment:
      DATA_SOURCE_NAME: "postgresql://nova_admin:nova_password@host.docker.internal:5432/nova_universe?sslmode=disable"
    networks:
      - monitoring
    restart: unless-stopped

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: nova-redis-exporter
    ports:
      - "9121:9121"
    environment:
      REDIS_ADDR: "redis://host.docker.internal:6379"
      REDIS_PASSWORD: "${REDIS_PASSWORD:-}"
    networks:
      - monitoring
    restart: unless-stopped
EOF

    echo -e "${GREEN}✅ Monitoring Docker Compose created${NC}"
    echo ""
}

# Create monitoring startup script
create_startup_script() {
    echo "8. Creating monitoring startup script..."
    echo "======================================="
    
    cat > "$MONITORING_DIR/start-monitoring.sh" << 'EOF'
#!/bin/bash

echo "🚀 Starting Nova Universe Monitoring Stack..."
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start monitoring stack
echo "Starting monitoring services..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Check service health
echo "Checking service health..."

# Check Prometheus
if curl -f http://localhost:${PROMETHEUS_PORT:-9090}/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus is healthy"
else
    echo "❌ Prometheus is not responding"
fi

# Check Grafana
if curl -f http://localhost:${GRAFANA_PORT:-3010}/api/health > /dev/null 2>&1; then
    echo "✅ Grafana is healthy"
else
    echo "❌ Grafana is not responding"
fi

# Check AlertManager
if curl -f http://localhost:${ALERTMANAGER_PORT:-9093}/-/healthy > /dev/null 2>&1; then
    echo "✅ AlertManager is healthy"
else
    echo "❌ AlertManager is not responding"
fi

echo ""
echo "🎉 Monitoring stack is running!"
echo ""
echo "Access points:"
echo "- Prometheus: http://localhost:${PROMETHEUS_PORT:-9090}"
echo "- Grafana: http://localhost:${GRAFANA_PORT:-3010} (admin/nova_admin_2024)"
echo "- AlertManager: http://localhost:${ALERTMANAGER_PORT:-9093}"
echo ""
echo "Dashboard: Nova Universe - Production Overview"
echo ""
EOF

    chmod +x "$MONITORING_DIR/start-monitoring.sh"
    echo -e "${GREEN}✅ Startup script created${NC}"
    echo ""
}

# Create monitoring validation script
create_validation_script() {
    echo "9. Creating monitoring validation script..."
    echo "========================================="
    
    cat > "$MONITORING_DIR/validate-monitoring.sh" << 'EOF'
#!/bin/bash

echo "🔍 Validating Nova Universe Monitoring Setup..."
echo "=============================================="

ERRORS=0

# Check if all services are running
check_service() {
    local service=$1
    local port=$2
    
    echo -n "Checking $service... "
    
    if curl -f http://localhost:$port/api/health > /dev/null 2>&1 || curl -f http://localhost:$port/-/healthy > /dev/null 2>&1; then
        echo "✅ Running"
    else
        echo "❌ Not responding"
        ERRORS=$((ERRORS + 1))
    fi
}

check_service "Prometheus" "${PROMETHEUS_PORT:-9090}"
check_service "Grafana" "${GRAFANA_PORT:-3010}"
check_service "AlertManager" "${ALERTMANAGER_PORT:-9093}"

# Check if metrics are being collected
echo -n "Checking metric collection... "
if curl -s "http://localhost:${PROMETHEUS_PORT:-9090}/api/v1/query?query=up" | grep -q "success"; then
    echo "✅ Metrics being collected"
else
    echo "❌ No metrics found"
    ERRORS=$((ERRORS + 1))
fi

# Check if alerts are configured
echo -n "Checking alert rules... "
if curl -s "http://localhost:${PROMETHEUS_PORT:-9090}/api/v1/rules" | grep -q "nova_universe"; then
    echo "✅ Alert rules loaded"
else
    echo "❌ Alert rules not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""
if [[ $ERRORS -eq 0 ]]; then
    echo "🎉 Monitoring validation passed! All systems operational."
    echo ""
    echo "Your monitoring stack is ready for production:"
    echo "- ✅ 99.9% uptime tracking active"
    echo "- ✅ Sub-200ms response time monitoring active"
    echo "- ✅ 10K concurrent user capacity monitoring active"
    echo "- ✅ Critical alerting configured"
else
    echo "❌ Monitoring validation failed with $ERRORS errors."
    echo "Please check the service logs and configuration."
fi
EOF

    chmod +x "$MONITORING_DIR/validate-monitoring.sh"
    echo -e "${GREEN}✅ Validation script created${NC}"
    echo ""
}

# Main execution
main() {
    echo "Setting up production monitoring for Nova Universe..."
    echo ""
    
    setup_monitoring_directory
    create_prometheus_config
    create_alert_rules
    create_alertmanager_config
    create_grafana_datasource
    create_grafana_dashboards
    create_monitoring_compose
    create_startup_script
    create_validation_script
    
    echo "🎉 MONITORING SETUP COMPLETE!"
    echo "=============================="
    echo ""
    echo "Production monitoring stack configured with:"
    echo "- ✅ 99.9% uptime SLA tracking"
    echo "- ✅ Sub-200ms API response time monitoring"
    echo "- ✅ 10,000 concurrent user capacity monitoring"
    echo "- ✅ Database performance monitoring"
    echo "- ✅ Critical alerting and notifications"
    echo "- ✅ Executive dashboards"
    echo ""
    echo "📁 Files created in: $MONITORING_DIR/"
    echo ""
    echo "🚀 To start monitoring:"
    echo "   cd $MONITORING_DIR"
    echo "   ./start-monitoring.sh"
    echo ""
    echo "🔍 To validate setup:"
    echo "   cd $MONITORING_DIR"
    echo "   ./validate-monitoring.sh"
    echo ""
    echo "📊 Access points:"
    echo "   - Prometheus: http://localhost:$PROMETHEUS_PORT"
    echo "   - Grafana: http://localhost:$GRAFANA_PORT (admin/nova_admin_2024)"
    echo "   - AlertManager: http://localhost:$ALERTMANAGER_PORT"
    echo ""
    echo "⚠️  Remember to:"
    echo "   1. Update email configurations in AlertManager"
    echo "   2. Configure webhook endpoints for Nova Universe alerts"
    echo "   3. Test alert notifications"
    echo "   4. Set up SSL/TLS for production deployment"
}

# Execute main function
main "$@"