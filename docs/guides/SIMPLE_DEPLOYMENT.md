# Production Deployment Guide

Deploy Nova Universe to production with monitoring, alerting, and AI capabilities.

## Pre-Deployment Checklist

- [ ] Server with Docker and Docker Compose
- [ ] Domain name configured
- [ ] SSL certificates ready
- [ ] Environment variables configured
- [ ] Database backup strategy
- [ ] Monitoring setup planned

## Quick Production Deployment

**One-command deployment:**

```bash
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
bash scripts/deploy-production.sh
```

This automatically:

- Builds production images
- Creates SSL certificates
- Starts all services with monitoring
- Runs health checks
- Creates backups

## Manual Production Setup

### 1. Server Requirements

**Minimum specs:**

- 2 CPU cores
- 4GB RAM
- 50GB storage
- Ubuntu 20.04+ or equivalent

**Recommended:**

- 4 CPU cores
- 8GB RAM
- 100GB SSD storage

### 2. Install Dependencies

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Clone Nova Universe
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
```

### 3. Configure Environment

**Generate production secrets:**

```bash
bash scripts/generate-production-secrets.sh
```

**Edit environment files:**

```bash
# API configuration
nano apps/api/.env

# Monitoring configuration
nano .env.monitoring

# AI configuration (optional)
nano .env.ai-fabric
```

**Key settings to update:**

- Database credentials
- JWT secrets
- Domain names
- SSL certificate paths
- External service credentials

### 4. SSL Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

**Option B: Self-signed (Development)**

```bash
# Generate self-signed certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### 5. Deploy Services

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Start AI services (if configured)
docker-compose -f docker-compose.ai-fabric.yml up -d
```

### 6. Verify Deployment

```bash
# Check service health
cd apps/api && node cli.js health

# Test HTTPS access
curl -k https://yourdomain.com

# Check monitoring
curl -k https://yourdomain.com/sentinel
```

## Service URLs

After deployment, access these URLs:

- **Main Interface**: https://yourdomain.com
- **API Documentation**: https://yourdomain.com/api/docs
- **Setup Wizard**: https://yourdomain.com/setup
- **Monitoring Dashboard**: https://yourdomain.com/sentinel
- **Alerting Console**: https://yourdomain.com/goalert
- **AI Fabric**: https://yourdomain.com/ai-fabric

## Post-Deployment Configuration

### 1. Complete Setup Wizard

- Visit https://yourdomain.com/setup
- Configure integrations
- Set up monitoring targets
- Configure alerting policies

### 2. Security Hardening

```bash
# Change default admin password
cd apps/api && node cli.js passwd your-secure-password

# Review user accounts
cd apps/api && node cli.js users

# Configure firewall
sudo ufw allow 80,443/tcp
sudo ufw enable
```

### 3. Backup Configuration

```bash
# Create backup directory
mkdir -p /backups/nova-universe

# Add to crontab for daily backups
0 2 * * * cd /path/to/nova-universe && bash scripts/backup.sh
```

### 4. Monitoring Setup

- Configure Nova Sentinel monitoring targets
- Set up GoAlert escalation policies
- Test notification channels
- Create status pages

## Scaling and High Availability

### Database High Availability

```yaml
# docker-compose.prod.yml example
postgres:
  image: postgres:15
  environment:
    POSTGRES_HOST_AUTH_METHOD: trust
  volumes:
    - postgres_data:/var/lib/postgresql/data
  deploy:
    replicas: 1
    restart_policy:
      condition: on-failure
```

### Load Balancing

```nginx
# nginx/sites-available/nova-universe
upstream nova_api {
    server nova-api-1:3000;
    server nova-api-2:3000;
}

upstream nova_core {
    server nova-core-1:3001;
    server nova-core-2:3001;
}
```

### Redis Clustering

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
```

## Monitoring and Alerting

### Nova Sentinel Configuration

- **Uptime Monitoring**: Add all critical services
- **Performance Metrics**: CPU, memory, disk usage
- **Status Pages**: Public status for users
- **Notifications**: Email, Slack, webhooks

### GoAlert Setup

- **Escalation Policies**: Define who gets notified when
- **On-call Schedules**: Rotation schedules
- **Notification Methods**: SMS, voice, email
- **Integration**: Connect with Nova Sentinel

### AI Fabric Monitoring

- **Model Performance**: Track AI response quality
- **Usage Analytics**: Monitor AI feature adoption
- **Cost Tracking**: Track OpenAI API usage
- **Error Monitoring**: AI service health

## Backup and Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/nova-universe/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Database backup
docker exec nova-postgres pg_dumpall -U postgres > "$BACKUP_DIR/database.sql"

# Volume backups
docker run --rm -v nova_uploads:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz -C /data .
docker run --rm -v nova_logs:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/logs.tar.gz -C /data .

# Configuration backup
cp apps/api/.env "$BACKUP_DIR/"
cp .env.monitoring "$BACKUP_DIR/"
```

### Disaster Recovery

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10
docker exec -i nova-postgres psql -U postgres < backup_database.sql

# Restore volumes
docker run --rm -v nova_uploads:/data -v "$PWD":/backup alpine tar xzf /backup/uploads.tar.gz -C /data

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check resource usage
docker stats

# Restart service
docker-compose -f docker-compose.prod.yml restart [service-name]
```

### Database Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Connect to database
docker exec -it nova-postgres psql -U postgres

# Reset database (CAUTION)
docker-compose down -v
```

### SSL Certificate Issues

```bash
# Test certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt
sudo certbot renew

# Update nginx configuration
docker-compose restart nginx
```

### Performance Issues

```bash
# Monitor resources
docker stats
htop

# Check database performance
docker exec nova-postgres pg_stat_activity

# Review application logs
docker-compose logs nova-api
```

## Maintenance

### Updates

```bash
# Pull latest version
git pull origin main

# Rebuild and deploy
bash scripts/deploy-production.sh
```

### Health Monitoring

```bash
# Daily health check
cd apps/api && node cli.js health

# View system status
cd apps/api && node cli.js status
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/docker

# Manual log cleanup
docker system prune -f
```

## Support

- **Health Check**: `cd apps/api && node cli.js health`
- **Emergency Reset**: `cd apps/api && node cli.js reset` (removes all data)
- **Rollback**: `bash scripts/deploy-production.sh rollback`
- **Documentation**: https://github.com/itristenx/nova-universe
- **Issues**: https://github.com/itristenx/nova-universe/issues

---

**Production deployment complete!** Your Nova Universe instance is now running with enterprise monitoring, alerting, and AI capabilities.
