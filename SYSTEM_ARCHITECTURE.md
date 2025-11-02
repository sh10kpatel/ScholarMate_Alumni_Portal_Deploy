# System Architecture Diagram - Alumni Portal

## � Business Logic Description

The Alumni Portal implements a role-based workflow where users authenticate via login credentials (validated against BCrypt-hashed passwords in MySQL). Upon successful authentication, users are routed to role-specific dashboards (Student/Alumni/Admin) with differentiated permissions. Alumni can create and manage their profiles, upload images via Multer middleware, and post job/internship announcements. The system employs dynamic filtering that extracts unique values (branches, batches, companies) from the database and populates dropdown menus in real-time, ensuring filters always reflect current data. When users interact with profiles or announcements, RESTful API calls trigger Express.js routes that execute parameterized SQL queries, preventing injection attacks. The three-tier database failover (MySQL → SQLite → In-Memory) ensures continuous operation during outages. Profile updates undergo validation, image processing, and database commits before confirming success. The AI chatbot integrates Gemini API for context-aware assistance, while all data transactions maintain ACID compliance through MySQL's transactional integrity, ensuring reliable alumni network management and opportunity sharing.

---

## 🎯 Key Features Implemented

### Core Functionality
- ✅ **Role-Based Access Control** - Three-tier user system (Student, Alumni, Admin) with differentiated permissions
- ✅ **Secure Authentication** - BCrypt password hashing with session-based login/logout
- ✅ **Profile Management** - Complete CRUD operations for alumni profiles with image upload support
- ✅ **Job/Internship Board** - Announcement system for posting and browsing opportunities with expiration dates
- ✅ **Dynamic Filtering** - Auto-populated filters (branch, batch, company) synced with database content
- ✅ **Real-Time Search** - Instant search functionality across alumni profiles

### Technical Features
- ✅ **RESTful API Architecture** - Express.js backend with 15+ API endpoints
- ✅ **Three-Tier Database Failover** - MySQL → SQLite → In-Memory for high availability
- ✅ **Auto Port Detection** - Automatically finds available ports (4000-4003) to prevent conflicts
- ✅ **File Upload System** - Multer-based image handling with size validation
- ✅ **Docker Integration** - Containerized MySQL deployment for consistent environment
- ✅ **Connection Pooling** - Optimized database connections for better performance

### Security Features
- ✅ **SQL Injection Prevention** - Parameterized queries throughout the application
- ✅ **CORS Protection** - Cross-origin request filtering for secure API access
- ✅ **Input Validation** - Frontend and backend validation for all user inputs
- ✅ **Password Security** - 10-round BCrypt hashing with salt
- ✅ **Session Management** - Secure client-side session storage

### User Experience
- ✅ **Responsive Design** - Mobile-friendly interface with adaptive layouts
- ✅ **AI Chatbot Integration** - Google Gemini-powered assistant for user queries
- ✅ **Visual Status Indicators** - Real-time API connection status display
- ✅ **Animated UI Elements** - Smooth transitions and hover effects
- ✅ **Error Handling** - User-friendly error messages with detailed console logging

### Administrative Features
- ✅ **Admin Dashboard** - Full CRUD access to all profiles with delete mode
- ✅ **Profile Analytics** - Dashboard for viewing alumni statistics
- ✅ **Data Export** - JSON export functionality for backup/analysis
- ✅ **Bulk Operations** - Delete multiple profiles in admin mode

### Automation & DevOps
- ✅ **PowerShell Automation** - Scripts for database setup and server startup
- ✅ **Health Monitoring** - `/health` endpoint for system status checks
- ✅ **Request Logging** - Comprehensive logging of all API requests
- ✅ **Auto-Reconnection** - Automatic database reconnection on failure

---

## 🔧 Challenges Faced & Solutions

### 1. Port Conflicts During Development
**Challenge:** Backend server frequently failed to start due to port 4000 already being in use by previous instances or other applications, causing "Failed to fetch" errors in the frontend.

**Solution:** Implemented auto-detection logic that tries ports 4000-4003 sequentially, automatically binding to the first available port. Added retry mechanism with port increment on failure, ensuring the server always starts successfully.

