#!/bin/bash

# Stop script on error
set -e

echo "🔨 Building Next.js 15 application for production..."
npm run build

echo "📦 Preparing output for upload..."
if [ -d "./out" ]; then
  rm -rf ./out
fi

# Export static files (if your app supports static export)
# If your app uses server-side features, this won't work and should be removed
# npm run export

# Create a release directory
RELEASE_DIR="./release"
RELEASE_FILENAME="nextjs-v15-release-$(date +%Y%m%d%H%M%S).zip"

# Create release directory if it doesn't exist
mkdir -p $RELEASE_DIR

# Copy necessary files for server deployment
echo "📂 Creating deployment package..."
cp -R .next package.json next.config.js public $RELEASE_DIR
cp -R node_modules $RELEASE_DIR 2>/dev/null || echo "⚠️ Warning: node_modules not copied (large directory)"

# Compress the release
echo "🗜️ Compressing deployment package..."
zip -r "$RELEASE_FILENAME" $RELEASE_DIR

echo "✅ Deployment package created: $RELEASE_FILENAME"
echo ""
echo "To deploy this Next.js 15 package:"
echo "1. Upload the zip file to your server"
echo "2. Unzip the package"
echo "3. Install dependencies (if node_modules was not included): npm install --production"
echo "4. Start the Next.js server: npm start"
echo ""
echo "Or use your preferred hosting platform deployment instructions" 