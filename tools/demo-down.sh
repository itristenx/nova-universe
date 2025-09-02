#!/usr/bin/env bash
set -euo pipefail

echo "🛑 Stopping Nova Universe demo stack"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

kill_if_running() {
  local pidfile=$1
  if [ -f "$pidfile" ]; then
    local pid
    pid=$(cat "$pidfile" || true)
    if [ -n "${pid}" ] && ps -p "$pid" > /dev/null 2>&1; then
      echo "⚙️  Killing PID $pid from $pidfile"
      kill "$pid" || true
    fi
    rm -f "$pidfile"
  fi
}

kill_if_running api.pid
kill_if_running ui.pid

if command -v docker >/dev/null 2>&1; then
  echo "🗃️  Stopping databases (postgres, mongodb, redis)"
  docker compose stop postgres mongodb redis || true
fi

echo "✅ Done."

