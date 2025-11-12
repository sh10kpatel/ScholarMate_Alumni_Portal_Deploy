# Railway Deployment Checklist

This checklist will help you verify that your ScholarMate Alumni Portal deployment is successful.

## Pre-Deployment Checklist

- [ ] Repository is pushed to GitHub
- [ ] All local changes are committed
- [ ] `.env` file is NOT committed (check .gitignore)
- [ ] `chatbot-config.js` is NOT committed (check .gitignore)
- [ ] Database schema is available in `server/schema.sql`

## Railway Setup Checklist

### 1. Create Railway Project
- [ ] Sign in to Railway at https://railway.app
- [ ] Create new project from GitHub repository
- [ ] Repository successfully connected

### 2. Add MySQL Database
- [ ] Click "New" → "Database" → "Add MySQL"
- [ ] MySQL database provisioned
- [ ] `DATABASE_URL` environment variable automatically set

### 3. Configure Service (Optional)
- [ ] Check environment variables in Railway dashboard
- [ ] `PORT` is automatically set by Railway
- [ ] `DATABASE_URL` is automatically set by MySQL service
- [ ] Optional: Add `NO_INMEM_FALLBACK=1` to require database

### 4. Initial Deployment
- [ ] Railway automatically detects Node.js app
- [ ] Build process completes successfully
- [ ] Deployment shows "Active" status
- [ ] Public URL is generated

## Post-Deployment Verification

### Test Your Deployment

Visit your Railway URL: `https://your-app-name.up.railway.app`

- [ ] **Login page loads** - You should see the IIIT NR Alumni Portal login page
- [ ] **Health endpoint works** - Visit `/health` and verify JSON response
- [ ] **API responds** - Visit `/api/alumni` and verify JSON array response
- [ ] **Static files load** - Check that images and CSS load correctly
- [ ] **Database connected** - Check Railway logs for "Connected to MySQL DB" message

### Test Core Features

- [ ] **Login functionality** works with test credentials
- [ ] **Profile viewing** works correctly
- [ ] **Alumni directory** displays properly
- [ ] **Announcements** page loads
- [ ] **Image uploads** work (if testing profile creation)

### Check Railway Logs

- [ ] No error messages in logs
- [ ] Database connection successful
- [ ] Server is listening on correct port
- [ ] Rate limiting is active

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
- Check Railway logs for error messages
- Verify `package.json` scripts are correct
- Ensure all dependencies are installed

#### 2. Database Connection Failed
- Verify MySQL service is running in Railway
- Check that `DATABASE_URL` is set
- Review connection logs in Railway dashboard

#### 3. Static Files Not Loading
- Check that files are committed to repository
- Verify server is serving static files (check server/index.js)
- Check browser console for 404 errors

#### 4. Port Binding Issues
- Railway automatically sets `PORT` - don't override it
- Ensure server listens on `process.env.PORT`

#### 5. CORS Errors
- Server has CORS enabled for all origins
- Check browser console for specific error messages
- Verify API_BASE detection in HTML files

### Railway Logs

To view logs in Railway:
1. Go to your project
2. Click on your service
3. Go to "Logs" tab
4. Filter by log level if needed

### Environment Variables

Verify these are set in Railway:
- `PORT` - Automatically set by Railway
- `DATABASE_URL` - Automatically set when MySQL is added
- `NO_INMEM_FALLBACK` - (Optional) Set to `1` to require database

## Database Setup

### Initial Data

If you need to load initial data into your Railway MySQL database:

1. Get database connection details from Railway
2. Connect using MySQL client:
   ```bash
   mysql -h <host> -u <user> -p<password> <database>
   ```
3. Run schema and seed data:
   ```sql
   SOURCE server/schema.sql;
   ```

### Backup and Restore

To backup your database:
```bash
mysqldump -h <host> -u <user> -p<password> <database> > backup.sql
```

To restore:
```bash
mysql -h <host> -u <user> -p<password> <database> < backup.sql
```

## Chatbot Configuration

To enable the AI chatbot in production:

1. Get a Gemini API key from https://makersuite.google.com/app/apikey
2. Copy `chatbot-config.example.js` to `chatbot-config.js`
3. Add your API key to `chatbot-config.js`
4. Commit and push `chatbot-config.js` (it's gitignored for security)
5. Or set it as an environment variable in Railway

**Note**: For production, consider implementing a backend proxy for the chatbot API key instead of client-side configuration.

## Performance Optimization

- [ ] Enable Railway's edge caching if needed
- [ ] Configure CDN for static assets (optional)
- [ ] Monitor database connection pool usage
- [ ] Review rate limiting settings if needed

## Security Checklist

- [ ] API keys are not exposed in client code
- [ ] Environment variables are properly set
- [ ] Rate limiting is active (check logs)
- [ ] HTTPS is enabled (automatic with Railway)
- [ ] Database credentials are secure

## Monitoring

Railway provides:
- Real-time logs
- Resource usage metrics
- Deployment history
- Error tracking

Monitor these regularly to ensure smooth operation.

## Need Help?

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project README: See main README.md
- Railway Deployment Guide: See RAILWAY_DEPLOYMENT.md

---

## Quick Test Commands

Once deployed, test with curl:

```bash
# Replace with your Railway URL
RAILWAY_URL="https://your-app-name.up.railway.app"

# Test health endpoint
curl $RAILWAY_URL/health

# Test API
curl $RAILWAY_URL/api/alumni

# Test login page
curl -I $RAILWAY_URL/
```

All endpoints should return 200 OK status.
