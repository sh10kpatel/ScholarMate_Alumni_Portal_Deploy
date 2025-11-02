# IIIT NR Alumni Portal

A modern alumni portal with role-based authentication and MySQL database integration.

## Project Structure

```
alumni/
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

## Deployment Options

### 🚂 Railway Deployment (Recommended for Production)

For easy deployment to Railway with MySQL database:

**See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.**

Quick steps:
1. Fork/clone this repository
2. Create a new Railway project from your GitHub repo
3. Add MySQL database in Railway
4. Deploy automatically!

Railway handles environment variables, PORT, and DATABASE_URL automatically.

### 💻 Local Development

#### 1. Database Setup
First, create and seed the MySQL database:
```sql
SOURCE server/schema.sql;
```

Or use the SQLite fallback (no database setup required):
```bash
npm start
```

#### 2. Start Server
```bash
# Install dependencies (only needed once)
npm install

# Start the server
npm start
```

The server will:
- Listen on port 4000 (or PORT environment variable)
- Try to connect to MySQL (or fallback to SQLite)
- Serve all HTML files and API endpoints

#### 3. Open Portal
Open your browser to: `http://localhost:4000`

The login page will load automatically!

## Features

- **Role-based Login**: Alumni, Student, Administrator roles
- **MySQL Integration**: Persistent data storage with bcrypt password hashing
- **Responsive Design**: Modern UI with animations and smooth interactions
- **Profile Management**: View, create, and manage alumni profiles
- **Smart API Detection**: Automatically detects API URL (same origin in production, localhost in dev)
- **Offline Fallback**: Works with SQLite when MySQL is unavailable
- **Announcements System**: Post jobs, internships, events, and general announcements
- **AI Chatbot**: Integrated Gemini AI chatbot (requires API key)

## Environment Variables

### For Railway (Automatic)
- `PORT` - Set by Railway
- `DATABASE_URL` - Set by Railway when MySQL is added

### For Local Development
Create a `.env` file in the project root:
```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=alumni_db
```

Or use the provided `.env.example` as a template.

## Default Users (from schema.sql)

- **Alumni**: `aarav` / `pass1234`
- **Student**: `ananya` / `pass1234`  
- **Admin**: `rohan` / `pass1234`

## API Endpoints

- `GET /` - Serve login page
- `GET /api/health` - Health check
- `GET /api/alumni` - List all alumni
- `GET /api/alumni/:id` - Get specific alumni
- `POST /api/alumni` - Create alumni profile
- `PUT /api/alumni/:id` - Update alumni profile
- `DELETE /api/alumni/:id` - Delete alumni profile
- `POST /api/login` - Authenticate user with role
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `GET /api/export` - Export alumni data

## Chatbot Setup

1. Copy `chatbot-config.example.js` to `chatbot-config.js`
2. Get a free Gemini API key from https://makersuite.google.com/app/apikey
3. Add your API key to `chatbot-config.js`

**Note**: The chatbot-config.js file is gitignored for security.

## Browser Support

Works in all modern browsers. Requires JavaScript enabled.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is private and proprietary.