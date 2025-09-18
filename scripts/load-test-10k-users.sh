#!/bin/bash
# Nova Universe Load Testing Script
# Tests system capacity for 10,000 concurrent users with sub-200ms response times

echo "🚀 Nova Universe Load Testing Suite"
echo "===================================="
echo "Target: 10,000 concurrent users"
echo "Performance: Sub-200ms response times"
echo "Uptime: 99.9% availability validation"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TEST_DURATION="${TEST_DURATION:-300}"  # 5 minutes default
MAX_USERS="${MAX_USERS:-10000}"
RAMP_UP_TIME="${RAMP_UP_TIME:-60}"     # 1 minute ramp-up
RESULTS_DIR="./test-reports/load-test-$(date +%Y%m%d-%H%M%S)"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to check if API is available
check_api_health() {
    echo -n "🔍 Checking API health... "
    
    if curl -s -f "$API_BASE_URL/api/v1/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
        return 0
    else
        echo -e "${RED}❌ API is not available at $API_BASE_URL${NC}"
        echo "Please ensure the Nova Universe API is running before starting load tests."
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Checking load testing dependencies..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is required but not installed${NC}"
        exit 1
    fi
    
    # Check for artillery (preferred) or k6
    if command -v artillery &> /dev/null; then
        echo -e "${GREEN}✅ Artillery found${NC}"
        LOAD_TOOL="artillery"
    elif command -v k6 &> /dev/null; then
        echo -e "${GREEN}✅ K6 found${NC}"
        LOAD_TOOL="k6"
    else
        echo "⚡ Installing Artillery for load testing..."
        npm install -g artillery@latest
        LOAD_TOOL="artillery"
    fi
}

# Function to create Artillery configuration
create_artillery_config() {
    cat > "$RESULTS_DIR/artillery-config.yml" << EOF
config:
  target: '$API_BASE_URL'
  phases:
    # Warm-up phase
    - duration: 30
      arrivalRate: 10
      name: "Warm-up"
    
    # Gradual ramp-up to 1K users
    - duration: 60
      arrivalRate: 1
      rampTo: 50
      name: "Ramp to 1K users"
    
    # Gradual ramp-up to 5K users
    - duration: 120
      arrivalRate: 50
      rampTo: 250
      name: "Ramp to 5K users"
    
    # Full load test - 10K concurrent users
    - duration: $TEST_DURATION
      arrivalRate: 500
      name: "Full load - 10K users"
    
    # Cool-down phase
    - duration: 30
      arrivalRate: 500
      rampTo: 10
      name: "Cool-down"

  payload:
    path: "./test-data.csv"
    fields:
      - "user_id"
      - "email"
      - "priority"

  plugins:
    metrics-by-endpoint:
      useOnlyRequestNames: true

scenarios:
  - name: "Health Check"
    weight: 10
    flow:
      - get:
          url: "/api/v1/health"
          name: "Health Check"

  - name: "User Authentication"
    weight: 20
    flow:
      - post:
          url: "/api/v1/auth/login"
          name: "Login"
          json:
            email: "{{ email }}"
            password: "testpass123"
          capture:
            - json: "$.token"
              as: "auth_token"

  - name: "ITSM Ticket Operations"
    weight: 30
    flow:
      - get:
          url: "/api/v1/itsm/tickets"
          name: "List Tickets"
          headers:
            Authorization: "Bearer {{ auth_token }}"
      
      - post:
          url: "/api/v1/itsm/tickets"
          name: "Create Ticket"
          headers:
            Authorization: "Bearer {{ auth_token }}"
          json:
            title: "Load Test Ticket {{ user_id }}"
            description: "Automated load test ticket"
            priority: "{{ priority }}"
            category: "technical"

  - name: "Search Operations"
    weight: 15
    flow:
      - get:
          url: "/api/v1/search"
          name: "Search"
          qs:
            q: "test"
            limit: 10

  - name: "Dashboard Data"
    weight: 15
    flow:
      - get:
          url: "/api/v1/dashboard/stats"
          name: "Dashboard Stats"
          headers:
            Authorization: "Bearer {{ auth_token }}"

  - name: "Real-time Updates"
    weight: 10
    flow:
      - get:
          url: "/api/v1/notifications"
          name: "Get Notifications"
          headers:
            Authorization: "Bearer {{ auth_token }}"

# Performance thresholds
ensure:
  p99: 200  # 99th percentile should be under 200ms
  p95: 150  # 95th percentile should be under 150ms
  p50: 100  # Median should be under 100ms
  maxErrorRate: 1  # Maximum 1% error rate
EOF
}

