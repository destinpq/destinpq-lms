# Deployment Guide for LMS Workshop

This guide covers the deployment of the LMS Workshop application to DigitalOcean App Platform.

## Prerequisites

- A DigitalOcean account
- The DigitalOcean CLI installed (`doctl`)
- Git repository linked to DigitalOcean

## Local Testing

Before deploying to DigitalOcean, test the application locally with the `/lms` basePath:

```bash
# Navigate to the frontend directory
cd frontend

# Start the development server on port 4000
PORT=4000 npm run dev

# Build the application
npm run build

# Start the production server
PORT=4000 npm run start
```

The application should be accessible at http://localhost:4000/lms

## Deploying to DigitalOcean

1. **Create App from the App Platform Dashboard**

   Use the `.do/app.yaml` configuration file to create a new application.

   ```bash
   doctl apps create --spec .do/app.yaml
   ```

   Or create manually through the DigitalOcean dashboard.

2. **Environment Variables**

   Ensure the following environment variables are set:

   **Frontend:**
   - `NODE_ENV=production`
   - `API_URL=https://drakanksha.co/lms/api`
   - `NEXT_PUBLIC_BASE_PATH=/lms`

   **Backend:**
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from Database)
   - `JWT_SECRET` (generate a secure random string)
   - `COOKIE_SECRET` (generate a secure random string)

3. **Database Setup**

   The DigitalOcean App Platform will provision a PostgreSQL database. After creation:

   - Run the database migration scripts to set up the schema
   - Load initial data if required

4. **Verify Deployment**

   After deployment, verify the application is working correctly by:

   - Visiting https://drakanksha.co/lms
   - Checking the health endpoint at https://drakanksha.co/lms/api/health
   - Testing user authentication
   - Ensuring the workshop pages load correctly

## Troubleshooting

- **404 Errors**: Make sure the basePath is correctly set to `/lms` in next.config.js
- **API Connection Issues**: Verify the API_URL is correctly set
- **Database Errors**: Check database connection parameters and run migrations

## Maintenance

- **Updating the Application**:
  Push changes to the GitHub repository. DigitalOcean will automatically deploy updates.

- **Scaling**:
  Adjust the instance count and size in the DigitalOcean App Platform dashboard as needed.

- **Monitoring**:
  Use DigitalOcean's built-in monitoring, or integrate with an external service.

## Backup & Recovery

- Regular database backups are recommended
- The application code is version controlled through Git
- Environment variables should be documented and securely stored 