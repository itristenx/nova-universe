#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to start services
start_services() {
    echo "🚀 Starting CueIT services..."
    
    # Start API
    echo "Starting API..."
    cd cueit-api && npm start &
    API_PID=$!
    cd ..
    
    # Start Admin UI
    echo "Starting Admin UI..."
    cd cueit-admin && npm run dev &
    ADMIN_PID=$!
    cd ..
    
    # Start Activation UI
    echo "Starting Activation UI..."
    cd cueit-activate && npm run dev &
    ACTIVATE_PID=$!
    cd ..
    
    # Save PIDs for later cleanup
    echo "$API_PID" > .api.pid
    echo "$ADMIN_PID" > .admin.pid
    echo "$ACTIVATE_PID" > .activate.pid
    
    echo "✅ Services started!"
    echo "   API PID: $API_PID"
    echo "   Admin PID: $ADMIN_PID"
    echo "   Activate PID: $ACTIVATE_PID"
    
    # Wait a moment for services to start
    sleep 3
    ./test-local-setup.sh
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping CueIT services..."
    
    # Kill by process name
    pkill -f "npm.*start" || true
    pkill -f "npm.*dev" || true
    pkill -f "node index.js" || true
    pkill -f "vite" || true
    
    # Clean up PID files
    rm -f .api.pid .admin.pid .activate.pid
    
    echo "✅ Services stopped!"
}

# Function to show status
show_status() {
    echo "📊 CueIT Service Status:"
    echo "========================"
    
    if pgrep -f "node index.js" > /dev/null; then
        echo "✅ API is running"
    else
        echo "❌ API is not running"
    fi
    
    if pgrep -f "npm.*dev.*cueit-admin" > /dev/null; then
        echo "✅ Admin UI is running"
    else
        echo "❌ Admin UI is not running"
    fi
    
    if pgrep -f "npm.*dev.*cueit-activate" > /dev/null; then
        echo "✅ Activation UI is running"
    else
        echo "❌ Activation UI is not running"
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
        echo "  start    - Start all CueIT services"
        echo "  stop     - Stop all CueIT services"
        echo "  restart  - Restart all CueIT services"
        echo "  status   - Show service status"
        echo "  test     - Test if services are responding"
        exit 1
        ;;
esac
