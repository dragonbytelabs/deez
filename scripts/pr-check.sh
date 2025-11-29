#!/usr/bin/env bash
set -euo pipefail

# Run front-end and back-end tests

cd "$(dirname "$0")/.."

echo "=== Running back-end tests ==="
go test ./...

echo ""
echo "=== Running front-end tests ==="
cd web
npm ci
npm run test
