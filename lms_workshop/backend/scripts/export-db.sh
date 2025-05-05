#!/bin/bash

# Export DB Script
# This script compiles and runs the database export utility

# Default export format
FORMAT="sql"

# Parse command line arguments
while getopts "j" opt; do
  case $opt in
    j)
      FORMAT="json"
      ;;
    *)
      echo "Usage: $0 [-j]"
      echo "  -j: Export as JSON (default is SQL)"
      exit 1
      ;;
  esac
done

echo "🚀 Starting database export process..."

# Change directory to the backend root
cd "$(dirname "$0")/.." || exit

# Compile TypeScript code
echo "🔨 Compiling TypeScript..."
npm run build

# Run the database export
echo "📦 Running database export utility in $FORMAT format..."
if [ "$FORMAT" == "json" ]; then
  node dist/scripts/db-export-json.js
else
  node dist/scripts/db-export.js
fi

echo "✨ Database export process completed!" 