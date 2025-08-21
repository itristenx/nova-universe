#!/usr/bin/env bash
# SSL/TLS Certificate Setup for Nova Universe Production

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}ℹ️  $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Default values
DOMAIN="${DOMAIN:-nova-universe.local}"
CERT_DIR="${CERT_DIR:-/etc/ssl/nova-universe}"
KEY_SIZE=4096
DAYS=365

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Generate SSL/TLS certificates for Nova Universe production deployment.

OPTIONS:
    -d, --domain DOMAIN     Domain name for the certificate (default: nova-universe.local)
    -o, --output DIR        Output directory for certificates (default: /etc/ssl/nova-universe)
    -s, --self-signed       Generate self-signed certificate for development
    -l, --letsencrypt       Generate Let's Encrypt certificate (requires external access)
    -h, --help             Show this help message

EXAMPLES:
    # Self-signed certificate for development
    $0 --self-signed --domain localhost

    # Let's Encrypt certificate for production
    $0 --letsencrypt --domain api.yourdomain.com

    # Custom certificate with specific domain
    $0 --domain nova.yourdomain.com --output /custom/cert/path

EOF
    exit 1
}

# Parse command line arguments
SELF_SIGNED=false
LETSENCRYPT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -o|--output)
            CERT_DIR="$2"
            shift 2
            ;;
        -s|--self-signed)
            SELF_SIGNED=true
            shift
            ;;
        -l|--letsencrypt)
            LETSENCRYPT=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi
    
    if [[ "$LETSENCRYPT" == "true" ]] && ! command -v certbot &> /dev/null; then
        missing_deps+=("certbot")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Install with: apt-get install ${missing_deps[*]} (Ubuntu/Debian)"
        log_info "Install with: yum install ${missing_deps[*]} (CentOS/RHEL)"
        log_info "Install with: brew install ${missing_deps[*]} (macOS)"
        exit 1
    fi
}

# Create certificate directory
setup_cert_directory() {
    log_info "Setting up certificate directory: $CERT_DIR"
    
    if [[ ! -d "$CERT_DIR" ]]; then
        sudo mkdir -p "$CERT_DIR"
    fi
    
    # Set secure permissions
    sudo chmod 750 "$CERT_DIR"
    sudo chown root:ssl-cert "$CERT_DIR" 2>/dev/null || sudo chown root:root "$CERT_DIR"
}

# Generate self-signed certificate
generate_self_signed() {
    log_info "Generating self-signed certificate for $DOMAIN..."
    
    local key_file="$CERT_DIR/nova-universe.key"
    local cert_file="$CERT_DIR/nova-universe.crt"
    local csr_file="$CERT_DIR/nova-universe.csr"
    
    # Generate private key
    sudo openssl genrsa -out "$key_file" $KEY_SIZE
    
    # Generate certificate signing request
    sudo openssl req -new -key "$key_file" -out "$csr_file" -subj "/C=US/ST=State/L=City/O=Nova Universe/OU=IT Department/CN=$DOMAIN"
    
    # Generate self-signed certificate
    sudo openssl x509 -req -in "$csr_file" -signkey "$key_file" -out "$cert_file" -days $DAYS \
        -extensions v3_req -extensions v3_ca \
        -config <(cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=US
ST=State
L=City
O=Nova Universe
OU=IT Department
CN=$DOMAIN

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[v3_ca]
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always,issuer
basicConstraints = CA:true

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
DNS.3 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
    )
    
    # Set secure permissions
    sudo chmod 600 "$key_file"
    sudo chmod 644 "$cert_file"
    
    # Clean up CSR
    sudo rm "$csr_file"
    
    log_info "Self-signed certificate generated successfully!"
    log_warning "Note: Self-signed certificates are not trusted by browsers by default."
    log_info "Certificate: $cert_file"
    log_info "Private Key: $key_file"
}

