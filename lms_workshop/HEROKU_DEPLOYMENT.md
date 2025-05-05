# Heroku Deployment Guide for LMS Workshop

This guide covers the deployment of the LMS Workshop application (both backend and frontend) to Heroku.

## Prerequisites

- A Heroku account
- Heroku CLI installed on your machine
- Git repositories for backend and frontend

## Backend Deployment Steps

1. **Create a Heroku app for the backend**

   ```bash
   # Navigate to the backend directory
   cd lms_workshop/backend

   # Login to Heroku
   heroku login

   # Create a Heroku app
   heroku create your-backend-app-name
   ```

2. **Add PostgreSQL add-on**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set environment variables**

   ```bash
   # Set JWT secret
   heroku config:set JWT_SECRET=your_secure_jwt_secret

   # Set CORS settings to allow your frontend app
   heroku config:set APP_CORS_ALLOW_ORIGINS=https://your-frontend-app-name.herokuapp.com

   # Set Node environment
   heroku config:set NODE_ENV=production
   ```

4. **Push to Heroku**

   ```bash
   # Add Heroku remote if not added automatically
   heroku git:remote -a your-backend-app-name

   # Push to Heroku
   git push heroku main
   ```

## Frontend Deployment Steps

1. **Create a Heroku app for the frontend**

   ```bash
   # Navigate to the frontend directory
   cd lms_workshop/frontend

   # Create a Heroku app
   heroku create your-frontend-app-name
   ```

2. **Set environment variables**

   ```bash
   # Set API URL to point to your backend
   heroku config:set NEXT_PUBLIC_API_URL=https://your-backend-app-name.herokuapp.com

   # Set Node environment
   heroku config:set NODE_ENV=production
   ```

3. **Push to Heroku**

   ```bash
   # Add Heroku remote
   heroku git:remote -a your-frontend-app-name

   # Push to Heroku
   git push heroku main
   ```

## Troubleshooting

1. **Database connection issues**
   - Check your DATABASE_URL configuration
   - Make sure SSL is properly configured in typeorm.config.ts

2. **CORS errors**
   - Verify that APP_CORS_ALLOW_ORIGINS includes your frontend URL
   - Check that auth controller has proper CORS handlers for OPTIONS requests

3. **Build errors**
   - If Heroku can't detect the buildpack, specify it manually:
     ```bash
     heroku buildpacks:set heroku/nodejs
     ```

4. **Frontend can't connect to backend**
   - Verify NEXT_PUBLIC_API_URL is set correctly
   - Check network requests in browser console

## Checking logs

To check logs for any issues:

```bash
heroku logs --tail -a your-app-name
```

## Database Management

To connect to the PostgreSQL database:

```bash
heroku pg:psql -a your-backend-app-name
```

## Additional Resources

- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Heroku PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Deploying Node.js Apps on Heroku](https://devcenter.heroku.com/articles/deploying-nodejs) 