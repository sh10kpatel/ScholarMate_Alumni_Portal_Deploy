const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Support DATABASE_URL (used by Railway, Render, Heroku, etc.) and individual env vars
let poolConfig;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL (format: mysql://user:password@host:port/database)
  try {
    const url = new URL(process.env.DATABASE_URL);
    poolConfig = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000
    };
    // Only log hostname in production to avoid leaking connection details
    console.log(`Connecting to database at ${url.hostname} (production mode)`);
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message);
    throw err;
  }
} else {
  // Use individual environment variables (for local development)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumni_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
  };
  // Safe to log more details in development
  console.log(`Connecting to database at ${poolConfig.host} (local mode)`);
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