### 2. Dynamic Filter Synchronization
**Challenge:** Filter dropdowns (branch, batch, company) showed hardcoded values that became outdated when new data was added to the database, creating inconsistency between filters and actual data.

**Solution:** Developed `populateFilters()` function that dynamically extracts unique values from the database on page load, automatically populating dropdowns with current data. Filters now always reflect the actual database state without manual updates.

### 3. Database Reliability & Failover
**Challenge:** Application became completely non-functional when MySQL container stopped or connection failed, preventing users from accessing any features during database outages.

**Solution:** Designed three-tier failover system (MySQL → SQLite → In-Memory) with automatic detection and graceful degradation. System continues operating with reduced functionality during outages, maintaining user experience even when primary database is unavailable.

---

## �📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Browser)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Student    │  │   Alumni     │  │    Admin     │  │   Guest      │   │
│  │   Portal     │  │   Portal     │  │   Portal     │  │   Login      │   │
│  │ mainst.html  │  │mainalu.html  │  │ mainad.html  │  │loginfinal.html│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │                  │            │
│         └──────────────────┼──────────────────┼──────────────────┘            │
│                            │                  │                               │
│  ┌─────────────────────────┴──────────────────┴─────────────────────────┐   │
│  │                    Shared Frontend Pages                              │   │
│  │  • announcements.html (Job/Internship Board)                         │   │
│  │  • profile.html (View/Edit Profile)                                  │   │
│  │  • create_profile.html (New Profile Registration)                    │   │
│  │  • dashboard.html (Analytics Dashboard)                              │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                    AI Chatbot Integration                             │   │
│  │  • chatbot.js (Gemini AI Integration)                                │   │
│  │  • chatbot.css (Styling)                                             │   │
│  │  • chatbot-config.js (Configuration)                                 │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS (REST API)
                                    │ Port: 4000-4003 (Auto-detect)
                                    │
┌───────────────────────────────────▼───────────────────────────────────────────┐
│                          APPLICATION LAYER (Backend)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                     Node.js + Express Server                          │   │
│  │                       (server/index.js)                               │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    API Endpoints                                │ │   │
│  │  │                                                                 │ │   │
│  │  │  Alumni Management:                                             │ │   │
│  │  │  • GET    /api/alumni          - List all alumni               │ │   │
│  │  │  • GET    /api/alumni/:id      - Get single profile            │ │   │
│  │  │  • POST   /api/alumni          - Create profile                │ │   │
│  │  │  • POST   /api/alumni/full     - Create with image upload      │ │   │
│  │  │  • PUT    /api/alumni/:id      - Update profile                │ │   │
│  │  │  • PUT    /api/alumni/:id/full - Update with image             │ │   │
│  │  │  • DELETE /api/alumni/:id      - Delete profile                │ │   │
│  │  │                                                                 │ │   │
│  │  │  Announcements:                                                 │ │   │
│  │  │  • GET    /api/announcements        - List announcements       │ │   │
│  │  │  • GET    /api/announcements/:id    - Get single               │ │   │
│  │  │  • POST   /api/announcements        - Create announcement      │ │   │
│  │  │  • PUT    /api/announcements/:id    - Update announcement      │ │   │
│  │  │  • DELETE /api/announcements/:id    - Delete announcement      │ │   │
│  │  │                                                                 │ │   │
│  │  │  Authentication:                                                │ │   │
│  │  │  • POST   /api/login          - User login                     │ │   │
│  │  │                                                                 │ │   │
│  │  │  Utility:                                                       │ │   │
│  │  │  • GET    /health              - Health check                  │ │   │
│  │  │  • GET    /api/export          - Export data (JSON)            │ │   │
│  │  │  • GET    /uploads/:filename   - Serve uploaded images         │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Middleware Stack                             │ │   │
│  │  │  • CORS (Cross-Origin Resource Sharing)                        │ │   │
│  │  │  • Body Parser (JSON)                                          │ │   │
│  │  │  • Multer (File Upload Handler)                                │ │   │
│  │  │  • BCrypt (Password Hashing)                                   │ │   │
│  │  │  • Request Logger                                              │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                Database Connection Layer                        │ │   │
│  │  │  • MySQL Pool (mysql2/promise) - Primary                       │ │   │
│  │  │  • SQLite Fallback (sqlite3) - Secondary                       │ │   │
│  │  │  • In-Memory Store - Tertiary                                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└───────────────────────────────────┬───────────────────────────────────────────┘
                                    │
                                    │ MySQL Protocol
                                    │ Port: 3306
                                    │
