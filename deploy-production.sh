#!/bin/bash

# Nova Universe Production Deployment Script
# This script sets up and deploys Nova Universe in production mode

set -e

echo "🚀 Nova Universe Production Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Create production environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env.production ]; then
        print_warning ".env.production not found. Creating from template..."
        cp .env.production.template .env.production
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -hex 32)
        SESSION_SECRET=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 16)
        GRAFANA_PASSWORD=$(openssl rand -base64 12)
        
        # Update the template with generated secrets
        sed -i.bak "s/CHANGE_ME_TO_RANDOM_64_CHAR_STRING/$JWT_SECRET/g" .env.production
        sed -i.bak "s/CHANGE_ME_TO_32_CHAR_STRING/$ENCRYPTION_KEY/g" .env.production
        sed -i.bak "s/GRAFANA_PASSWORD=CHANGE_ME/GRAFANA_PASSWORD=$GRAFANA_PASSWORD/g" .env.production
        rm .env.production.bak
        
        print_warning "Please edit .env.production and update the following:"
        echo "  - Database passwords"
        echo "  - Domain configuration"
        echo "  - SAML certificates"
        echo "  - SMTP settings"
        echo "  - External API keys"
        echo ""
        echo "Press any key to continue once you've updated .env.production..."
        read -n 1 -s
    else
        print_success "Environment file .env.production exists"
    fi
}

# Create necessary directories
setup_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs/{nginx,api,core,orbit}
    mkdir -p backups/{postgres,mongodb}
    mkdir -p uploads
    mkdir -p nginx/ssl
    mkdir -p monitoring
    
    print_success "Directories created"
}

# Generate self-signed SSL certificates if they don't exist
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/private.key ]; then
        print_warning "SSL certificates not found. Generating self-signed certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/private.key \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        print_warning "Self-signed certificates generated. For production, replace with proper SSL certificates."
    else
        print_success "SSL certificates found"
    fi
}

# Create nginx configuration
setup_nginx() {
    print_status "Setting up nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream nova-api {
        server nova-api:3000;
    }
    
    upstream nova-core {
        server nova-core:3000;
    }
    
    upstream nova-orbit {
        server nova-orbit:3000;
    }
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }
    
    # API Server
    server {
        listen 443 ssl;
        server_name api.localhost;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        
        location / {
            proxy_pass http://nova-api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    
    # Admin Interface
    server {
        listen 443 ssl;
        server_name admin.localhost;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        
        location / {
            proxy_pass http://nova-core;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    
    # End-User Portal
    server {
        listen 443 ssl;
        server_name portal.localhost;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        
        location / {
            proxy_pass http://nova-orbit;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    print_success "Nginx configuration created"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build API image
    print_status "Building Nova API image..."
    docker build -f apps/api/Dockerfile.prod -t nova-universe/api:latest apps/api/
    
    # Build Core image
    print_status "Building Nova Core image..."
    docker build -f apps/core/Dockerfile.prod -t nova-universe/core:latest apps/core/
    
    # Build Orbit image
    print_status "Building Nova Orbit image..."
    docker build -f apps/orbit/Dockerfile.prod -t nova-universe/orbit:latest apps/orbit/
    
    print_success "Docker images built successfully"
}

# Deploy the stack
deploy_stack() {
    print_status "Deploying Nova Universe stack..."
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Stop any existing containers
    $COMPOSE_CMD -f docker-compose.prod.yml down
    
    # Deploy the stack
    $COMPOSE_CMD -f docker-compose.prod.yml --env-file .env.production up -d
    
    print_success "Nova Universe deployed successfully"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    sleep 30  # Wait for services to start
    
    # Check if containers are running
    if docker ps | grep -q "nova-api"; then
        print_success "Nova API container is running"
    else
        print_error "Nova API container is not running"
    fi
    
    if docker ps | grep -q "nova-core"; then
        print_success "Nova Core container is running"
    else
        print_error "Nova Core container is not running"
    fi
    
    if docker ps | grep -q "nova-orbit"; then
        print_success "Nova Orbit container is running"
    else
        print_error "Nova Orbit container is not running"
    fi
    
    # Test API endpoint
    if curl -f -k https://localhost/health &> /dev/null; then
        print_success "API health check passed"
    else
        print_warning "API health check failed - service may still be starting"
    fi
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 Nova Universe Production Deployment Complete!"
    echo "=============================================="
    echo ""
    echo "Access URLs (update your hosts file for custom domains):"
    echo "  📊 Admin Interface: https://admin.localhost"
    echo "  🌐 End-User Portal: https://portal.localhost"
    echo "  🔌 API Server: https://api.localhost"
    echo "  📈 Grafana Monitoring: http://localhost:3003"
    echo ""
    echo "Default Credentials:"
    echo "  Grafana: admin / $(grep GRAFANA_PASSWORD .env.production | cut -d'=' -f2)"
    echo ""
    echo "Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "To view logs: docker logs <container-name>"
    echo "To stop: docker-compose -f docker-compose.prod.yml down"
    echo ""
}

# Main execution
main() {
    echo "Starting Nova Universe Production Deployment..."
    echo ""
    
    check_docker
    check_docker_compose
    setup_environment
    setup_directories
    setup_ssl
    setup_nginx
    build_images
    deploy_stack
    health_check
    show_access_info
}

# Run main function
main "$@"
