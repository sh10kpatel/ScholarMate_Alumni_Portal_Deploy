# Railway Deployment Guide

This guide will help you deploy the ScholarMate Alumni Portal to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. A GitHub account with this repository

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select this repository: `ScholarMate_Alumni_Portal_Deploy`
4. Railway will automatically detect the Node.js app and start building

### 2. Add MySQL Database

1. In your Railway project, click "New" → "Database" → "Add MySQL"
2. Railway will automatically provision a MySQL database and set the `DATABASE_URL` environment variable

### 3. Configure Environment Variables (Optional)

Railway automatically sets `DATABASE_URL` and `PORT`. You can add additional variables if needed:

- `NO_INMEM_FALLBACK=1` - Disable in-memory fallback (recommended for production)

To add environment variables:
1. Click on your service in Railway
2. Go to "Variables" tab
3. Add your environment variables

### 4. Deploy

Railway will automatically deploy your app when you push to your GitHub repository.

After deployment:
- Your app will be available at: `https://your-app-name.up.railway.app`
- The login page will load automatically at the root URL
- All API endpoints will be available at `/api/*`

## Environment Variables

The app supports these environment variables:

### Automatic (Set by Railway)
- `PORT` - Port the server listens on (Railway sets this automatically)
- `DATABASE_URL` - MySQL connection URL (Railway sets this when you add MySQL)

### Optional Configuration
- `DB_HOST` - MySQL host (not needed if using DATABASE_URL)
- `DB_USER` - MySQL user (not needed if using DATABASE_URL)
- `DB_PASSWORD` - MySQL password (not needed if using DATABASE_URL)
- `DB_NAME` - Database name (not needed if using DATABASE_URL)
- `NO_INMEM_FALLBACK` - Set to `1` to require database (no fallback)

## Testing Your Deployment

1. Visit your Railway app URL: `https://your-app-name.up.railway.app`
2. You should see the login page
3. Test the API health endpoint: `https://your-app-name.up.railway.app/health`
4. Try logging in with a test account

## Troubleshooting

### Database Connection Issues

If you see "MySQL unavailable" in the logs:
1. Ensure MySQL database is added to your Railway project
2. Check that `DATABASE_URL` is set in environment variables
3. Check the logs for detailed error messages

### Port Binding Issues

Railway automatically sets the `PORT` environment variable. The app is configured to use this automatically.

### Static Files Not Loading

The server is configured to serve static files (HTML, CSS, JS, images) from the root directory. If files aren't loading:
1. Check the Railway logs for errors
2. Ensure all files are committed to the repository

## Local Development with Railway Database

To connect to your Railway MySQL database locally:

1. Get your DATABASE_URL from Railway:
   - Go to your MySQL database in Railway
   - Copy the `DATABASE_URL` from the "Connect" tab

2. Create a `.env` file in the project root:
   ```
   DATABASE_URL=mysql://user:password@host:port/database
   ```

3. Run the app locally:
   ```bash
   npm start
   ```

## Support

For Railway-specific issues, consult:
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

For app-specific issues, check the main README.md
