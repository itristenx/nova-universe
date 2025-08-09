# Nova Universe - Deployment Guide

This guide provides comprehensive instructions for deploying the unified Nova Universe application to various environments.

## 🚀 Quick Start

### Automated Setup

The fastest way to get started is using our automated setup script:

```bash
cd apps/nova-universe
./scripts/setup.sh
```

This script will:
- Check prerequisites
- Set up environment configuration
- Install dependencies
- Configure Git hooks
- Optionally build and test the application

### Manual Setup

If you prefer manual setup or need customization:

```bash
# 1. Navigate to the application directory
cd apps/nova-universe

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Configure your environment variables
# Edit .env.local with your specific configuration

# 5. Start development server
npm run dev
```

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://nova.company.com` |
| `NEXT_PUBLIC_API_URL` | Nova Core API URL | `https://api.nova.company.com` |
| `NEXT_PUBLIC_AUTH_URL` | Nova Helix Auth URL | `https://api.nova.company.com/api/v1/helix` |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_THEME_DEFAULT` | `light` | Default theme (`light`, `dark`, `system`) |
| `NEXT_PUBLIC_PWA_ENABLED` | `true` | Enable PWA features |
| `NEXT_PUBLIC_DEBUG_MODE` | `false` | Enable debug mode |
| `ANALYZE` | `false` | Enable bundle analysis |

### Module Feature Flags

Control which modules are enabled:

```env
NEXT_PUBLIC_MODULE_CORE_ENABLED=true    # Admin portal
NEXT_PUBLIC_MODULE_PULSE_ENABLED=true   # Technician portal
NEXT_PUBLIC_MODULE_ORBIT_ENABLED=true   # End-user portal
NEXT_PUBLIC_MODULE_BEACON_ENABLED=true  # Kiosk interface
NEXT_PUBLIC_MODULE_LORE_ENABLED=true    # Knowledge base
NEXT_PUBLIC_MODULE_SYNTH_ENABLED=true   # Analytics
```

## 🏗️ Build Process

### Development Build

```bash
npm run dev
```

Starts the development server with:
- Hot reloading
- Source maps
- Debug tools
- React Query DevTools

### Production Build

```bash
npm run build
npm start
```

Creates an optimized production build with:
- Code minification
- Bundle optimization
- Static asset optimization
- Service worker generation

### Bundle Analysis

```bash
npm run analyze
```

Generates a visual representation of the bundle size and composition.

## 🐳 Docker Deployment

### Building the Docker Image

```bash
# Build the image
docker build -f Dockerfile.prod -t nova-universe:latest .

# Run the container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=https://api.nova.company.com \
  -e NEXT_PUBLIC_AUTH_URL=https://api.nova.company.com/api/v1/helix \
  nova-universe:latest
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  nova-universe:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_APP_URL=https://nova.company.com
      - NEXT_PUBLIC_API_URL=https://api.nova.company.com
      - NEXT_PUBLIC_AUTH_URL=https://api.nova.company.com/api/v1/helix
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - nova-universe
    restart: unless-stopped
```

## ☁️ Cloud Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Environment Variables**:
   Configure in Vercel Dashboard or use CLI:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_AUTH_URL
   ```

3. **Custom Domain**:
   ```bash
   vercel domains add nova.company.com
   ```

### AWS ECS

1. **Create Task Definition**:
   ```json
   {
     "family": "nova-universe",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [{
       "name": "nova-universe",
       "image": "your-registry/nova-universe:latest",
       "portMappings": [{"containerPort": 3001}],
       "environment": [
         {"name": "NEXT_PUBLIC_API_URL", "value": "https://api.nova.company.com"},
         {"name": "NEXT_PUBLIC_AUTH_URL", "value": "https://api.nova.company.com/api/v1/helix"}
       ],
       "logConfiguration": {
         "logDriver": "awslogs",
         "options": {
           "awslogs-group": "/ecs/nova-universe",
           "awslogs-region": "us-east-1",
           "awslogs-stream-prefix": "ecs"
         }
       }
     }]
   }
   ```

2. **Create Service**:
   ```bash
   aws ecs create-service \
     --cluster nova-cluster \
     --service-name nova-universe \
     --task-definition nova-universe \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

### Kubernetes

1. **Deployment Manifest**:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nova-universe
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nova-universe
     template:
       metadata:
         labels:
           app: nova-universe
       spec:
         containers:
         - name: nova-universe
           image: nova-universe:latest
           ports:
           - containerPort: 3001
           env:
           - name: NEXT_PUBLIC_API_URL
             value: "https://api.nova.company.com"
           - name: NEXT_PUBLIC_AUTH_URL
             value: "https://api.nova.company.com/api/v1/helix"
           resources:
             requests:
               memory: "512Mi"
               cpu: "250m"
             limits:
               memory: "1Gi"
               cpu: "500m"
           livenessProbe:
             httpGet:
               path: /api/health
               port: 3001
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /api/health
               port: 3001
             initialDelaySeconds: 5
             periodSeconds: 5
   ```