┌───────────────────────────────────▼───────────────────────────────────────────┐
│                           DATA LAYER (Database)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                    MySQL Database (Docker)                            │   │
│  │                      Database: alumni_db                              │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                      Tables Schema                              │ │   │
│  │  │                                                                 │ │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │ │   │
│  │  │  │  alumni (Primary Table)                                  │  │ │   │
│  │  │  │  ├─ id (PK, AUTO_INCREMENT)                              │  │ │   │
│  │  │  │  ├─ name (VARCHAR 255)                                   │  │ │   │
│  │  │  │  ├─ role (ENUM: alumni/student/admin)                    │  │ │   │
│  │  │  │  ├─ login_id (VARCHAR 128, UNIQUE)                       │  │ │   │
│  │  │  │  ├─ password_hash (VARCHAR 512)                          │  │ │   │
│  │  │  │  ├─ branch (VARCHAR 64)                                  │  │ │   │
│  │  │  │  ├─ batch (VARCHAR 32)                                   │  │ │   │
│  │  │  │  ├─ company (VARCHAR 128)                                │  │ │   │
│  │  │  │  ├─ current_place (VARCHAR 128)                          │  │ │   │
│  │  │  │  ├─ education (VARCHAR 128)                              │  │ │   │
│  │  │  │  ├─ experience (TEXT)                                    │  │ │   │
│  │  │  │  ├─ certificates (TEXT)                                  │  │ │   │
│  │  │  │  ├─ description (TEXT)                                   │  │ │   │
│  │  │  │  ├─ image (TEXT)                                         │  │ │   │
│  │  │  │  ├─ phone (VARCHAR 64)                                   │  │ │   │
│  │  │  │  ├─ email (VARCHAR 255)                                  │  │ │   │
│  │  │  │  └─ contactno (VARCHAR 64)                               │  │ │   │
│  │  │  └──────────────────────────────────────────────────────────┘  │ │   │
│  │  │                                                                 │ │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │ │   │
│  │  │  │  announcements (Job/Internship Board)                    │  │ │   │
│  │  │  │  ├─ id (PK, AUTO_INCREMENT)                              │  │ │   │
│  │  │  │  ├─ title (VARCHAR 255)                                  │  │ │   │
│  │  │  │  ├─ type (ENUM: job/internship/event/general)            │  │ │   │
│  │  │  │  ├─ company (VARCHAR 255)                                │  │ │   │
│  │  │  │  ├─ location (VARCHAR 255)                               │  │ │   │
│  │  │  │  ├─ description (TEXT)                                   │  │ │   │
│  │  │  │  ├─ requirements (TEXT)                                  │  │ │   │
│  │  │  │  ├─ application_link (VARCHAR 512)                       │  │ │   │
│  │  │  │  ├─ posted_by (INT, FK → alumni.id)                      │  │ │   │
│  │  │  │  ├─ posted_by_name (VARCHAR 255)                         │  │ │   │
│  │  │  │  ├─ created_at (TIMESTAMP)                               │  │ │   │
│  │  │  │  ├─ expires_at (TIMESTAMP, NULL)                         │  │ │   │
│  │  │  │  └─ is_active (BOOLEAN, DEFAULT TRUE)                    │  │ │   │
│  │  │  │                                                           │  │ │   │
│  │  │  │  Indexes:                                                │  │ │   │
│  │  │  │  • idx_type (type)                                       │  │ │   │
│  │  │  │  • idx_created_at (created_at DESC)                      │  │ │   │
│  │  │  │  • idx_active (is_active)                                │  │ │   │
│  │  │  └──────────────────────────────────────────────────────────┘  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE SYSTEM (Storage Layer)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │  server/uploads/                                                      │   │
│  │  ├─ Profile images (uploaded via multer)                             │   │
│  │  └─ Served via /uploads/:filename endpoint                           │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │  Fallback Data:                                                       │   │
│  │  ├─ alumni.json (Local fallback data)                                │   │
│  │  └─ server/data.sqlite (SQLite fallback DB)                          │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. User Login Flow
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Enter credentials
     ▼
