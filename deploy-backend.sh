#!/bin/bash
set -e

# Set variables
APP_NAME="destinpq-lms"
DB_NAME="psychology_lms"
FRONTEND_URL="https://destinpq-lms-frontend-6860e9083f5a.herokuapp.com"
SQL_DIR="."
SQL_FILES=(
  "truncate_all_except_users.sql"
  "clear_data_add_unboxing.sql"
  "add_course_content.sql"
  "add_detailed_course_data.sql"
  "add_unboxing_psychology_workshop.sql"
  "add_workshop_sessions.sql" 
  "add_course_homework.sql"
  "fix_module_ids.sql"
)

echo "=== Deploying backend to Heroku ==="

# Navigate to backend directory
cd backend

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
heroku config:set ZOOM_API_KEY=0KluAEmWRDqTod9bHgvMg --app $APP_NAME
heroku config:set ZOOM_API_SECRET=IaDadz70k565nXZ0v7Nj7HEPEkye02Si --app $APP_NAME
heroku config:set FRONTEND_URL=$FRONTEND_URL --app $APP_NAME

# Add PostgreSQL addon if it doesn't exist
if ! heroku addons:info --app $APP_NAME postgresql &> /dev/null; then
  echo "Adding PostgreSQL addon..."
  heroku addons:create heroku-postgresql:essential-0 --app $APP_NAME
fi

# Deploy to Heroku
echo "Deploying to Heroku..."
git init
git add .
git commit -m "Deploy to Heroku"
git push --force https://git.heroku.com/$APP_NAME.git HEAD:master

# Get the PostgreSQL connection URL
DB_URL=$(heroku config:get DATABASE_URL --app $APP_NAME)

# Upload SQL data to Heroku PostgreSQL
echo "=== Uploading SQL data to Heroku PostgreSQL ==="
cd ..

# Upload each SQL file in the correct order
for sql_file in "${SQL_FILES[@]}"; do
  if [ -f "$SQL_DIR/$sql_file" ]; then
    echo "Uploading $sql_file..."
    heroku pg:psql --app $APP_NAME < "$SQL_DIR/$sql_file"
  else
    echo "File $sql_file not found, skipping..."
  fi
done

echo "=== Deployment complete ==="
echo "Backend app running at: https://$APP_NAME.herokuapp.com"
echo "Database populated with all course and workshop data." 