2. **Service Manifest**:
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nova-universe-service
   spec:
     selector:
       app: nova-universe
     ports:
       - protocol: TCP
         port: 80
         targetPort: 3001
     type: LoadBalancer
   ```

## 🔒 Security Configuration

### HTTPS Setup

1. **SSL Certificate**:
   ```bash
   # Using Let's Encrypt with Certbot
   certbot certonly --webroot -w /var/www/html -d nova.company.com
   ```

2. **Nginx Configuration**:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name nova.company.com;
       
       ssl_certificate /etc/ssl/certs/nova.company.com.crt;
       ssl_certificate_key /etc/ssl/private/nova.company.com.key;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Security Headers

The application automatically includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

### Content Security Policy

Add to your reverse proxy or environment:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.nova.company.com;
```

## 📊 Monitoring & Observability

### Health Checks

The application provides health check endpoints:

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status
- `GET /api/health/ready` - Readiness probe

### Logging

Application logs are structured JSON and include:
- Request/response logs
- Authentication events
- Error tracking
- Performance metrics

### Metrics

Key metrics to monitor:
- Response time
- Error rate
- Memory usage
- CPU utilization
- Active users
- Feature usage

### Error Tracking

Integrate with error tracking services:

```typescript
// Sentry integration example
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Nova Universe

on:
  push:
    branches: [main]
    paths: ['apps/nova-universe/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: apps/nova-universe/package-lock.json
      
      - name: Install dependencies
        run: |
          cd apps/nova-universe
          npm ci
      
      - name: Run tests
        run: |
          cd apps/nova-universe
          npm run test
      
      - name: Type check
        run: |
          cd apps/nova-universe
          npm run type-check
      
      - name: Lint
        run: |
          cd apps/nova-universe
          npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and push Docker image
        run: |
          cd apps/nova-universe
          docker build -f Dockerfile.prod -t nova-universe:${{ github.sha }} .
          docker tag nova-universe:${{ github.sha }} your-registry/nova-universe:latest
          docker push your-registry/nova-universe:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster nova-cluster \
            --service nova-universe \
            --force-new-deployment
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear dependencies and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Environment Variables**:
   ```bash
   # Check environment variables are loaded
   npm run dev -- --debug
   
   # Verify in browser console
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```

3. **Authentication Issues**:
   - Verify Nova Helix API is accessible
   - Check CORS configuration
   - Validate JWT token format

4. **PWA Installation**:
   - Ensure HTTPS is enabled
   - Verify manifest.json is accessible
   - Check service worker registration

### Performance Issues

1. **Slow Loading**:
   ```bash
   # Analyze bundle size
   npm run analyze
   
   # Enable performance monitoring
   NEXT_PUBLIC_PERFORMANCE_MONITORING=true npm run dev
   ```

2. **Memory Leaks**:
   - Check React Query cache configuration
   - Verify event listeners are cleaned up
   - Monitor memory usage in production

### Logging

Enable debug logging:

```env
# Development
NEXT_PUBLIC_DEBUG_MODE=true

# Production (use with caution)
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] API endpoints accessible
- [ ] Security headers configured
- [ ] Monitoring setup completed

### Post-Deployment

- [ ] Health checks passing
- [ ] Authentication working
- [ ] All modules accessible
- [ ] PWA installation working
- [ ] Performance monitoring active
- [ ] Error tracking configured

### Rollback Plan

1. **Immediate Rollback**:
   ```bash
   # Docker
   docker run -p 3001:3001 nova-universe:previous-tag
   
   # Kubernetes
   kubectl rollout undo deployment/nova-universe
   
   # ECS
   aws ecs update-service --cluster nova-cluster --service nova-universe --task-definition nova-universe:previous-revision
   ```

2. **Database Rollback**:
   - Have database backup ready
   - Test rollback procedures
   - Document recovery steps

## 📞 Support

### Getting Help

- **Documentation**: Check the `docs/` directory
- **Issues**: GitHub repository issues
- **Emergency**: Contact system administrators

### Maintenance Windows

- **Security Updates**: First Tuesday of each month
- **Feature Updates**: Quarterly releases
- **Emergency Patches**: As needed

---

© 2024 Nova Universe Team. All rights reserved.