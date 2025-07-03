#!/usr/bin/env bash
set -e

declare -A DIRS=(
  [api]="cueit-api"
  [admin]="cueit-admin"
  [activate]="cueit-activate"
  [slack]="cueit-slack"
)
declare -A CMDS=(
  [api]="node cueit-api/index.js"
  [admin]="npm --prefix cueit-admin run dev"
  [activate]="npm --prefix cueit-activate run dev"
  [slack]="node cueit-slack/index.js"
)

read -rp "Apps to start (api,admin,activate,slack or all) [all]: " INPUT
if [[ -z "$INPUT" || "$INPUT" == "all" ]]; then
  SELECTED=(api admin activate slack)
else
  IFS=',' read -ra SELECTED <<< "$INPUT"
fi

NAMES=()
COMMANDS=()
for APP in "${SELECTED[@]}"; do
  DIR=${DIRS[$APP]}
  CMD=${CMDS[$APP]}
  if [[ -z $DIR || -z $CMD ]]; then
    echo "Unknown app: $APP" >&2
    exit 1
  fi
  if [[ ! -f $DIR/.env ]]; then
    echo "Error: $DIR/.env not found. Copy $DIR/.env.example first." >&2
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