┌─────────────────┐
│ loginfinal.html │
└────┬────────────┘
     │ 2. POST /api/login
     │    {userId, password, role}
     ▼
┌─────────────────┐
│   Express API   │
│   (/api/login)  │
└────┬────────────┘
     │ 3. Query database
     ▼
┌─────────────────┐
│  MySQL (alumni) │
│  Find by        │
│  login_id/name  │
└────┬────────────┘
     │ 4. User record
     ▼
┌─────────────────┐
│   BCrypt        │
│   Verify        │
│   Password      │
└────┬────────────┘
     │ 5. Match result
     ▼
┌─────────────────┐
│   Session       │
│   Store user    │
│   in session/   │
│   localStorage  │
└────┬────────────┘
     │ 6. Redirect based on role
     ├─ Student  → mainst.html
     ├─ Alumni   → mainalu.html
     └─ Admin    → mainad.html
```

### 2. Profile View Flow
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Click profile
     ▼
┌─────────────────┐
│  profile.html   │
│  ?id=123        │
└────┬────────────┘
     │ 2. GET /api/alumni/123
     ▼
┌─────────────────┐
│   Express API   │
└────┬────────────┘
     │ 3. Query by ID
     ▼
┌─────────────────┐
│  MySQL (alumni) │
│  SELECT * WHERE │
│  id = 123       │
└────┬────────────┘
     │ 4. Profile data
     ▼
┌─────────────────┐
│  profile.html   │
│  Display:       │
│  • Name, Photo  │
│  • Company      │
│  • Experience   │
│  • Contact      │
└─────────────────┘
```

### 3. Announcement Creation Flow
```
┌─────────┐
│  User   │
│ (Logged)│
└────┬────┘
     │ 1. Click "Post Announcement"
     ▼
┌───────────────────┐
│announcements.html │
│  Modal Form       │
└────┬──────────────┘
     │ 2. Fill form (title, type, company, etc.)
     │ 3. Click "Post"
     ▼
┌───────────────────┐
│  detectApiPort()  │
│  Auto-detect port │
│  4000-4003        │
└────┬──────────────┘
     │ 4. POST /api/announcements
     │    {title, type, company, location,
     │     description, requirements,
     │     application_link, posted_by}
     ▼
┌───────────────────┐
│   Express API     │
│(/api/announcements)│
└────┬──────────────┘
     │ 5. Validate data
     │ 6. Get poster name
     ▼
┌───────────────────┐
│  MySQL            │
│  • Get alumni.name│
│  • INSERT INTO    │
│    announcements  │
└────┬──────────────┘
     │ 7. Return created record
     ▼
┌───────────────────┐
│announcements.html │
│  • Show success   │
│  • Reload list    │
│  • Display new    │
│    announcement   │
└───────────────────┘
```

### 4. Dynamic Filter Update Flow
```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Open portal
     ▼
┌───────────────────┐
│  mainst.html /    │
│  mainalu.html /   │
│  mainad.html      │
└────┬──────────────┘
     │ 2. GET /api/alumni
     ▼
┌───────────────────┐
│   Express API     │
└────┬──────────────┘
     │ 3. Fetch all profiles
     ▼
┌───────────────────┐
│  MySQL (alumni)   │
│  SELECT * FROM    │
│  alumni           │
│  ORDER BY id DESC │
└────┬──────────────┘
     │ 4. All alumni records
     ▼
┌───────────────────┐
│ populateFilters() │
│ • Extract unique: │
│   - Branches      │
│   - Batches       │
│   - Companies     │
│ • Sort values     │
└────┬──────────────┘
     │ 5. Update dropdowns
     ▼
┌───────────────────┐
│  Filter Dropdowns │
│  • Branch: CSE,   │
│    ECE, DSAI      │
│  • Batch: 2025,   │
│    2024, 2023...  │
│  • Company: All   │
│    from DB        │
└───────────────────┘
```

---

## 🏗️ Component Architecture

