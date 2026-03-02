#!/usr/bin/env bash
# Fix index.tsx: remove comma and bad comment from import line.
# Run on server: cd /var/www/quickcash-full/frontend/tenant-portal && bash fix-index-tsx.sh

set -e
FILE="src/index.tsx"
if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found"
  exit 1
fi
# Fix: import './css-overrides.css', //with 's'  ->  import './css-overrides.css';
sed -i.bak "s|import './css-overrides.css', //with 's'|import './css-overrides.css';|" "$FILE"
# Also fix if duplicated/typo: ensure only one correct import of css-overrides
echo "Fixed. Run: npm run build"
