# Nova Sentinel - Complete Uptime Kuma Integration Service
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    sqlite \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Create data directory
RUN mkdir -p /data /config /logs

# Create non-root user
RUN addgroup -g 1001 -S sentinel && \
    adduser -S sentinel -u 1001 -G sentinel

# Set permissions
RUN chown -R sentinel:sentinel /app /data /config /logs

# Switch to non-root user
USER sentinel

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Expose port
EXPOSE 3002

# Environment variables
ENV NODE_ENV=production
ENV SENTINEL_PORT=3002
ENV DATABASE_PATH=/data/sentinel.db
ENV LOG_LEVEL=info

# Start the service
CMD ["node", "src/index.js"]
