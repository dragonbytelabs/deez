#!/usr/bin/env bash
set -euo pipefail

# Deploy the app on fly.io

cd "$(dirname "$0")/.."

echo "=== Deploying to fly.io ==="
fly deploy
