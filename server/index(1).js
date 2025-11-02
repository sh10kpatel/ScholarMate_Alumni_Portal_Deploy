import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 4100;
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'alumni_db';

const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));

let pool;
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

app.get('/api/health', async (_req, res) => {
  try {
    const p = await getPool();
    await p.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/alumni', async (_req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.query('SELECT id, name, branch, batch, company, description as `description`, image FROM alumni ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/alumni/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const p = await getPool();
    const [result] = await p.query('DELETE FROM alumni WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/export', async (_req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.query('SELECT id, name, branch, batch, company, description, image FROM alumni ORDER BY id DESC');
    res.setHeader('Content-Disposition', 'attachment; filename="alumni-export.json"');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simple login endpoint using alumni table's user_id and password columns
app.post('/api/login', async (req, res) => {
  try {
    const { userId, password, role } = req.body || {};
    if (!userId || !password) return res.status(400).json({ error: 'Missing credentials' });
    const p = await getPool();
    const lookup = String(userId).trim();
    const [rows] = await p.query(
      'SELECT id, name, login_id, password_hash, role FROM alumni WHERE login_id = ? OR name = ? LIMIT 1',
      [lookup, lookup]
    );
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid ID or password' });
    const user = rows[0];
    const stored = String(user.password_hash || '');
    const isHash = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
    let okPw = false;
    try {
      okPw = isHash ? await bcrypt.compare(password, stored) : (stored === password);
    } catch (_) { okPw = false; }
    if (!okPw) return res.status(401).json({ error: 'Invalid ID or password' });
    // optional role enforcement: if client sent a role, ensure it matches
    if (role) {
      const want = String(role).toLowerCase();
      const have = String(user.role || '').toLowerCase();
      const normalize = (r) => r === 'administrator' ? 'admin' : r;
      if (normalize(want) !== normalize(have)) {
        return res.status(401).json({ error: 'Invalid role for this account' });
      }
    }
    return res.json({ ok: true, id: user.id, name: user.name, userId: user.login_id, role: user.role });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Alumni server listening on http://127.0.0.1:${PORT}`);
});


