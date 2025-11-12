const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 4000;
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');


// Add these routes to your index.js file in the server folder
// Place them before the app.listen() call

// Ensure announcements table exists
async function ensureAnnouncementsTable() {
  const create = `
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type ENUM('job', 'internship', 'event', 'general') DEFAULT 'general',
      company VARCHAR(255),
      location VARCHAR(255),
      description TEXT NOT NULL,
      requirements TEXT,
      application_link VARCHAR(512),
      posted_by INT NOT NULL,
      posted_by_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT TRUE,
      INDEX idx_type (type),
      INDEX idx_created_at (created_at DESC),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  
  try {
    await pool.query(create);
    console.log('Announcements table ready');
  } catch (err) {
    console.error('Failed to create announcements table:', err.message);
  }
}

// GET all announcements (active only by default)
app.get('/api/announcements', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    
    if (usingFallback) {
      // For in-memory/sqlite fallback, return empty array for now
      return res.json([]);
    }
    
    let query = `
      SELECT 
        a.*,
        al.name as poster_name,
        al.role as poster_role,
        al.image as poster_image
      FROM announcements a
      LEFT JOIN alumni al ON a.posted_by = al.id
    `;
    
    if (!includeInactive) {
      query += ' WHERE a.is_active = TRUE AND (a.expires_at IS NULL OR a.expires_at > NOW())';
    }
    
    query += ' ORDER BY a.created_at DESC LIMIT 100';
    
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/announcements error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET single announcement by ID
app.get('/api/announcements/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    
    if (usingFallback) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const [rows] = await pool.query(`
      SELECT 
        a.*,
        al.name as poster_name,
        al.role as poster_role,
        al.image as poster_image
      FROM announcements a
      LEFT JOIN alumni al ON a.posted_by = al.id
      WHERE a.id = ?
    `, [id]);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/announcements/:id error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST create new announcement
app.post('/api/announcements', async (req, res) => {
  try {
    const { 
      title, 
      type, 
      company, 
      location, 
      description, 
      requirements,
      application_link,
      posted_by,
      expires_at
    } = req.body;
    
    if (!title || !description || !posted_by) {
      return res.status(400).json({ error: 'title, description, and posted_by required' });
    }
    
    if (usingFallback) {
      return res.status(501).json({ error: 'Announcements not supported in fallback mode' });
    }
    
    // Get poster name
    const [posterRows] = await pool.query('SELECT name FROM alumni WHERE id = ?', [posted_by]);
    const posted_by_name = posterRows && posterRows[0] ? posterRows[0].name : 'Unknown';
    
    const [result] = await pool.query(
      `INSERT INTO announcements 
       (title, type, company, location, description, requirements, application_link, posted_by, posted_by_name, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        type || 'general', 
        company || null, 
        location || null, 
        description, 
        requirements || null,
        application_link || null,
        posted_by,
        posted_by_name,
        expires_at || null
      ]
    );
    
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/announcements error:', err);
    res.status(500).json({ error: 'DB error: ' + err.message });
  }
});

