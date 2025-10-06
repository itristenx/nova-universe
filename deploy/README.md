# Nova Universe Deployment Configuration

This directory contains all deployment-related configuration files for Nova Universe, organized following industry best practices (2024-2025 standards).

## Directory Structure

```
deploy/
├── docker/                  # Docker Compose configurations
│   ├── development/        # Development environment
│   │   ├── docker-compose.yml
│   │   └── docker-compose.override.yml
│   ├── production/         # Production environment
│   │   └── docker-compose.yml
│   └── monitoring/         # Monitoring stack
│       └── docker-compose.yml
└── env/                    # Environment variable templates
    ├── .env.example
    ├── .env.production.template
    ├── .env.test
    └── .env.monitoring.template
```

## Quick Start

### Development

```bash
# From project root
docker-compose -f deploy/docker/development/docker-compose.yml up -d

# Or use the convenience symlink at root
docker-compose up -d
```

### Production

```bash
# From project root
docker-compose -f deploy/docker/production/docker-compose.yml up -d
```

### Monitoring

```bash
# Start monitoring stack
docker-compose -f deploy/docker/monitoring/docker-compose.yml up -d
```

## Environment Configuration

### Setup for Development

1. Copy the example environment file:
   ```bash
   cp deploy/env/.env.example .env
   ```

2. Edit `.env` with your local settings

3. Start services:
   ```bash
   docker-compose up -d
   ```

### Setup for Production

1. Copy the production template:
   ```bash
   cp deploy/env/.env.production.template .env.production
   ```

2. Fill in all required production values (marked with `REPLACE_WITH_*`)

3. Start production stack:
   ```bash
   docker-compose -f deploy/docker/production/docker-compose.yml --env-file .env.production up -d
   ```

## Docker Compose Profiles

The development compose file supports different profiles:

- **default**: Core services (PostgreSQL, MongoDB, Redis)
- **full**: All services including Elasticsearch, Kibana
- **development**: Include development tools (pgAdmin, Mongo Express)

Example:
```bash
# Start with all services
docker-compose --profile full up -d

# Start with development tools
docker-compose --profile development up -d
```

## Service Architecture

### Core Services
- **PostgreSQL**: Primary relational database
- **MongoDB**: Logs and telemetry data
- **Redis**: Caching and session storage

### Application Services
- **nova-api**: Backend API server
- **nova-unified**: Modern unified admin UI

### Optional Services
- **Elasticsearch**: Search and analytics (profile: full)
- **Kibana**: Elasticsearch visualization (profile: full)
- **pgAdmin**: PostgreSQL management (profile: development)
- **Mongo Express**: MongoDB web interface (profile: development)

### Monitoring Stack
- **GoAlert**: Alert management and escalation
- **Uptime Kuma**: Uptime monitoring
- **Grafana**: Metrics visualization
- **Prometheus**: Metrics collection

## Best Practices

### Environment Variables

1. **Never commit `.env` files** to version control
2. Use `.env.example` as a template for required variables
3. Keep production secrets in a secure secrets manager
4. Use environment-specific files (`.env.development`, `.env.production`, etc.)

### Docker Compose

1. **Use named volumes** for data persistence
2. **Set resource limits** in production
3. **Use health checks** for all services
4. **Implement restart policies** appropriately
5. **Use multi-stage builds** for application images

### Security

1. Change all default passwords before production use
2. Use secrets for sensitive data in production
3. Enable SSL/TLS for external connections
4. Run containers with non-root users when possible
5. Keep base images updated regularly

## Maintenance

### Backing Up Data

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U nova_admin nova_universe > backup.sql

# Backup MongoDB
docker-compose exec mongodb mongodump --out /backups/$(date +%Y%m%d)
```

### Updating Services

```bash
# Pull latest images
docker-compose pull

# Recreate containers with new images
docker-compose up -d --force-recreate
```

### Cleanup

```bash
# Remove stopped containers
docker-compose down

# Remove containers and volumes (WARNING: deletes data)
docker-compose down -v

# Clean up unused Docker resources
docker system prune -a
```

## Troubleshooting

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs nova-api

# Follow logs
docker-compose logs -f
```

### Check Service Health

```bash
# List running services
docker-compose ps

# Check specific service health
docker-compose exec nova-api curl http://localhost:3000/api/health
```

### Common Issues

1. **Port conflicts**: Check if ports are already in use
   ```bash
   lsof -i :5432  # Check PostgreSQL port
   ```

2. **Permission errors**: Ensure proper file permissions for volumes
   ```bash
   sudo chown -R $USER:$USER ./data
   ```

3. **Out of memory**: Increase Docker memory limits in Docker Desktop settings

## Migration from Root-Level Files

The following files have been moved to maintain industry standards:

- `docker-compose.yml` → `deploy/docker/development/docker-compose.yml` (with symlink at root)
- `docker-compose.prod.yml` → `deploy/docker/production/docker-compose.yml`
- `docker-compose.monitoring.yml` → `deploy/docker/monitoring/docker-compose.yml`
- `env.template` → `deploy/env/.env.example`
- `.env.production.template` → `deploy/env/.env.production.template`

A symlink has been maintained at the root level for backward compatibility.

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nova Universe Documentation](../../docs/)

## Support

For issues or questions:
1. Check the [troubleshooting guide](../../docs/TROUBLESHOOTING.md)
2. Review [deployment documentation](../../docs/DEPLOYMENT.md)
3. Open an issue on GitHub
