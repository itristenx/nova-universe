#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to start services
start_services() {
    echo "🚀 Starting the Nova Universe platform services..."
    
    # Start API
    echo "Starting Platform API..."
    cd ../nova-api && npm start &
    API_PID=$!
    cd - >/dev/null
    
    # Start Admin UI
    echo "Starting Nova Core Admin UI..."
    cd ../nova-core && npm run dev &
    ADMIN_PID=$!
    cd - >/dev/null
    
    # Save PIDs for later cleanup
    echo "$API_PID" > .api.pid
    echo "$ADMIN_PID" > .admin.pid
    
    echo "✅ Services started!"
    echo "   API PID: $API_PID"
    echo "   Admin PID: $ADMIN_PID"
    
    # Wait a moment for services to start
    sleep 3
    ./test-local-setup.sh
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping Nova Universe services..."
    
    # Kill by process name
    pkill -f "npm.*start" || true
    pkill -f "npm.*dev" || true
    pkill -f "node index.js" || true
    pkill -f "vite" || true
    
    # Clean up PID files
    rm -f .api.pid .admin.pid
    
    echo "✅ Services stopped!"
}

# Function to show status
show_status() {
    echo "📊 Nova Universe Platform Status:"
    echo "========================"
    
    if pgrep -f "node index.js" > /dev/null; then
        echo "✅ Platform API is running"
    else
        echo "❌ Platform API is not running"
    fi
    
    if pgrep -f "npm.*dev.*nova-core" > /dev/null; then
        echo "✅ Nova Core Admin UI is running"
    else
        echo "❌ Nova Core Admin UI is not running"
    fi
}

# Main script logic
case "${1:-}" in
    "start")
        stop_services
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_services
        ;;
    "status")
        show_status
        ;;
    "test")
        ./test-local-setup.sh
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|test}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all Nova Universe services"
        echo "  stop     - Stop all Nova Universe services"
        echo "  restart  - Restart all Nova Universe services"
        echo "  status   - Show service status"
        echo "  test     - Test if services are responding"
        exit 1
        ;;
esac
