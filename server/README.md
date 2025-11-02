Alumni API - Local development

This README explains how to start the API and test it locally. Follow these steps to avoid the common "Cannot POST /api/alumni/full" and "Failed to fetch" errors.

Prerequisites
- Node.js installed (v14+ recommended)
- MySQL running and accessible (credentials are read from `server/.env`)
- `npx` available (comes with npm)

Quick start (recommended)

1. Open PowerShell and stop any old node processes:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

2. Start the API server (from the `server/` folder):

```powershell
cd server
node index.js
```

You should see: `Alumni API running on http://localhost:4100`

3. Serve the frontend (project root) on a different port (3000):

```powershell
cd ..
npx http-server -p 3000
```

4. Open the UI: `http://localhost:3000/mainad.html` and `http://localhost:3000/create_profile.html`.

Notes and troubleshooting
- Always run the API and the static server on different ports. If you run the static server on the same port as the API you will see `Cannot POST /api/alumni/full` because the static server does not implement the API routes.
- If the client shows "Cannot reach API" or "Failed to fetch", check `server/index.js` logs and confirm the API process is running and listening on the expected port.
- Use `http://localhost:4100/health` to confirm the API is alive.
- If MySQL is not configured or credentials differ, update `server/.env`.

If you'd like, you can run the helper script `start-dev.ps1` from the project root which automates these steps.

Using Docker for MySQL (optional)

If MySQL isn't installed on Windows, you can run a local MySQL container via docker-compose. From the `server/` folder run:

```powershell
.\start-db.ps1
```

This will start a MySQL 8 container with root password `mysql` and create the `alumni_db` database. After the container is healthy, start the API with:

```powershell
cd server
$env:NO_INMEM_FALLBACK = '1'
node index.js
```
Alumni Server (MySQL)
=====================

This is a small Express server that stores alumni records in MySQL and exposes a few endpoints.

Setup
-----

1. Create a MySQL database (example):

   CREATE DATABASE alumni_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

2. Configure environment variables in a `.env` file at `server/.env`:

   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=alumni_db
   PORT=4000

3. Install dependencies and start the server:

   cd server
   npm install
   npm start

The server will create the `alumni` table automatically if it doesn't exist.

API
---
- GET /api/alumni -> list alumni
- POST /api/alumni -> add an alumni (JSON body with name, branch, batch, company, description, image)
- DELETE /api/alumni/:id -> delete an alumni by id
- GET /api/export -> download all alumni as JSON

Extended API
-------------
- POST /api/alumni/full -> create a full profile. JSON fields supported:
   - name (required)
   - role (alumni|student)
   - login_id
   - password (plain text; server will hash)
   - branch, batch, company, current_place, education, experience, certificates, description, image

