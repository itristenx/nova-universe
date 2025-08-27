# Nova Universe - Quick Start Guide

## 🚀 Quick Setup (Recommended)

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- pnpm (recommended) or npm

### 1. Clone and Setup
```bash
git clone <your-repo>
cd nova-universe
./setup.sh
```

### 2. Start Development Environment
```bash
./dev.sh
```

The app will be available at: http://localhost:5173

## 🐳 Docker Services

### Core Services (Always Running)
- **PostgreSQL**: Core database on port 5432
- **MongoDB**: Logs and telemetry on port 27017  
- **Redis**: Caching on port 6379

### Optional Services (Full Profile)
- **pgAdmin**: PostgreSQL management on port 8080
- **Mongo Express**: MongoDB management on port 8081
- **Elasticsearch**: Search and analytics on port 9200
- **Kibana**: Elasticsearch dashboard on port 5601

### Service Management
```bash
# Start core services only
docker-compose up -d postgres mongodb redis

# Start all services (full profile)
docker-compose --profile full up -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🛠️ Development Commands

### Unified App
```bash
cd apps/unified

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### Database Management
```bash
# Run Prisma migrations
cd prisma
npx prisma migrate deploy
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## 🌐 First Time Setup

1. **Start the application**: `./dev.sh`
2. **Visit setup wizard**: http://localhost:5173/setup
3. **Configure organization**: Follow the setup steps
4. **Create admin user**: Set up your first administrator account
5. **Complete setup**: Your organization will be ready to use

## 🔧 Environment Configuration

The setup script automatically creates a `.env` file. Key variables:

```bash
# Database
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_admin
POSTGRES_PASSWORD=nova_password

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=mongo_secure_pass_2024

# Redis
REDIS_PASSWORD=redis_secure_pass_2024

# Organization
ORGANIZATION_NAME=Nova ITSM
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## 🚨 Troubleshooting

### Common Issues

**Docker not running**
```bash
# Start Docker Desktop or Docker daemon
# On macOS: open Docker Desktop
# On Linux: sudo systemctl start docker
```

**Port conflicts**
```bash
# Check what's using the ports
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB
lsof -i :6379  # Redis
lsof -i :5173  # Unified UI
```

**Database connection issues**
```bash
# Restart database services
docker-compose restart postgres mongodb redis

# Check service logs
docker-compose logs postgres
docker-compose logs mongodb
```

**Dependencies not installed**
```bash
# Clean install
rm -rf node_modules package-lock.json
pnpm install
```

### Reset Everything
```bash
# Stop all services
docker-compose down

# Remove all data
docker-compose down -v

# Restart from scratch
./setup.sh
```

## 📚 Next Steps

After successful setup:

1. **Explore the interface**: Navigate through different sections
2. **Configure integrations**: Set up email, Slack, etc.
3. **Create workflows**: Build your service processes
4. **Invite team members**: Add users and assign roles
5. **Customize branding**: Update logos, colors, and messaging

## 🆘 Need Help?

- Check the logs: `docker-compose logs -f`
- Review configuration: Check `.env` file
- Restart services: `docker-compose restart`
- Full reset: `./setup.sh --full`

For more detailed documentation, see the `docs/` directory.
