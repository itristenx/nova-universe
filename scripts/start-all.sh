#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

get_dir() {
  case "$1" in
    api) echo "nova-api" ;;
    core) echo "nova-core" ;;
    comms) echo "nova-comms" ;;
    unified) echo "unified" ;;
    *) return 1 ;;
  esac
}

get_cmd() {
  case "$1" in
    api) echo "npm --prefix nova-api start" ;;
    core) echo "npm --prefix nova-core run dev" ;;
    comms) echo "npm --prefix nova-comms start" ;;
    unified) echo "npm --prefix unified run dev" ;;
    *) return 1 ;;
  esac
}

read -rp "Apps to start (api,core,comms,unified or all) [all]: " INPUT
if [[ -z "$INPUT" || "$INPUT" == "all" ]]; then
  SELECTED=(api core comms unified)
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

if [[ -z "$TLS_CERT_PATH" && -f cert.pem ]]; then
  export TLS_CERT_PATH="$(pwd)/cert.pem"
fi
if [[ -z "$TLS_KEY_PATH" && -f key.pem ]]; then
  export TLS_KEY_PATH="$(pwd)/key.pem"
fi

NAME_STR=$(IFS=','; echo "${NAMES[*]}")
npx concurrently -k -n "$NAME_STR" "${COMMANDS[@]}"

