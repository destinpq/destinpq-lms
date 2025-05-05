#!/bin/bash

# Deploy both backend and frontend to Heroku
# Usage: ./deploy-to-heroku.sh backend-app-name frontend-app-name

# Check if app names are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 backend-app-name frontend-app-name"
  exit 1
fi

BACKEND_APP=$1
FRONTEND_APP=$2
CURRENT_DIR=$(pwd)

echo "======================================================"
echo "📦 Deploying LMS Workshop to Heroku"
echo "Backend app: $BACKEND_APP"
echo "Frontend app: $FRONTEND_APP"
echo "======================================================"

# Deploy backend
echo "📡 Deploying backend..."
cd "$CURRENT_DIR/backend"

# Check if Heroku app exists, create if not
if ! heroku apps:info -a "$BACKEND_APP" &> /dev/null; then
  echo "Creating Heroku app for backend: $BACKEND_APP"
  heroku create "$BACKEND_APP"
else
  echo "Using existing Heroku app for backend: $BACKEND_APP"
fi

# Add PostgreSQL addon if not already added
if ! heroku addons:info -a "$BACKEND_APP" postgresql &> /dev/null; then
  echo "Adding PostgreSQL addon to backend"
  heroku addons:create -a "$BACKEND_APP" heroku-postgresql:mini
else
  echo "PostgreSQL addon already exists"
fi

# Set backend environment variables
echo "Setting environment variables for backend"
heroku config:set -a "$BACKEND_APP" NODE_ENV=production
heroku config:set -a "$BACKEND_APP" APP_CORS_ALLOW_ORIGINS="https://$FRONTEND_APP.herokuapp.com"
heroku config:set -a "$BACKEND_APP" JWT_SECRET=$(openssl rand -base64 32)

# Set buildpack if not detected
heroku buildpacks:set -a "$BACKEND_APP" heroku/nodejs

# Push backend to Heroku
git push https://git.heroku.com/"$BACKEND_APP".git HEAD:main

# Deploy frontend
echo "📱 Deploying frontend..."
cd "$CURRENT_DIR/frontend"

# Check if Heroku app exists, create if not
if ! heroku apps:info -a "$FRONTEND_APP" &> /dev/null; then
  echo "Creating Heroku app for frontend: $FRONTEND_APP"
  heroku create "$FRONTEND_APP"
else
  echo "Using existing Heroku app for frontend: $FRONTEND_APP"
fi

# Set frontend environment variables
echo "Setting environment variables for frontend"
heroku config:set -a "$FRONTEND_APP" NODE_ENV=production
heroku config:set -a "$FRONTEND_APP" NEXT_PUBLIC_API_URL="https://$BACKEND_APP.herokuapp.com"

# Set buildpack if not detected
heroku buildpacks:set -a "$FRONTEND_APP" heroku/nodejs

# Push frontend to Heroku
git push https://git.heroku.com/"$FRONTEND_APP".git HEAD:main

echo "======================================================"
echo "✅ Deployment complete!"
echo "Backend URL: https://$BACKEND_APP.herokuapp.com"
echo "Frontend URL: https://$FRONTEND_APP.herokuapp.com"
echo "======================================================"

# Return to original directory
cd "$CURRENT_DIR" 