# Generate Let's Encrypt certificate
generate_letsencrypt() {
    log_info "Generating Let's Encrypt certificate for $DOMAIN..."
    
    if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
        sudo certbot certonly --standalone -d "$DOMAIN" --email admin@"$DOMAIN" --agree-tos --non-interactive
    else
        log_info "Certificate already exists, renewing..."
        sudo certbot renew --dry-run
    fi
    
    # Link certificates to our directory
    sudo ln -sf "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERT_DIR/nova-universe.crt"
    sudo ln -sf "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$CERT_DIR/nova-universe.key"
    
    log_info "Let's Encrypt certificate configured successfully!"
    log_info "Certificate: $CERT_DIR/nova-universe.crt"
    log_info "Private Key: $CERT_DIR/nova-universe.key"
}

# Verify certificate
verify_certificate() {
    local cert_file="$CERT_DIR/nova-universe.crt"
    local key_file="$CERT_DIR/nova-universe.key"
    
    if [[ -f "$cert_file" && -f "$key_file" ]]; then
        log_info "Verifying certificate..."
        
        # Check certificate validity
        if sudo openssl x509 -in "$cert_file" -text -noout | grep -q "$DOMAIN"; then
            log_info "✅ Certificate is valid for domain: $DOMAIN"
        else
            log_warning "⚠️  Certificate domain mismatch"
        fi
        
        # Check key pair match
        local cert_md5=$(sudo openssl x509 -noout -modulus -in "$cert_file" | openssl md5)
        local key_md5=$(sudo openssl rsa -noout -modulus -in "$key_file" | openssl md5)
        
        if [[ "$cert_md5" == "$key_md5" ]]; then
            log_info "✅ Certificate and private key match"
        else
            log_error "❌ Certificate and private key do not match!"
            exit 1
        fi
        
        # Display certificate info
        log_info "Certificate details:"
        sudo openssl x509 -in "$cert_file" -text -noout | grep -E "Subject:|Not Before:|Not After:|DNS:|IP Address:"
    else
        log_error "Certificate files not found!"
        exit 1
    fi
}

# Update environment configuration
update_environment_config() {
    local env_file="$PROJECT_ROOT/.env.production"
    
    log_info "Updating environment configuration..."
    
    if [[ -f "$env_file" ]]; then
        # Update TLS paths in environment file
        sed -i.bak "s|TLS_CERT_PATH=.*|TLS_CERT_PATH=$CERT_DIR/nova-universe.crt|" "$env_file"
        sed -i.bak "s|TLS_KEY_PATH=.*|TLS_KEY_PATH=$CERT_DIR/nova-universe.key|" "$env_file"
        
        log_info "Environment configuration updated in $env_file"
    else
        log_warning "Environment file not found: $env_file"
        log_info "Add these lines to your environment configuration:"
        echo "TLS_CERT_PATH=$CERT_DIR/nova-universe.crt"
        echo "TLS_KEY_PATH=$CERT_DIR/nova-universe.key"
    fi
}

# Setup certificate renewal (for Let's Encrypt)
setup_renewal() {
    if [[ "$LETSENCRYPT" == "true" ]]; then
        log_info "Setting up automatic certificate renewal..."
        
        # Add renewal cron job
        local cron_job="0 2 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx"
        
        if ! sudo crontab -l 2>/dev/null | grep -q "certbot renew"; then
            (sudo crontab -l 2>/dev/null; echo "$cron_job") | sudo crontab -
            log_info "Automatic renewal configured"
        else
            log_info "Automatic renewal already configured"
        fi
    fi
}

# Main execution
main() {
    log_info "Nova Universe SSL/TLS Certificate Setup"
    log_info "Domain: $DOMAIN"
    log_info "Output Directory: $CERT_DIR"
    
    check_dependencies
    setup_cert_directory
    
    if [[ "$LETSENCRYPT" == "true" ]]; then
        generate_letsencrypt
        setup_renewal
    else
        generate_self_signed
    fi
    
    verify_certificate
    update_environment_config
    
    log_info "🎉 SSL/TLS certificate setup completed!"
    
    if [[ "$SELF_SIGNED" == "true" ]]; then
        log_warning "Remember to add the certificate to your browser's trusted certificates for development."
    fi
    
    log_info "Next steps:"
    log_info "1. Update your environment configuration with the certificate paths"
    log_info "2. Restart Nova Universe services"
    log_info "3. Test HTTPS connectivity"
    log_info "4. Configure your reverse proxy/load balancer if applicable"
}

main "$@"
