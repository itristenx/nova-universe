#!/bin/bash

# Run root node:test suite and all workspace tests.

node --test
ROOT_EXIT=$?

pnpm -r --if-present test
WORKSPACE_EXIT=$?

if [ $ROOT_EXIT -ne 0 ] || [ $WORKSPACE_EXIT -ne 0 ]; then
  exit 1
fi
