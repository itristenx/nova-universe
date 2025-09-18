#!/bin/bash

# Nova Universe Production Performance Validation Suite
# Tests critical performance requirements for production readiness

echo "🚀 NOVA UNIVERSE PERFORMANCE VALIDATION SUITE"
echo "============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
PERFORMANCE_ISSUES=0

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
UI_BASE_URL="${UI_BASE_URL:-http://localhost:3001}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-nova_universe}"

# Performance thresholds
MAX_API_RESPONSE_TIME=200  # milliseconds
MAX_DB_QUERY_TIME=50       # milliseconds
TARGET_UPTIME=99.9         # percentage
MAX_CONCURRENT_USERS=10000

echo "Configuration:"
echo "- API Base URL: $API_BASE_URL"
echo "- UI Base URL: $UI_BASE_URL"
echo "- Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "- Performance Targets:"
echo "  - API Response Time: <${MAX_API_RESPONSE_TIME}ms"
echo "  - DB Query Time: <${MAX_DB_QUERY_TIME}ms"
echo "  - Uptime Target: ${TARGET_UPTIME}%"
echo "  - Concurrent Users: ${MAX_CONCURRENT_USERS}"
echo ""

# Function to test API response time
test_api_response_time() {
    echo "1. Testing API Response Times..."
    echo "================================"
    
    local endpoints=(
        "/api/health"
        "/api/v1/tickets"
        "/api/v1/itsm/tickets"
        "/api/v1/users"
        "/api/v1/core/dashboard"
    )
    
    local total_time=0
    local endpoint_count=0
    
    for endpoint in "${endpoints[@]}"; do
        echo -n "Testing $endpoint... "
        
        # Measure response time using curl
        local response_time=$(curl -o /dev/null -s -w "%{time_total}" "${API_BASE_URL}${endpoint}")
        local response_time_ms=$(echo "$response_time * 1000" | bc)
        
        endpoint_count=$((endpoint_count + 1))
        total_time=$(echo "$total_time + $response_time_ms" | bc)
        
        if (( $(echo "$response_time_ms < $MAX_API_RESPONSE_TIME" | bc -l) )); then
            echo -e "${GREEN}✅ ${response_time_ms}ms${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ ${response_time_ms}ms (exceeds ${MAX_API_RESPONSE_TIME}ms)${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            PERFORMANCE_ISSUES=$((PERFORMANCE_ISSUES + 1))
        fi
    done
    
    local avg_response_time=$(echo "scale=2; $total_time / $endpoint_count" | bc)
    echo ""
    echo "Average API Response Time: ${avg_response_time}ms"
    
    if (( $(echo "$avg_response_time < $MAX_API_RESPONSE_TIME" | bc -l) )); then
        echo -e "${GREEN}✅ API response time requirement met${NC}"
    else
        echo -e "${RED}❌ API response time requirement NOT met${NC}"
        PERFORMANCE_ISSUES=$((PERFORMANCE_ISSUES + 1))
    fi
    echo ""
}

