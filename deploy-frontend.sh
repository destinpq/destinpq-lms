#!/bin/bash
set -e

# Set variables
APP_NAME="destinpq-lms-frontend"
BACKEND_URL="https://destinpq-lms-63d26b382b63.herokuapp.com/lms"

echo "=== Deploying frontend to Heroku ==="

# Navigate to frontend directory
cd frontend

# Login to Heroku (if not already logged in)
heroku auth:whoami || heroku login

# Check if app exists, create if it doesn't
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
  echo "Creating app $APP_NAME..."
  heroku apps:create $APP_NAME
fi

# Set environment variables
echo "Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set NEXT_PUBLIC_API_URL=$BACKEND_URL --app $APP_NAME
heroku config:set NEXT_PUBLIC_ZOOM_SDK_KEY=0KluAEmWRDqTod9bHgvMg --app $APP_NAME

# Deploy to Heroku
echo "Deploying to Heroku..."
git init
git add .
git commit -m "Deploy to Heroku"
git push --force https://git.heroku.com/$APP_NAME.git HEAD:master

echo "=== Deployment complete ==="
echo "Frontend app running at: https://$APP_NAME.herokuapp.com" 