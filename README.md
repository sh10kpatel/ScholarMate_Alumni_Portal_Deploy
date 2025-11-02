# IIIT NR Alumni Portal

A modern alumni portal with role-based authentication and MySQL database integration.

## Project Structure

```
alumini/
├── images/              # Static images (logos, backgrounds)
├── loginfinal.html      # Login page with role selection
├── mainad.html          # Administrator dashboard
├── mainalu.html         # Alumni portal
├── mainst.html          # Student portal
└── server/              # Backend API
    ├── src/
    │   └── index.js     # Main server with Express + MySQL
    ├── schema.sql       # Database schema
    ├── package.json     # Server dependencies
    └── uploads/         # File uploads
```

## Quick Start

### 1. Database Setup
First, create and seed the MySQL database:
```sql
SOURCE server/schema.sql;
```

### 2. Start Server
```powershell
cd server
npm install
$env:PORT=4100
$env:DB_HOST="127.0.0.1"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="alumni_db"
npm start
```

### 3. Open Portal
Open `loginfinal.html?apiBase=http://127.0.0.1:4100` in your browser.

## Features

- **Role-based Login**: Alumni, Student, Administrator roles
- **MySQL Integration**: Persistent data storage with bcrypt password hashing
- **Responsive Design**: Modern UI with animations and smooth interactions
- **Profile Management**: View, create, and manage alumni profiles
- **Offline Fallback**: Works even when API is unreachable

## Default Users (from schema.sql)

- **Alumni**: `aarav` / `pass1234`
- **Student**: `ananya` / `pass1234`  
- **Admin**: `rohan` / `pass1234`

## API Endpoints

- `GET /api/alumni` - List all alumni
- `POST /api/login` - Authenticate user with role
- `DELETE /api/alumni/:id` - Remove alumni profile
- `GET /api/health` - Health check

## Browser Support

Works in all modern browsers. Requires JavaScript enabled.