# Function to test database performance
test_database_performance() {
    echo "2. Testing Database Performance..."
    echo "================================="
    
    # Test if PostgreSQL is accessible
    if command -v psql &> /dev/null; then
        echo "Testing PostgreSQL query performance..."
        
        # Simple query performance test
        local query_time=$(psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "\\timing on" -c "SELECT COUNT(*) FROM users;" 2>&1 | grep "Time:" | awk '{print $2}' | sed 's/ms//')
        
        if [[ -n "$query_time" ]]; then
            if (( $(echo "$query_time < $MAX_DB_QUERY_TIME" | bc -l) )); then
                echo -e "${GREEN}✅ Database query time: ${query_time}ms${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo -e "${RED}❌ Database query time: ${query_time}ms (exceeds ${MAX_DB_QUERY_TIME}ms)${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
                PERFORMANCE_ISSUES=$((PERFORMANCE_ISSUES + 1))
            fi
        else
            echo -e "${YELLOW}⚠️ Could not measure database query time${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ PostgreSQL client not available for testing${NC}"
    fi
    echo ""
}

# Function to test concurrent connections
test_concurrent_connections() {
    echo "3. Testing Concurrent Connection Capacity..."
    echo "==========================================="
    
    # Test connection pooling
    echo "Testing database connection pool..."
    
    if command -v psql &> /dev/null; then
        # Get current connection count
        local current_connections=$(psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
        
        if [[ -n "$current_connections" ]]; then
            echo "Current database connections: $current_connections"
            
            # Get max connections setting
            local max_connections=$(psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SHOW max_connections;" 2>/dev/null | xargs)
            echo "Database max connections: $max_connections"
            
            if [[ -n "$max_connections" && "$max_connections" -ge 200 ]]; then
                echo -e "${GREEN}✅ Database connection capacity sufficient${NC}"
                TESTS_PASSED=$((TESTS_PASSED + 1))
            else
                echo -e "${RED}❌ Database max connections too low for 10K users${NC}"
                TESTS_FAILED=$((TESTS_FAILED + 1))
                PERFORMANCE_ISSUES=$((PERFORMANCE_ISSUES + 1))
            fi
        else
            echo -e "${YELLOW}⚠️ Could not retrieve connection information${NC}"
        fi
    fi
    echo ""
}

# Function to test load balancing readiness
test_load_balancing() {
    echo "4. Testing Load Balancing Readiness..."
    echo "====================================="
    
    # Check if application is containerized
    if command -v docker &> /dev/null; then
        echo "Checking Docker containerization..."
        if docker ps | grep -q "nova"; then
            echo -e "${GREEN}✅ Application is containerized${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${YELLOW}⚠️ Application containers not running${NC}"
        fi
    fi
    
    # Check for nginx configuration
    if [[ -f "nginx/nginx.conf" ]] || [[ -f "nginx.conf" ]]; then
        echo -e "${GREEN}✅ Nginx configuration found${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️ No load balancer configuration found${NC}"
    fi
    echo ""
}

# Function to test monitoring infrastructure
test_monitoring_infrastructure() {
    echo "5. Testing Monitoring Infrastructure..."
    echo "====================================="
    
    # Check for monitoring endpoints
    local monitoring_endpoints=(
        "/api/monitoring/health"
        "/api/monitoring/performance"
        "/api/monitoring/alerts"
    )
    
    for endpoint in "${monitoring_endpoints[@]}"; do
        echo -n "Testing monitoring endpoint $endpoint... "
        
        local status_code=$(curl -o /dev/null -s -w "%{http_code}" "${API_BASE_URL}${endpoint}")
        
        if [[ "$status_code" == "200" ]]; then
            echo -e "${GREEN}✅ Available${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ Not available (HTTP $status_code)${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    done
    echo ""
}

# Function to test caching infrastructure
test_caching_infrastructure() {
    echo "6. Testing Caching Infrastructure..."
    echo "==================================="
    
    # Check Redis availability
    if command -v redis-cli &> /dev/null; then
        echo -n "Testing Redis connection... "
        if redis-cli ping &> /dev/null; then
            echo -e "${GREEN}✅ Redis available${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ Redis not available${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            PERFORMANCE_ISSUES=$((PERFORMANCE_ISSUES + 1))
        fi
    else
        echo -e "${YELLOW}⚠️ Redis client not available for testing${NC}"
    fi
    echo ""
}

# Function to generate load test simulation
generate_load_test_script() {
    echo "7. Generating Load Test Script..."
    echo "================================"
    
    cat > /tmp/nova-load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

export default function() {
  // Test critical API endpoints
  let endpoints = [
    '/api/health',
    '/api/v1/tickets',
    '/api/v1/users',
    '/api/v1/core/dashboard'
  ];
  
  let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  let response = http.get(`${BASE_URL}${endpoint}`);
  
  let success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!success);
  sleep(1);
}
EOF

    echo -e "${GREEN}✅ Load test script generated: /tmp/nova-load-test.js${NC}"
    echo ""
    echo "To run the load test:"
    echo "  k6 run /tmp/nova-load-test.js"
    echo ""
}

# Function to generate monitoring setup script
generate_monitoring_setup() {
    echo "8. Generating Monitoring Setup Script..."
    echo "======================================="
    
    cat > /tmp/setup-monitoring.sh << 'EOF'
#!/bin/bash

# Nova Universe Monitoring Setup Script

echo "Setting up production monitoring stack..."

# Create monitoring docker-compose file
cat > docker-compose.monitoring.yml << 'MONITORING_EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: nova-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    container_name: nova-grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana-dashboards:/etc/grafana/provisioning/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  node-exporter:
    image: prom/node-exporter:latest
    container_name: nova-node-exporter
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
MONITORING_EOF

# Create Prometheus configuration
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'PROM_EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nova-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
    
  - job_name: 'nova-ui'
    static_configs:
      - targets: ['host.docker.internal:3001']
    
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
PROM_EOF

echo "Monitoring stack configuration created!"
echo "To start monitoring:"
echo "  docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
echo "Access points:"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001 (admin/admin)"
EOF

    chmod +x /tmp/setup-monitoring.sh
    echo -e "${GREEN}✅ Monitoring setup script generated: /tmp/setup-monitoring.sh${NC}"
    echo ""
}

# Function to display results summary
display_results_summary() {
    echo "🏆 PERFORMANCE VALIDATION RESULTS"
    echo "================================="
    echo ""
    
    local total_tests=$((TESTS_PASSED + TESTS_FAILED))
    local pass_rate=0
    
    if [[ $total_tests -gt 0 ]]; then
        pass_rate=$(echo "scale=0; $TESTS_PASSED * 100 / $total_tests" | bc)
    fi
    
    echo "Test Results:"
    echo "- Tests Passed: $TESTS_PASSED"
    echo "- Tests Failed: $TESTS_FAILED"
    echo "- Pass Rate: ${pass_rate}%"
    echo "- Performance Issues: $PERFORMANCE_ISSUES"
    echo ""
    
    # Production readiness assessment
    if [[ $PERFORMANCE_ISSUES -eq 0 && $pass_rate -eq 100 ]]; then
        echo -e "${GREEN}🎉 PRODUCTION READY: All performance requirements met!${NC}"
        echo ""
        echo "✅ System meets all critical performance requirements:"
        echo "   - API response times < ${MAX_API_RESPONSE_TIME}ms"
        echo "   - Database queries < ${MAX_DB_QUERY_TIME}ms"
        echo "   - Infrastructure ready for scaling"
        echo ""
        echo "🚀 RECOMMENDATION: APPROVE FOR PRODUCTION DEPLOYMENT"
    elif [[ $PERFORMANCE_ISSUES -le 2 && $pass_rate -ge 80 ]]; then
        echo -e "${YELLOW}⚠️  PRODUCTION READY WITH MINOR ISSUES${NC}"
        echo ""
        echo "System is mostly ready but requires attention to:"
        echo "- $PERFORMANCE_ISSUES performance issue(s) identified"
        echo "- Some optimization recommended before full scale"
        echo ""
        echo "🔧 RECOMMENDATION: ADDRESS ISSUES BEFORE PRODUCTION"
    else
        echo -e "${RED}❌ NOT PRODUCTION READY${NC}"
        echo ""
        echo "Critical issues must be resolved:"
        echo "- $PERFORMANCE_ISSUES performance issue(s) identified"
        echo "- Pass rate below acceptable threshold (${pass_rate}%)"
        echo ""
        echo "🛠️  RECOMMENDATION: MAJOR OPTIMIZATION REQUIRED"
    fi
    echo ""
    
    # Next steps
    echo "📋 NEXT STEPS:"
    echo ""
    if [[ $PERFORMANCE_ISSUES -gt 0 ]]; then
        echo "1. Address performance issues identified above"
        echo "2. Run load testing with k6 script: /tmp/nova-load-test.js"
        echo "3. Set up monitoring infrastructure: /tmp/setup-monitoring.sh"
        echo "4. Re-run this validation after fixes"
    else
        echo "1. Deploy monitoring infrastructure: /tmp/setup-monitoring.sh"
        echo "2. Run comprehensive load testing: /tmp/nova-load-test.js"
        echo "3. Monitor system performance in staging environment"
        echo "4. Proceed with production deployment"
    fi
    echo ""
    
    # Save results to file
    local results_file="nova-performance-validation-$(date +%Y%m%d-%H%M%S).log"
    {
        echo "Nova Universe Performance Validation Results"
        echo "Date: $(date)"
        echo "Pass Rate: ${pass_rate}%"
        echo "Performance Issues: $PERFORMANCE_ISSUES"
        echo "Tests Passed: $TESTS_PASSED"
        echo "Tests Failed: $TESTS_FAILED"
    } > "$results_file"
    
    echo "📊 Results saved to: $results_file"
}

# Main execution
main() {
    echo "Starting performance validation..."
    echo ""
    
    # Prerequisites check
    echo "Checking prerequisites..."
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v bc &> /dev/null; then
        echo -e "${RED}❌ bc is required but not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites met${NC}"
    echo ""
    
    # Run all tests
    test_api_response_time
    test_database_performance
    test_concurrent_connections
    test_load_balancing
    test_monitoring_infrastructure
    test_caching_infrastructure
    generate_load_test_script
    generate_monitoring_setup
    
    # Display final results
    display_results_summary
}

# Execute main function
main "$@"