### Frontend Components

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend Structure                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Public Pages (No Auth Required):                        │
│  ├─ loginfinal.html          Login/Registration          │
│  └─ create_profile.html      New user registration       │
│                                                           │
│  Role-Based Portals:                                     │
│  ├─ mainst.html             Student view (read-only)     │
│  ├─ mainalu.html            Alumni view (CRUD own)       │
│  └─ mainad.html             Admin view (CRUD all)        │
│                                                           │
│  Shared Features:                                        │
│  ├─ profile.html            View/Edit any profile        │
│  ├─ announcements.html      Job/internship board         │
│  └─ dashboard.html          Analytics dashboard          │
│                                                           │
│  AI Integration:                                         │
│  ├─ chatbot.js              Gemini AI chatbot            │
│  ├─ chatbot.css             Chatbot styling              │
│  ├─ chatbot-config.js       API configuration            │
│  ├─ chatbot-test.html       Testing interface            │
│  └─ test-gemini-api.html    API testing                  │
│                                                           │
│  Utilities:                                              │
│  ├─ Bootstrap scripts (PowerShell)                       │
│  └─ Documentation (Markdown)                             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Backend Components

```
┌──────────────────────────────────────────────────────────┐
│                   Backend Structure                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  server/                                                 │
│  ├─ index.js                Main server file             │
│  ├─ db.js                   MySQL connection pool        │
│  ├─ schema.sql              Database schema              │
│  ├─ package.json            Dependencies                 │
│  ├─ docker-compose.yml      MySQL container config       │
│  ├─ uploads/                Image storage directory      │
│  └─ data.sqlite             SQLite fallback DB           │
│                                                           │
│  Scripts:                                                │
│  ├─ start-db.ps1           Start MySQL container         │
│  ├─ start-server-with-mysql.ps1  Start backend          │
│  ├─ create_db.js            Initialize database          │
│  ├─ mysql_test.js           Test MySQL connection        │
│  ├─ post_sample_profile.js Test profile creation         │
│  └─ print_alumni.js         Display all records          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│               Security Measures                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Authentication:                                         │
│  ├─ BCrypt password hashing (10 rounds)                 │
│  ├─ Session-based login (sessionStorage/localStorage)   │
│  └─ Role-based access control (student/alumni/admin)    │
│                                                          │
│  Authorization:                                          │
│  ├─ Frontend: Role checks before rendering UI           │
│  ├─ Backend: Validate user permissions on each request  │
│  └─ Profile editing: Users can only edit own profiles   │
│                                                          │
│  Data Protection:                                        │
│  ├─ CORS enabled for controlled access                  │
│  ├─ SQL injection prevention (parameterized queries)    │
│  ├─ File upload validation (type, size limits)          │
│  └─ Input sanitization                                  │
│                                                          │
│  Network Security:                                       │
│  ├─ API port auto-detection (4000-4003)                 │
│  ├─ Health check endpoint (/health)                     │
│  └─ Request logging for audit trail                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Database Failover Strategy

```
┌────────────────────────────────────────────────────────┐
│           Three-Tier Fallback System                   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Tier 1: MySQL (Primary)                               │
│  ├─ Docker container on port 3306                      │
│  ├─ Persistent storage                                 │
│  ├─ Full ACID compliance                               │
│  └─ Production-ready                                   │
│         │                                               │
│         ▼ (If MySQL unavailable)                       │
│                                                         │
│  Tier 2: SQLite (Secondary)                            │
│  ├─ File-based database (data.sqlite)                  │
│  ├─ Same schema as MySQL                               │
│  ├─ Automatic fallback                                 │
│  └─ Development/testing mode                           │
│         │                                               │
│         ▼ (If SQLite unavailable)                      │
│                                                         │
│  Tier 3: In-Memory (Tertiary)                          │
│  ├─ JavaScript array storage                           │
│  ├─ Session-only (data lost on restart)                │
│  ├─ Emergency fallback                                 │
│  └─ Demo mode only                                     │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Development Setup                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐                                       │
│  │  Windows Host    │                                       │
│  │  (PowerShell)    │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ├─ Run: bootstrap.ps1 (Full setup)                │
│           ├─ Run: start-db.ps1 (MySQL container)            │
│           ├─ Run: start-server-with-mysql.ps1 (Backend)     │
│           └─ Open: HTML files in browser (Frontend)         │
│                                                              │
│  Docker Desktop:                                            │
│  └─ MySQL Container                                         │
│     ├─ Image: mysql:latest                                  │
│     ├─ Port: 3306:3306                                      │
│     ├─ Volume: mysql-data (persistent)                      │
│     └─ Environment:                                         │
│        ├─ MYSQL_ROOT_PASSWORD=rootpassword                  │
│        ├─ MYSQL_DATABASE=alumni_db                          │
│        └─ MYSQL_USER=alumni_user                            │
│                                                              │
│  Node.js Server:                                            │
│  └─ Express App                                             │
│     ├─ Port: 4000-4003 (auto-detect)                        │
│     ├─ Dependencies: express, mysql2, bcrypt, multer, cors  │
│     └─ Auto-retry on port conflicts                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, JavaScript | User interface |
| **Styling** | Custom CSS, Font Awesome | Visual design |
| **Backend** | Node.js, Express.js | REST API server |
| **Database** | MySQL 8.0 | Primary data storage |
| **Container** | Docker | MySQL deployment |
| **Fallback DB** | SQLite3 | Secondary storage |
| **Auth** | BCrypt | Password hashing |
| **File Upload** | Multer | Image handling |
| **AI** | Google Gemini API | Chatbot integration |
| **Session** | SessionStorage/LocalStorage | Client-side state |
| **Scripting** | PowerShell | Automation scripts |

