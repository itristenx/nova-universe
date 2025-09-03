# Slack Integration Setup Guide

This guide walks through setting up the Nova Universe Slack integration for production use.

## Prerequisites

1. **Nova Universe API running and accessible**
   - API should be accessible at a stable URL
   - JWT authentication configured
   - Ticket creation endpoint (`/api/v1/orbit/tickets`) working

2. **Slack Workspace with admin permissions**
   - Ability to create and configure Slack apps
   - Permission to install apps in the workspace

3. **Public HTTPS endpoint**
   - For production: Use a reverse proxy (nginx, Cloudflare, etc.)
   - For development: Use ngrok or similar tunneling service

## Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Enter app name: "Nova Universe"
4. Select your workspace
5. Click "Create App"

## Step 2: Configure Bot User

1. In your Slack app settings, go to "OAuth & Permissions"
2. Scroll to "Scopes" → "Bot Token Scopes"
3. Add these scopes:
   - `commands` - Use slash commands
   - `chat:write` - Send messages as bot
   - `users:read` - View user information
   - `app_mentions:read` - Read mentions

## Step 3: Configure Slash Commands

1. Go to "Slash Commands" in your app settings
2. Create these commands (all point to `https://your-domain.com/slack/events`):

| Command | Description | Request URL |
|---------|-------------|-------------|
| `/it-help` | Submit IT help request | `https://your-domain.com/slack/events` |
| `/new-ticket` | Create new support ticket | `https://your-domain.com/slack/events` |
| `/nova-status` | Check system status | `https://your-domain.com/slack/events` |
| `/nova-queue` | View queue metrics | `https://your-domain.com/slack/events` |
| `/nova-feedback` | Submit feedback | `https://your-domain.com/slack/events` |
| `/nova-assign` | Get assignment suggestion | `https://your-domain.com/slack/events` |

## Step 4: Configure Interactivity

1. Go to "Interactivity & Shortcuts"
2. Toggle "Interactivity" to "On"
3. Set Request URL: `https://your-domain.com/slack/events`

## Step 5: Configure Events

1. Go to "Event Subscriptions"
2. Toggle "Enable Events" to "On"  
3. Set Request URL: `https://your-domain.com/slack/events`
4. Subscribe to bot events:
   - `app_mention` - When users mention @Nova

## Step 6: Install App to Workspace

1. Go to "Install App"
2. Click "Install to Workspace"
3. Review permissions and click "Allow"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Step 7: Configure Nova Comms Service

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your values:
```bash
# From Slack app "Basic Information" → "App Credentials"
SLACK_SIGNING_SECRET=your_signing_secret

# From "OAuth & Permissions" → "Bot User OAuth Token"
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Your Nova Universe API URL
API_URL=https://api.nova.yourdomain.com

# Same JWT secret as your Nova API
JWT_SECRET=your_jwt_secret

# Admin portal URL (for ticket links)
VITE_ADMIN_URL=https://admin.nova.yourdomain.com

# Port for the service (default: 3001)
SLACK_PORT=3001
```

## Step 8: Deploy Nova Comms

### Option A: Docker (Recommended)

```bash
# Build the image
docker build -t nova-comms .

# Run the container
docker run -d \
  --name nova-comms \
  --env-file .env \
  -p 3001:3001 \
  --restart unless-stopped \
  nova-comms
```

### Option B: Direct Node.js

```bash
# Install dependencies
npm install

# Start the service
npm start
```

### Option C: Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start index.js --name nova-comms

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 9: Set Up Reverse Proxy (Production)

### Nginx Configuration

```nginx
upstream nova-comms {
    server 127.0.0.1:3001;
}

server {
    listen 443 ssl http2;
    server_name slack.nova.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /slack/events {
        proxy_pass http://nova-comms;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /health {
        proxy_pass http://nova-comms;
        access_log off;
    }
}
```

## Step 10: Test the Integration

1. **Test slash commands in Slack:**
   ```
   /it-help
   /nova-status  
   /nova-queue
   ```

2. **Test ticket creation:**
   - Use `/it-help` command
   - Fill out the modal form
   - Verify ticket is created in Nova Universe
   - Check that you receive confirmation message

3. **Test AI interaction:**
   ```
   @Nova help me with my computer issue
   ```

## Step 11: Monitor and Maintain

### Health Checks

- Monitor: `https://your-domain.com/health`
- Expected response: `{"status":"healthy",...}`

### Logs

```bash
# Docker logs
docker logs nova-comms

# PM2 logs  
pm2 logs nova-comms

# Direct logs
journalctl -u nova-comms -f
```

### Common Issues

1. **Commands not responding:**
   - Check Request URLs in Slack app match your domain
   - Verify SSL certificate is valid
   - Check service is running and accessible

2. **Authentication errors:**
   - Verify JWT_SECRET matches Nova API
   - Check API_URL is accessible from service
   - Ensure API accepts the service JWT

3. **Slack verification errors:**
   - Verify SLACK_SIGNING_SECRET is correct
   - Check timestamp in logs (requests expire after 5 minutes)

## Security Considerations

1. **Network Security:**
   - Use HTTPS only (required by Slack)
   - Implement rate limiting on reverse proxy
   - Restrict access to internal API endpoints

2. **Secrets Management:**
   - Store secrets in environment variables
   - Use secrets management system (AWS Secrets, Azure Key Vault, etc.)
   - Rotate tokens regularly

3. **Monitoring:**
   - Monitor for failed authentication attempts
   - Alert on service downtime
   - Track ticket creation rates

## Advanced Configuration

### Custom Service Identity

Configure a dedicated service user for better audit trails:

```bash
COMMS_SERVICE_USER_ID=slack-bot
COMMS_SERVICE_USER_EMAIL=slack-bot@yourdomain.com
COMMS_SERVICE_USER_NAME=Slack Integration Bot
COMMS_SERVICE_USER_ROLE=service_account
```

### Multiple Environments

Use different Slack apps for staging and production:

```bash
# Production
SLACK_BOT_TOKEN=xoxb-prod-token
API_URL=https://api.nova.yourdomain.com

# Staging  
SLACK_BOT_TOKEN=xoxb-staging-token
API_URL=https://staging-api.nova.yourdomain.com
```

This completes the Slack integration setup. Users can now create tickets directly from Slack without any mock data!