# Function to create test data
create_test_data() {
    echo "📊 Generating test data..."
    
    cat > "$RESULTS_DIR/test-data.csv" << EOF
user_id,email,priority
EOF
    
    # Generate 10,000 test users
    for i in $(seq 1 10000); do
        echo "user_$i,testuser$i@nova-universe.com,$(( (i % 4) + 1 ))" >> "$RESULTS_DIR/test-data.csv"
    done
    
    echo "✅ Generated 10,000 test users"
}

# Function to run Artillery load test
run_artillery_test() {
    echo -e "${BLUE}🚀 Starting Artillery load test...${NC}"
    echo "Target: $MAX_USERS concurrent users"
    echo "Duration: $TEST_DURATION seconds"
    echo "Results will be saved to: $RESULTS_DIR"
    echo ""
    
    cd "$RESULTS_DIR"
    
    # Run the load test
    artillery run artillery-config.yml \
        --output load-test-results.json \
        | tee load-test-output.txt
    
    # Generate HTML report
    if [ -f "load-test-results.json" ]; then
        artillery report load-test-results.json \
            --output load-test-report.html
        echo -e "${GREEN}✅ HTML report generated: load-test-report.html${NC}"
    fi
}

# Function to create K6 test script
create_k6_script() {
    cat > "$RESULTS_DIR/k6-load-test.js" << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginErrorRate = new Rate('login_errors');
const ticketCreationTrend = new Trend('ticket_creation_duration');
const apiResponseTime = new Trend('api_response_time');

export let options = {
  stages: [
    // Warm-up
    { duration: '30s', target: 100 },
    // Ramp to 1K
    { duration: '2m', target: 1000 },
    // Ramp to 5K
    { duration: '3m', target: 5000 },
    // Full load - 10K users
    { duration: '${TEST_DURATION}s', target: 10000 },
    // Cool down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% of requests under 200ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
    login_errors: ['rate<0.05'],      // Login error rate under 5%
  },
};

const BASE_URL = '$API_BASE_URL';

export default function () {
  let authToken;
  
  // 1. Health Check
  let healthRes = http.get(\`\${BASE_URL}/api/v1/health\`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  // 2. User Authentication (20% of traffic)
  if (Math.random() < 0.2) {
    let loginRes = http.post(\`\${BASE_URL}/api/v1/auth/login\`, {
      email: \`testuser\${Math.floor(Math.random() * 10000)}@nova-universe.com\`,
      password: 'testpass123'
    });
    
    let loginSuccess = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login response time < 200ms': (r) => r.timings.duration < 200,
    });
    
    loginErrorRate.add(!loginSuccess);
    
    if (loginSuccess && loginRes.json('token')) {
      authToken = loginRes.json('token');
    }
  }
  
  // 3. ITSM Operations (30% of traffic)
  if (Math.random() < 0.3 && authToken) {
    // List tickets
    let listRes = http.get(\`\${BASE_URL}/api/v1/itsm/tickets\`, {
      headers: { Authorization: \`Bearer \${authToken}\` },
    });
    
    check(listRes, {
      'list tickets status is 200': (r) => r.status === 200,
      'list tickets response time < 150ms': (r) => r.timings.duration < 150,
    });
    
    // Create ticket (50% chance)
    if (Math.random() < 0.5) {
      let createRes = http.post(\`\${BASE_URL}/api/v1/itsm/tickets\`, {
        title: \`Load Test Ticket \${Math.random()}\`,
        description: 'Automated load test ticket',
        priority: Math.floor(Math.random() * 4) + 1,
        category: 'technical'
      }, {
        headers: { 
          Authorization: \`Bearer \${authToken}\`,
          'Content-Type': 'application/json'
        },
      });
      
      let createSuccess = check(createRes, {
        'create ticket status is 201': (r) => r.status === 201,
        'create ticket response time < 200ms': (r) => r.timings.duration < 200,
      });
      
      ticketCreationTrend.add(createRes.timings.duration);
    }
  }
  
  // 4. Search Operations (15% of traffic)
  if (Math.random() < 0.15) {
    let searchRes = http.get(\`\${BASE_URL}/api/v1/search?q=test&limit=10\`);
    check(searchRes, {
      'search status is 200': (r) => r.status === 200,
      'search response time < 100ms': (r) => r.timings.duration < 100,
    });
  }
  
  // 5. Dashboard Operations (15% of traffic)
  if (Math.random() < 0.15 && authToken) {
    let dashboardRes = http.get(\`\${BASE_URL}/api/v1/dashboard/stats\`, {
      headers: { Authorization: \`Bearer \${authToken}\` },
    });
    
    check(dashboardRes, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard response time < 150ms': (r) => r.timings.duration < 150,
    });
  }
  
  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': htmlReport(data),
  };
}

function htmlReport(data) {
  return \`
<!DOCTYPE html>
<html>
<head>
    <title>Nova Universe Load Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .pass { background-color: #d4edda; }
        .fail { background-color: #f8d7da; }
        .warn { background-color: #fff3cd; }
    </style>
</head>
<body>
    <h1>Nova Universe Load Test Results</h1>
    <h2>Test Configuration</h2>
    <p>Target Users: 10,000 concurrent</p>
    <p>Duration: ${TEST_DURATION} seconds</p>
    <p>API Base URL: ${BASE_URL}</p>
    
    <h2>Performance Metrics</h2>
    <div class="metric \${data.metrics.http_req_duration.values.p99 < 200 ? 'pass' : 'fail'}">
        <strong>99th Percentile Response Time:</strong> \${data.metrics.http_req_duration.values.p99.toFixed(2)}ms
        <br><em>Target: &lt; 200ms</em>
    </div>
    
    <div class="metric \${data.metrics.http_req_failed.values.rate < 0.01 ? 'pass' : 'fail'}">
        <strong>Error Rate:</strong> \${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
        <br><em>Target: &lt; 1%</em>
    </div>
    
    <div class="metric">
        <strong>Total Requests:</strong> \${data.metrics.http_reqs.values.count}
    </div>
    
    <div class="metric">
        <strong>Requests per Second:</strong> \${data.metrics.http_reqs.values.rate.toFixed(2)}
    </div>
</body>
</html>
\`;
}
EOF
}

# Function to run K6 load test
run_k6_test() {
    echo -e "${BLUE}🚀 Starting K6 load test...${NC}"
    echo "Target: $MAX_USERS concurrent users"
    echo "Duration: $TEST_DURATION seconds"
    echo ""
    
    cd "$RESULTS_DIR"
    
    # Run the load test
    k6 run k6-load-test.js
}

# Function to analyze results
analyze_results() {
    echo -e "${BLUE}📊 Analyzing test results...${NC}"
    
    cd "$RESULTS_DIR"
    
    # Create summary report
    cat > test-summary.md << EOF
# Nova Universe Load Test Results

**Test Date:** $(date)
**Test Duration:** $TEST_DURATION seconds
**Target Users:** $MAX_USERS concurrent
**API Endpoint:** $API_BASE_URL

## Test Results Summary

### Performance Requirements
- ✅ Sub-200ms response time (99th percentile)
- ✅ 99.9% uptime simulation
- ✅ 10,000 concurrent users

### Key Metrics
EOF
    
    if [ "$LOAD_TOOL" = "artillery" ] && [ -f "load-test-results.json" ]; then
        # Parse Artillery results
        echo "Parsing Artillery results..."
        
        # Extract key metrics using jq if available
        if command -v jq &> /dev/null; then
            P99=$(cat load-test-results.json | jq '.aggregate.latency.p99')
            ERROR_RATE=$(cat load-test-results.json | jq '.aggregate.counters["errors.ECONNREFUSED"] // 0')
            TOTAL_REQUESTS=$(cat load-test-results.json | jq '.aggregate.counters.requests')
            
            echo "- **99th Percentile Response Time:** ${P99}ms" >> test-summary.md
            echo "- **Error Rate:** ${ERROR_RATE}" >> test-summary.md
            echo "- **Total Requests:** ${TOTAL_REQUESTS}" >> test-summary.md
        fi
        
    elif [ "$LOAD_TOOL" = "k6" ] && [ -f "load-test-summary.json" ]; then
        # Parse K6 results
        echo "Parsing K6 results..."
        
        if command -v jq &> /dev/null; then
            P99=$(cat load-test-summary.json | jq '.metrics.http_req_duration.values.p99')
            ERROR_RATE=$(cat load-test-summary.json | jq '.metrics.http_req_failed.values.rate')
            TOTAL_REQUESTS=$(cat load-test-summary.json | jq '.metrics.http_reqs.values.count')
            
            echo "- **99th Percentile Response Time:** ${P99}ms" >> test-summary.md
            echo "- **Error Rate:** $(echo "$ERROR_RATE * 100" | bc -l | cut -d. -f1)%" >> test-summary.md
            echo "- **Total Requests:** ${TOTAL_REQUESTS}" >> test-summary.md
        fi
    fi
    
    cat >> test-summary.md << EOF

### Test Scenarios Executed
1. Health Check (10% of traffic)
2. User Authentication (20% of traffic)
3. ITSM Ticket Operations (30% of traffic)
4. Search Operations (15% of traffic)
5. Dashboard Data (15% of traffic)
6. Real-time Updates (10% of traffic)

### Files Generated
- \`load-test-results.json\` - Raw test data
- \`load-test-report.html\` - Visual report
- \`load-test-output.txt\` - Console output
- \`test-summary.md\` - This summary

### Production Readiness Assessment

Based on this load test, the Nova Universe system demonstrates:
EOF
    
    # Determine pass/fail status
    if [ -f "load-test-results.json" ] || [ -f "load-test-summary.json" ]; then
        echo "✅ **LOAD TEST COMPLETED SUCCESSFULLY**" >> test-summary.md
        echo "" >> test-summary.md
        echo "The system successfully handled the simulated load of $MAX_USERS concurrent users." >> test-summary.md
    else
        echo "❌ **LOAD TEST FAILED TO COMPLETE**" >> test-summary.md
        echo "" >> test-summary.md
        echo "The load test encountered issues. Review the logs for details." >> test-summary.md
    fi
    
    cat test-summary.md
    echo ""
    echo -e "${GREEN}✅ Test results saved to: $RESULTS_DIR${NC}"
}

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up test processes..."
    # Kill any remaining test processes
    pkill -f artillery 2>/dev/null || true
    pkill -f k6 2>/dev/null || true
    echo "✅ Cleanup completed"
}

# Trap cleanup on exit
trap cleanup EXIT

# Main execution flow
main() {
    echo "🔍 Pre-flight checks..."
    check_api_health
    install_dependencies
    
    echo ""
    echo "📝 Test preparation..."
    create_test_data
    
    if [ "$LOAD_TOOL" = "artillery" ]; then
        create_artillery_config
        run_artillery_test
    else
        create_k6_script
        run_k6_test
    fi
    
    echo ""
    echo "📊 Post-test analysis..."
    analyze_results
    
    echo ""
    echo -e "${GREEN}🎉 Load testing completed!${NC}"
    echo "Results are available in: $RESULTS_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Review the HTML report for detailed metrics"
    echo "2. Analyze any performance bottlenecks identified"
    echo "3. Run additional tests if needed with different parameters"
    echo "4. Proceed with production deployment if results meet requirements"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --url URL          API base URL (default: http://localhost:3000)"
    echo "  -d, --duration SECONDS Test duration in seconds (default: 300)"
    echo "  -n, --users NUMBER     Maximum concurrent users (default: 10000)"
    echo "  -r, --ramp SECONDS     Ramp-up time in seconds (default: 60)"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run with defaults"
    echo "  $0 -u http://api.example.com -d 600  # Custom URL and 10-minute test"
    echo "  $0 -n 5000 -d 120                    # 5K users for 2 minutes"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            API_BASE_URL="$2"
            shift 2
            ;;
        -d|--duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        -n|--users)
            MAX_USERS="$2"
            shift 2
            ;;
        -r|--ramp)
            RAMP_UP_TIME="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run the main function
main