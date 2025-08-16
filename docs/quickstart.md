# Quick Start Guide

Get Nova Universe running in under 5 minutes.

## Installation

**Option 1: Automatic Setup (Recommended)**

```bash
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
./setup.sh
```

**Option 2: Manual Setup**

```bash
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
pnpm install
docker-compose up -d
```

## Access Your System

After setup completes, open these URLs:

- **Admin Interface**: http://localhost:3001
- **Setup Wizard**: http://localhost:3001/setup
- **API Docs**: http://localhost:3000/docs
- **Monitoring**: http://localhost:3002
- **Alerting**: http://localhost:8081

## Default Login

- **Email**: `admin@example.com`
- **Password**: `admin`

⚠️ **Change this password immediately after first login!**

## Next Steps

### 1. Complete Setup Wizard

Visit http://localhost:3001/setup to configure:

- Team integrations (Slack, Teams)
- File storage (Local or S3)
- Search engine (Elasticsearch)
- Monitoring & alerting
- AI features

### 2. Create Your First Ticket

- Go to the admin interface
- Click "New Ticket"
- Fill out the form
- Submit and track progress

### 3. Setup iPad Kiosk

- Visit http://localhost:3001/kiosks
- Generate activation code
- Enter code on iPad at http://your-server:3001/kiosk

### 4. Configure Monitoring

Nova Sentinel provides uptime monitoring:

- Visit http://localhost:3002
- Add your websites/services
- Configure notifications
- Set up status pages

### 5. Setup Alerting

GoAlert handles incident response:

- Visit http://localhost:8081
- Create escalation policies
- Add on-call schedules
- Configure notification methods

## Common Commands

### Service Management

```bash
# Check system health
cd apps/api && node cli.js health

# Start/stop services
cd apps/api && node cli.js start
cd apps/api && node cli.js stop

# View service status
cd apps/api && node cli.js status
```

### User Management

```bash
# Change admin password
cd apps/api && node cli.js passwd newpassword123

# List admin users
cd apps/api && node cli.js users
```

### System Operations

```bash
# Reset system (removes all data)
cd apps/api && node cli.js reset

# Production deployment
./scripts/deploy-production.sh

# Complete removal
./teardown.sh
```

## Troubleshooting

**Services won't start?**

```bash
# Check Docker status
docker ps

# View logs
docker-compose logs -f

# Restart everything
docker-compose down && docker-compose up -d
```

**Can't access web interface?**

- Ensure port 3001 is not blocked
- Check if services are running: `docker-compose ps`
- Wait 30-60 seconds after startup

**Database connection issues?**

```bash
# Check PostgreSQL status
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

**Monitoring not working?**

- Ensure port 3002 is available
- Check monitoring logs: `docker-compose -f docker-compose.monitoring.yml logs`
- Restart monitoring: `docker-compose -f docker-compose.monitoring.yml restart`

## Support

- **Health Check**: `cd apps/api && node cli.js health`
- **View Logs**: `docker-compose logs -f [service-name]`
- **Reset System**: `cd apps/api && node cli.js reset`
- **Documentation**: Browse other files in `docs/`
- **Issues**: https://github.com/itristenx/nova-universe/issues

## Production Deployment

For production environments:

1. **Generate production secrets**:

   ```bash
   bash scripts/generate-production-secrets.sh
   ```

2. **Deploy with SSL and monitoring**:

   ```bash
   bash scripts/deploy-production.sh
   ```

3. **Configure DNS and SSL certificates**
4. **Setup backups and monitoring**
5. **Configure external integrations**

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed production setup.

---

**That's it!** You now have a fully functional help desk system with monitoring, alerting, and AI capabilities.
