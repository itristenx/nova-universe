#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Nova Universe Demo Launcher"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

API_PORT=${API_PORT:-3000}
UI_PORT=${UI_PORT:-3002}

# 1) Start core data services via Docker (Postgres, Mongo, Redis)
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker is required to run the demo (missing 'docker' binary)." >&2
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop and retry." >&2
  exit 1
fi

echo "🗄️  Starting databases (postgres, mongodb, redis)..."
docker compose up -d postgres mongodb redis

echo -n "⏳ Waiting for Postgres to be healthy"
for i in {1..60}; do
  status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' nova-postgres 2>/dev/null || echo "")
  if [ "$status" = "healthy" ]; then echo " ✓"; break; fi
  echo -n "."; sleep 2
  if [ "$i" = "60" ]; then echo "\n⚠️  Postgres not healthy yet, continuing..."; fi
done

# 2) Seed an admin user (idempotent)
echo "🔑 Ensuring demo admin user exists (admin@nova.local)"
POSTGRES_HOST=localhost POSTGRES_USER=${POSTGRES_USER:-nova_admin} POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-nova_password} POSTGRES_DB=${POSTGRES_DB:-nova_universe} \
node apps/api/create-admin.js admin@nova.local Str0ng\!P@ss\! "System Admin" || true

# 3) Start API in the background
echo "🧩 Starting API on http://localhost:${API_PORT} (logs: api.out)"
(
  cd apps/api
  nohup env \
    API_PORT=${API_PORT} \
    NODE_ENV=development \
    DISABLE_AUTH=false \
    SESSION_SECRET=${SESSION_SECRET:-devsession} \
    JWT_SECRET=${JWT_SECRET:-devjwt} \
    POSTGRES_HOST=${POSTGRES_HOST:-localhost} \
    POSTGRES_USER=${POSTGRES_USER:-nova_admin} \
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-nova_password} \
    POSTGRES_DB=${POSTGRES_DB:-nova_universe} \
    CORS_ORIGINS=http://localhost:${UI_PORT} \
    node index.js > ../../api.out 2>&1 & echo $! > ../../api.pid
)

# 4) Install UI deps and start UI in the background
echo "🖥️  Installing UI deps (if needed)"
if [ ! -d apps/unified/node_modules ]; then
  (cd apps/unified && npm ci --legacy-peer-deps)
fi

echo "🌐 Starting UI on http://localhost:${UI_PORT} (logs: ui.out)"
(
  cd apps/unified
  nohup env \
    VITE_API_URL=http://localhost:${API_PORT} \
    VITE_WS_URL=ws://localhost:${API_PORT} \
    npm run dev > ../../ui.out 2>&1 & echo $! > ../../ui.pid
)

sleep 2
echo "✅ Demo stack starting. Health checks:"
echo "   API: curl -s http://localhost:${API_PORT}/api/health | jq . || curl -s http://localhost:${API_PORT}/api/health"
echo "   UI : open http://localhost:${UI_PORT}"
echo "📜 Tail logs: tail -f api.out ui.out"

