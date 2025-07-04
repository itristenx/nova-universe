#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

get_dir() {
  case "$1" in
    api) echo "cueit-api" ;;
    admin) echo "cueit-admin" ;;
    activate) echo "cueit-activate" ;;
    slack) echo "cueit-slack" ;;
    *) return 1 ;;
  esac
}

get_cmd() {
  case "$1" in
    api) echo "node cueit-api/index.js" ;;
    admin) echo "npm --prefix cueit-admin run dev" ;;
    activate) echo "npm --prefix cueit-activate run dev" ;;
    slack) echo "node cueit-slack/index.js" ;;
    *) return 1 ;;
  esac
}

read -rp "Apps to start (api,admin,activate,slack or all) [all]: " INPUT
if [[ -z "$INPUT" || "$INPUT" == "all" ]]; then
  SELECTED=(api admin activate slack)
else
  IFS=',' read -ra SELECTED <<< "$INPUT"
fi

NAMES=()
COMMANDS=()
for APP in "${SELECTED[@]}"; do
  DIR=$(get_dir "$APP") || { echo "Unknown app: $APP" >&2; exit 1; }
  CMD=$(get_cmd "$APP") || { echo "Unknown app: $APP" >&2; exit 1; }
  if [[ ! -f $DIR/.env ]]; then
    echo "Error: $DIR/.env not found. Copy $DIR/.env.example to $DIR/.env." >&2
    exit 1
  fi
  if [[ ! -d $DIR/node_modules ]]; then
    echo "Installing dependencies for $DIR..."
    npm --prefix "$DIR" install
  fi
  NAMES+=("$APP")
  COMMANDS+=("$CMD")
done

NAME_STR=$(IFS=','; echo "${NAMES[*]}")
npx concurrently -k -n "$NAME_STR" "${COMMANDS[@]}"