---

## 🎯 Key Features by Module

### Alumni Management
- ✅ CRUD operations for profiles
- ✅ Image upload and storage
- ✅ Dynamic filtering (branch, batch, company)
- ✅ Role-based access control
- ✅ Profile view/edit pages

### Announcements System
- ✅ Job/Internship postings
- ✅ Event announcements
- ✅ Filter by type
- ✅ Expiration dates
- ✅ Auto-populate poster info
- ✅ CRUD operations

### Authentication
- ✅ Login with username/password
- ✅ Role-based routing
- ✅ Session management
- ✅ BCrypt password hashing
- ✅ Logout functionality

### AI Chatbot
- ✅ Gemini API integration
- ✅ Context-aware responses
- ✅ RAG implementation
- ✅ Customizable configuration

---

## 📈 Scalability Considerations

1. **Database Connection Pooling**: MySQL2 connection pool for efficient DB access
2. **Port Auto-Detection**: Supports running multiple instances (4000-4003)
3. **File Storage**: Centralized uploads directory with URL-based access
4. **API Versioning**: Prepared for /api/v2 endpoints
5. **Caching Strategy**: Ready for Redis integration
6. **Load Balancing**: Multiple server instances possible
7. **CDN Ready**: Static assets can be served via CDN

---

## 🔍 Monitoring & Logging

```
┌─────────────────────────────────────────────────┐
│          Logging & Monitoring Points            │
├─────────────────────────────────────────────────┤
│                                                  │
│  Request Logger:                                │
│  • Timestamp                                    │
│  • HTTP Method                                  │
│  • URL Path                                     │
│  • Response Status                              │
│                                                  │
│  Console Output:                                │
│  • API connection status                        │
│  • Database connection status                   │
│  • Port binding information                     │
│  • Error stack traces                           │
│                                                  │
│  Health Check:                                  │
│  • GET /health endpoint                         │
│  • Returns: {ok: true, ts: timestamp}           │
│                                                  │
│  Frontend Debugging:                            │
│  • Browser console logs                         │
│  • API status indicator                         │
│  • Error alerts with details                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📝 API Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "id": 123,
  "name": "John Doe",
  "branch": "cse",
  "batch": "2021",
  ...
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

**Health Check Response:**
```json
{
  "ok": true,
  "ts": 1699000000000
}
```

---

## 🎨 Design Patterns Used

1. **RESTful API**: Standard HTTP methods for CRUD operations
2. **MVC Pattern**: Separation of concerns (routes, controllers, data)
3. **Factory Pattern**: Database connection management
4. **Singleton Pattern**: Single Express app instance
5. **Middleware Chain**: Request processing pipeline
6. **Fallback Pattern**: Three-tier database failover
7. **Observer Pattern**: Event listeners for UI updates
8. **Strategy Pattern**: Different auth strategies per role

---

**Generated:** October 31, 2025  
**Version:** 1.0  
**Project:** Alumni Portal Management System
