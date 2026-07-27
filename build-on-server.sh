#!/usr/bin/env bash .
# Run on the server to install deps and build the tenant-portal.
# Usage: cd /var/www/quickcash-full/frontend/tenant-portal && bash build-on-server.sh

set -e
cd "$(dirname "$0")"

echo "Installing dependencies (npm install --legacy-peer-deps)..."
npm install --legacy-peer-deps

echo "Building (npm run build)..."
npm run build

echo "Done. Deploy the 'build' folder to your web root (e.g. static files for port 3002)."