// PUT update announcement
app.put('/api/announcements/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    
    if (usingFallback) {
      return res.status(501).json({ error: 'Announcements not supported in fallback mode' });
    }
    
    const fields = ['title', 'type', 'company', 'location', 'description', 'requirements', 'application_link', 'expires_at', 'is_active'];
    const updates = [];
    const params = [];
    
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(id);
    
    const sql = `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(sql, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/announcements/:id error:', err);
    res.status(500).json({ error: 'DB error: ' + err.message });
  }
});

// DELETE announcement
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    
    if (usingFallback) {
      return res.status(501).json({ error: 'Announcements not supported in fallback mode' });
    }
    
    const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/announcements/:id error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Call this in your startup code, after ensureSchema() and ensureColumns()
// Add this line in the (async () => { ... })() startup function:
// await ensureAnnouncementsTable();

// sqlite fallback (persistent file) so the app works even without MySQL installed
let usingSqlite = false;
let sqliteDb = null;
let sqlite = null;
try {
  sqlite = require('sqlite3');
} catch (e) {
  sqlite = null;
}

app.use(cors());
app.use(express.json());

// Rate limiting for API endpoints (prevent abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health'
});

// More strict rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use('/api/', apiLimiter);

// in-memory fallback store used when MySQL is unavailable
let usingFallback = false;
const inMemoryAlumni = [];
let nextInMemoryId = 1;

// Add header indicating data source (mysql or memory) for easier client-side checks
app.use((req, res, next) => {
  res.setHeader('X-Data-Source', usingFallback ? 'memory' : 'mysql');
  next();
});

// simple request logger to help debug connectivity issues
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploads with CORS headers (images are often requested from a different origin)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
}, express.static(uploadsDir));

// Serve static files (HTML, CSS, JS, images) from parent directory
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir, {
  setHeaders: (res, filepath) => {
    // Set appropriate CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Cache static assets
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filepath.match(/\.(css|js|jpg|jpeg|png|gif|svg|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Health endpoint for quick checks from clients or load balancers
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ensure preflight requests are handled
app.options('*', cors());

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) { 
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9); 
    cb(null, unique + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Ensure table exists (simple schema)
async function ensureSchema() {
  const create = `
    CREATE TABLE IF NOT EXISTS alumni (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(32),
      login_id VARCHAR(128),
      password_hash VARCHAR(512),
      branch VARCHAR(64),
      batch VARCHAR(32),
      company VARCHAR(128),
      current_place VARCHAR(128),
      education VARCHAR(128),
      experience TEXT,
      certificates TEXT,
      description TEXT,
      image TEXT,
      phone VARCHAR(64),
      email VARCHAR(255),
      contactno VARCHAR(64)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await pool.query(create);
}

// helper to add missing columns if the table existed earlier
async function ensureColumns() {
  const cols = [
    ['role','VARCHAR(32)'],
    ['login_id','VARCHAR(128)'],
    ['password_hash','VARCHAR(512)'],
    ['current_place','VARCHAR(128)'],
    ['education','VARCHAR(128)'],
    ['experience','TEXT'],
    ['certificates','TEXT'],
    ['contactno','VARCHAR(64)']
  ];
  
  // Get existing columns first
  try {
    const [existingCols] = await pool.query('SHOW COLUMNS FROM alumni');
    const existingColNames = existingCols.map(col => col.Field.toLowerCase());
    
    for (const [name, type] of cols) {
      if (!existingColNames.includes(name.toLowerCase())) {
        try {
          await pool.query(`ALTER TABLE alumni ADD COLUMN ${name} ${type}`);
          console.log(`Added column: ${name}`);
        } catch (err) {
          console.error(`Failed to add column ${name}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('Error checking columns:', err.message);
  }
  
  try {
    await pool.query('ALTER TABLE alumni MODIFY COLUMN image TEXT');
  } catch (err) {
    // ignore
  }
}

// Setup sqlite fallback DB file and schema
async function ensureSqlite(filePath) {
  if (!sqlite) throw new Error('sqlite3 package not installed');
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite.Database(filePath, (err) => {
      if (err) return reject(err);
      const create = `
        CREATE TABLE IF NOT EXISTS alumni (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          role TEXT,
          login_id TEXT,
          password_hash TEXT,
          branch TEXT,
          batch TEXT,
          company TEXT,
          current_place TEXT,
          education TEXT,
          experience TEXT,
          certificates TEXT,
          description TEXT,
          image TEXT,
          phone TEXT,
          email TEXT,
          contactno TEXT
        );`;
      sqliteDb.run(create, (err2) => err2 ? reject(err2) : resolve());
    });
  });
}

function sqliteAll(sql, params=[]) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

function sqliteRun(sql, params=[]) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function(err) { 
      if (err) return reject(err); 
      resolve({ lastID: this.lastID }); 
    });
  });
}

app.get('/api/alumni', async (req, res) => {
  try {
    if (usingFallback) {
      if (usingSqlite) {
        const rows = await sqliteAll('SELECT * FROM alumni ORDER BY id DESC LIMIT 1000');
        return res.json(rows.reverse());
      }
      return res.json([...inMemoryAlumni].reverse());
    }
    // Fetch all data - contactno will be used as phone on frontend
    const [rows] = await pool.query('SELECT *, contactno as phone FROM alumni ORDER BY id DESC LIMIT 1000');
    console.log(`Fetched ${rows.length} alumni from database`);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/alumni error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/alumni/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (usingFallback) {
      if (usingSqlite) {
        const rows = await sqliteAll('SELECT * FROM alumni WHERE id = ?', [id]);
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
        return res.json(rows[0]);
      }
      const found = inMemoryAlumni.find(a => String(a.id) === String(id));
      if (!found) return res.status(404).json({ error: 'Not found' });
      return res.json(found);
    }
    const [rows] = await pool.query('SELECT *, contactno as phone FROM alumni WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/alumni/:id error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.post('/api/alumni', async (req, res) => {
  try {
    const { name, branch, batch, company, description, image } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    if (usingFallback) {
      if (usingSqlite) {
        const r = await sqliteRun(
          'INSERT INTO alumni (name, branch, batch, company, description, image) VALUES (?, ?, ?, ?, ?, ?)', 
          [name, branch || null, batch || null, company || null, description || null, image || null]
        );
        const rows = await sqliteAll('SELECT * FROM alumni WHERE id = ?', [r.lastID]);
        return res.json(rows[0]);
      }
      const item = { 
        id: nextInMemoryId++, 
        name, 
        branch: branch || null, 
        batch: batch || null, 
        company: company || null, 
        description: description || null, 
        image: image || null 
      };
      inMemoryAlumni.push(item);
      return res.json(item);
    }
    const [result] = await pool.query(
      'INSERT INTO alumni (name, branch, batch, company, description, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, branch || null, batch || null, company || null, description || null, image || null]
    );
    const [rows] = await pool.query('SELECT * FROM alumni WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/alumni error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Update profile endpoint (JSON only, no image)
app.put('/api/alumni/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    
    console.log(`PUT /api/alumni/${id} - Request body:`, req.body);
    
    const roleHeader = String(req.get('x-user-role') || '').toLowerCase();
    const isAdminRole = roleHeader === 'admin' || roleHeader === 'administrator';
    
    console.log(`User role from header: ${roleHeader}, isAdmin: ${isAdminRole}`);
    
    const fields = ['name','role','login_id','branch','batch','company','current_place','education','experience','certificates','description','image','email','contactno'];
    const updates = [];
    const params = [];
    
    // handle password specially
    if (Object.prototype.hasOwnProperty.call(req.body, 'password')) {
      const pw = req.body.password;
      if (pw && String(pw).length > 0) {
        const hash = await bcrypt.hash(String(pw), 10);
        updates.push('password_hash = ?');
        params.push(hash);
      }
    }
    
    // CRITICAL FIX: handle phone -> contactno mapping (frontend sends 'phone', db uses 'contactno')
    if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
      const phoneValue = req.body.phone;
      // Only update if not empty
      if (phoneValue && String(phoneValue).trim().length > 0) {
        updates.push('contactno = ?');
        params.push(phoneValue);
        console.log(`Updating contactno to: ${phoneValue}`);
      }
    }
    
    for (const f of fields) {
      // prevent admins from modifying identity fields
      if (isAdminRole && (f === 'name' || f === 'login_id' || f === 'batch' || f === 'branch')) {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        const value = req.body[f];
        
        // CRITICAL FIX: Handle empty email - set to NULL instead of empty string
        if (f === 'email') {
          if (!value || String(value).trim().length === 0) {
            updates.push(`${f} = NULL`);
            console.log(`Setting ${f} to NULL (empty)`);
          } else {
            updates.push(`${f} = ?`);
            params.push(value);
            console.log(`Updating ${f} to: ${value}`);
          }
        } else {
          updates.push(`${f} = ?`);
          params.push(value);
          console.log(`Updating ${f} to: ${value}`);
        }
      }
    }
    
    if (updates.length === 0) {
      console.log('No fields to update - request body:', req.body);
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(id);
    
    if (usingFallback) {
      if (usingSqlite) {
        const sql = `UPDATE alumni SET ${updates.join(', ')} WHERE id = ?`;
        await sqliteRun(sql, params);
        const rows = await sqliteAll('SELECT * FROM alumni WHERE id = ?', [id]);
        return res.json(rows[0]);
      }
      const idx = inMemoryAlumni.findIndex(a => Number(a.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      for (let i=0; i<updates.length; i++) {
        const k = Object.keys(req.body)[i];
        inMemoryAlumni[idx][k] = req.body[k];
      }
      return res.json(inMemoryAlumni[idx]);
    }
    
    const sql = `UPDATE alumni SET ${updates.join(', ')} WHERE id = ?`;
    console.log(`Executing SQL: ${sql}`);
    console.log(`With params:`, params);
    
    const [result] = await pool.query(sql, params);
    console.log(`Update result - affectedRows: ${result.affectedRows}, changedRows: ${result.changedRows}`);
    
    if (result.affectedRows === 0) {
      console.log(`No rows affected for id ${id} - record may not exist`);
      return res.status(404).json({ error: 'Not found' });
    }
    
    const [rows] = await pool.query('SELECT *, contactno as phone FROM alumni WHERE id = ?', [id]);
    console.log(`Updated record fetched - contactno/phone: ${rows[0].phone}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'DB error: ' + err.message });
  }
});

// NEW: Update profile with image upload support
app.put('/api/alumni/:id/full', upload.single('imageFile'), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
    
    console.log(`PUT /api/alumni/${id}/full - Request body:`, req.body);
    console.log(`Image file:`, req.file ? req.file.filename : 'none');
    
    const fields = ['company', 'role', 'email', 'description'];
    const updates = [];
    const params = [];
    
    // Handle image upload
    if (req.file && req.file.filename) {
      const imagePath = '/uploads/' + req.file.filename;
      updates.push('image = ?');
      params.push(imagePath);
      console.log(`Updating image to: ${imagePath}`);
    }
    
    // CRITICAL FIX: Handle phone -> contactno mapping (frontend sends 'phone', db uses 'contactno')
    if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
      updates.push('contactno = ?');
      params.push(req.body.phone);
      console.log(`Updating contactno to: ${req.body.phone}`);
    }
    
    // Handle other fields
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
        console.log(`Updating ${f} to: ${req.body[f]}`);
      }
    }
    
    if (updates.length === 0) {
      console.log('No fields to update in /full endpoint - request body:', req.body);
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(id);
    
    if (usingFallback) {
      if (usingSqlite) {
        const sql = `UPDATE alumni SET ${updates.join(', ')} WHERE id = ?`;
        await sqliteRun(sql, params);
        const rows = await sqliteAll('SELECT * FROM alumni WHERE id = ?', [id]);
        return res.json(rows[0]);
      }
      const idx = inMemoryAlumni.findIndex(a => Number(a.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      
      if (req.file && req.file.filename) {
        inMemoryAlumni[idx].image = '/uploads/' + req.file.filename;
      }
      for (const f of fields) {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          inMemoryAlumni[idx][f] = req.body[f];
        }
      }
      if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
        inMemoryAlumni[idx].contactno = req.body.phone;
      }
      return res.json(inMemoryAlumni[idx]);
    }
    
    const sql = `UPDATE alumni SET ${updates.join(', ')} WHERE id = ?`;
    console.log(`Executing SQL: ${sql}`);
    console.log(`With params:`, params);
    
    const [result] = await pool.query(sql, params);
    console.log(`Update result - affectedRows: ${result.affectedRows}, changedRows: ${result.changedRows}`);
    
    if (result.affectedRows === 0) {
      console.log(`No rows affected for id ${id} - record may not exist`);
      return res.status(404).json({ error: 'Not found' });
    }
    
    const [rows] = await pool.query('SELECT *, contactno as phone FROM alumni WHERE id = ?', [id]);
    console.log(`Updated record fetched - contactno/phone: ${rows[0].phone}, image: ${rows[0].image}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update profile with image error:', err);
    res.status(500).json({ error: 'DB error: ' + err.message });
  }
});

// Login endpoint (with stricter rate limiting)
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { userId, password, role } = req.body || {};
    if (!userId || !password) return res.status(400).json({ error: 'Missing credentials' });
    
    const lookup = String(userId || '').trim();
    const lookupLower = lookup.toLowerCase();

    if (usingFallback) {
      if (usingSqlite && sqliteDb) {
        const rows = await sqliteAll(
          "SELECT id, name, login_id, password_hash, role FROM alumni WHERE LOWER(TRIM(COALESCE(login_id, ''))) = ? OR LOWER(TRIM(COALESCE(name, ''))) = ? LIMIT 1", 
          [lookupLower, lookupLower]
        );
        const user = (rows && rows[0]) || null;
        if (!user) return res.status(401).json({ error: 'Invalid ID or password' });
        
        const stored = String(user.password_hash || '');
        const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
        let okPw = false;
        try { 
          okPw = isHash ? await bcrypt.compare(password, stored) : (stored === password); 
        } catch (_) { 
          okPw = false; 
        }
        
        if (!okPw) return res.status(401).json({ error: 'Invalid ID or password' });
        
        if (role) {
          const want = String(role).toLowerCase();
          const have = String(user.role || '').toLowerCase();
          const normalize = (r) => r === 'administrator' ? 'admin' : r;
          if (normalize(want) !== normalize(have)) {
            return res.status(401).json({ error: 'Invalid role for this account' });
          }
        }
        return res.json({ ok: true, id: user.id, name: user.name, userId: user.login_id, role: user.role });
      }
      
      // in-memory fallback
      const found = inMemoryAlumni.find(a => (
        (a.login_id && String(a.login_id).trim().toLowerCase() === lookupLower) || 
        (a.name && String(a.name).trim().toLowerCase() === lookupLower)
      ));
      
      if (!found) return res.status(401).json({ error: 'Invalid ID or password' });
      
      const stored = String(found.password_hash || '');
      const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
      let okPw = false;
      try { 
        okPw = isHash ? await bcrypt.compare(password, stored) : (stored === password); 
      } catch (_) { 
        okPw = false; 
      }
      
      if (!okPw) return res.status(401).json({ error: 'Invalid ID or password' });
      
      if (role) {
        const want = String(role).toLowerCase();
        const have = String(found.role || '').toLowerCase();
        const normalize = (r) => r === 'administrator' ? 'admin' : r;
        if (normalize(want) !== normalize(have)) {
          return res.status(401).json({ error: 'Invalid role for this account' });
        }
      }
      return res.json({ ok: true, id: found.id, name: found.name, userId: found.login_id, role: found.role });
    }

    // MySQL
    const [rows] = await pool.query(
      'SELECT id, name, login_id, password_hash, role FROM alumni WHERE LOWER(TRIM(COALESCE(login_id, ""))) = ? OR LOWER(TRIM(COALESCE(name, ""))) = ? LIMIT 1', 
      [lookupLower, lookupLower]
    );
    
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid ID or password' });
    
    const user = rows[0];
    const stored = String(user.password_hash || '');
    const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
    let okPw = false;
    try { 
      okPw = isHash ? await bcrypt.compare(password, stored) : (stored === password); 
    } catch (_) { 
      okPw = false; 
    }
    
    if (!okPw) return res.status(401).json({ error: 'Invalid ID or password' });
    
    if (role) {
      const want = String(role).toLowerCase();
      const have = String(user.role || '').toLowerCase();
      const normalize = (r) => r === 'administrator' ? 'admin' : r;
      if (normalize(want) !== normalize(have)) {
        return res.status(401).json({ error: 'Invalid role for this account' });
      }
    }
    
    return res.json({ ok: true, id: user.id, name: user.name, userId: user.login_id, role: user.role });
  } catch (err) {
    console.error('Login error', err && err.message ? err.message : err);
    res.status(500).json({ error: err && err.message ? err.message : 'Server error' });
  }
});

// full profile creation endpoint (with password)
app.post('/api/alumni/full', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, role, login_id, password, branch, batch, company, current_place, education, experience, certificates, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    
    let hash = null;
    if (password) {
      hash = await bcrypt.hash(password, 10);
    }
    
    let imagePath = null;
    if (req.file && req.file.filename) {
      imagePath = '/uploads/' + req.file.filename;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    
    if (usingFallback) {
      if (usingSqlite) {
        const r = await sqliteRun(
          'INSERT INTO alumni (name, role, login_id, password_hash, branch, batch, company, current_place, education, experience, certificates, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [name, role || null, login_id || null, hash, branch || null, batch || null, company || null, current_place || null, education || null, experience || null, certificates || null, description || null, imagePath || null]
        );
        const rows = await sqliteAll('SELECT * FROM alumni WHERE id = ?', [r.lastID]);
        return res.json(rows[0]);
      }
      
      const item = { 
        id: nextInMemoryId++, 
        name, 
        role: role || null, 
        login_id: login_id || null, 
        password_hash: hash, 
        branch: branch || null, 
        batch: batch || null, 
        company: company || null, 
        current_place: current_place || null, 
        education: education || null, 
        experience: experience || null, 
        certificates: certificates || null, 
        description: description || null, 
        image: imagePath || null 
      };
      inMemoryAlumni.push(item);
      return res.json(item);
    }
    
    const [result] = await pool.query(
      'INSERT INTO alumni (name, role, login_id, password_hash, branch, batch, company, current_place, education, experience, certificates, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, role || null, login_id || null, hash, branch || null, batch || null, company || null, current_place || null, education || null, experience || null, certificates || null, description || null, imagePath || null]
    );
    const [rows] = await pool.query('SELECT * FROM alumni WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/alumni/full error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.delete('/api/alumni/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (usingFallback) {
      if (usingSqlite) {
        await sqliteRun('DELETE FROM alumni WHERE id = ?', [id]);
        return res.json({ ok: true });
      }
      const idx = inMemoryAlumni.findIndex(a => String(a.id) === String(id));
      if (idx !== -1) inMemoryAlumni.splice(idx, 1);
      return res.json({ ok: true });
    }
    await pool.query('DELETE FROM alumni WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/alumni/:id error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/export', async (req, res) => {
  try {
    if (usingFallback) {
      if (usingSqlite) {
        const rows = await sqliteAll('SELECT * FROM alumni ORDER BY id DESC');
        res.setHeader('Content-Disposition', 'attachment; filename="alumni-export.json"');
        return res.json(rows.reverse());
      }
      res.setHeader('Content-Disposition', 'attachment; filename="alumni-export.json"');
      return res.json([...inMemoryAlumni].reverse());
    }
    const [rows] = await pool.query('SELECT * FROM alumni ORDER BY id DESC');
    res.setHeader('Content-Disposition', 'attachment; filename="alumni-export.json"');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/export error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Serve login page as default root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'loginfinal.html'));
});

(async () => {
  try {
    try {
      await ensureSchema();
      await ensureColumns();
      await ensureAnnouncementsTable();
      console.log('Connected to MySQL DB');
      usingFallback = false;
    } catch (dbErr) {
      console.error('MySQL unavailable', dbErr && dbErr.message ? dbErr.message : dbErr);
      
      if (process.env.NO_INMEM_FALLBACK === '1') {
        try {
          const sqliteFile = path.join(__dirname, 'data.sqlite');
          await ensureSqlite(sqliteFile);
          usingSqlite = true;
          usingFallback = true;
          console.log('Using sqlite fallback at', sqliteFile);
        } catch (sErr) {
          console.error('sqlite fallback failed:', sErr && sErr.message ? sErr.message : sErr);
          console.error('NO_INMEM_FALLBACK=1 set: exiting because DB is required');
          process.exit(1);
        }
      } else {
        try {
          const sqliteFile = path.join(__dirname, 'data.sqlite');
          await ensureSqlite(sqliteFile);
          usingSqlite = true;
          usingFallback = true;
          console.log('MySQL unavailable – using sqlite fallback at', sqliteFile);
        } catch (sErr) {
          console.error('sqlite fallback failed or sqlite not installed:', sErr && sErr.message ? sErr.message : sErr);
          console.error('Falling back to in-memory store');
          usingFallback = true;
        }
      }
    }
    
    // Try to bind to the requested port, but if it's in use, try nearby ports
    async function listenWithRetry(startPort, maxAttempts = 11) {
      let p = Number(startPort) || 4000;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          await new Promise((resolve, reject) => {
            const server = app.listen(p);
            server.once('listening', () => {
              console.log(`Alumni API running on http://localhost:${p} (fallback=${usingFallback})`);
              resolve();
            });
            server.once('error', (err) => {
              // If address in use, close server and try next port
              if (err && err.code === 'EADDRINUSE') {
                try { server.close(); } catch (e) { /* ignore */ }
                console.warn(`Port ${p} in use, trying next port...`);
                resolve({ tryNext: true });
              } else {
                reject(err);
              }
            });
          }).then((val) => {
            if (val && val.tryNext) {
              p += 1;
              return; // continue loop
            }
            // successful listen resolved
            throw 'LISTEN_OK';
          });
        } catch (e) {
          if (e === 'LISTEN_OK') return; // started
          // non-retryable error
          console.error('Failed to bind server:', e && e.message ? e.message : e);
          process.exit(1);
        }
      }
      console.error(`Could not bind to any port in range ${startPort}-${p}. Please free port ${startPort} or set PORT env var to a free port.`);
      process.exit(1);
    }

    await listenWithRetry(port, 11);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();