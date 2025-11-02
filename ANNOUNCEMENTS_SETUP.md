# Announcements System Setup Guide

## Overview
The announcements system allows alumni to post and view job opportunities, internships, events, and general announcements. All data is stored in the MySQL database in the `announcements` table.

## Database Schema
The `announcements` table includes:
- `id` - Auto-incrementing primary key
- `title` - Announcement title (required)
- `type` - Type: 'job', 'internship', 'event', or 'general' (default: 'general')
- `company` - Company or organization name (optional)
- `location` - Location of the opportunity (optional)
- `description` - Full description (required)
- `requirements` - Job/internship requirements (optional)
- `application_link` - URL to apply (optional)
- `posted_by` - Foreign key to alumni.id (required)
- `posted_by_name` - Name of the poster (auto-populated)
- `created_at` - Timestamp of creation (auto)
- `expires_at` - Optional expiration date (optional)
- `is_active` - Boolean flag to mark active/inactive (default: true)

## Setup Instructions

### 1. Start the MySQL Database
```powershell
cd server
.\start-db.ps1
```

### 2. Initialize the Database Schema
If this is your first time, the schema will be created automatically when the server starts. The `announcements` table will be created along with the `alumni` table.

### 3. Start the Backend Server
```powershell
cd server
node index.js
```

Or use the convenience script:
```powershell
.\start-server-with-mysql.ps1
```

The server will:
- Connect to MySQL
- Create the `announcements` table if it doesn't exist
- Start listening on port 4000 (or next available port)

### 4. Open the Announcements Page
Open `announcements.html` in your browser or use the navigation from the main alumni portal.

## Features

### For All Users
- **View Announcements**: Browse all active job postings, internships, events, and general announcements
- **Filter by Type**: Use the dropdown to filter by announcement type
- **See Details**: View full description, requirements, company, location, and application links

### For Logged-in Alumni
- **Post Announcements**: Click "Post Announcement" to create a new announcement
- **Delete Own Posts**: Delete announcements you created (or any if you're an admin)

### Admin Features
- Admins can delete any announcement
- Future enhancement: Mark announcements as inactive instead of deleting

## API Endpoints

### GET /api/announcements
Fetch all active announcements (sorted by newest first)
- Query param: `includeInactive=true` to include expired/inactive announcements

### GET /api/announcements/:id
Fetch a single announcement by ID

### POST /api/announcements
Create a new announcement
```json
{
  "title": "Software Engineer Opening",
  "type": "job",
  "company": "Google",
  "location": "Bangalore, India",
  "description": "We are hiring...",
  "requirements": "3+ years experience...",
  "application_link": "https://...",
  "posted_by": 1,
  "expires_at": "2025-12-31T23:59:59"
}
```

### PUT /api/announcements/:id
Update an existing announcement (same fields as POST)

### DELETE /api/announcements/:id
Delete an announcement

## Troubleshooting

### "Failed to load announcements" Error
1. Ensure MySQL server is running: `.\start-db.ps1` in the server folder
2. Check that the backend server is running on port 4000
3. Check browser console for API errors

### Cannot Post Announcements
1. Make sure you're logged in (check sessionStorage for 'alumni_login_id')
2. Verify your user ID exists in the alumni table
3. Check browser console for any JavaScript errors

### Database Connection Issues
If you see "MySQL unavailable" in the server logs:
1. Restart the MySQL Docker container
2. Check Docker is running: `docker ps`
3. Try restarting Docker Desktop

## Testing

### Test Creating an Announcement
1. Log in as an alumni user (e.g., "aarav" / "pass1234")
2. Click "Post Announcement" button
3. Fill in the form:
   - Title: "Test Job Posting"
   - Type: "Job"
   - Company: "Test Company"
   - Location: "Remote"
   - Description: "This is a test announcement"
4. Click "Post Announcement"
5. The new announcement should appear at the top of the list

### Test Filtering
1. Create announcements of different types (job, internship, event)
2. Use the type filter dropdown
3. Verify only matching types are shown

### Test Deletion
1. Create an announcement
2. Click the trash icon on your announcement
3. Confirm deletion
4. Verify it's removed from the list

## File Structure
- `announcements.html` - Frontend UI for viewing and creating announcements
- `server/index.js` - Backend API with announcement endpoints
- `server/schema.sql` - Database schema including announcements table
- `server/db.js` - MySQL connection configuration

## Notes
- The `posted_by_name` field is automatically populated from the alumni table when creating an announcement
- Expired announcements (past `expires_at` date) are not shown by default
- The system supports image avatars for announcement posters (pulled from alumni.image)
- All times are stored in UTC in the database
