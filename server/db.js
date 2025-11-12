const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Support both DATABASE_URL and MYSQL_URL (used by Railway, Render, Heroku, etc.)
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let poolConfig;

if (dbUrl) {
  // Parse DATABASE_URL or MYSQL_URL (format: mysql://user:password@host:port/database)
  try {
    const url = new URL(dbUrl);
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    poolConfig = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 30000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };
    
    // Add SSL for non-localhost connections (required by Railway, Render, etc.)
    if (!isLocalhost) {
      poolConfig.ssl = { rejectUnauthorized: false };
      console.log(`Connecting to database at ${url.hostname} with SSL (production mode)`);
    } else {
      console.log(`Connecting to database at ${url.hostname} (local mode)`);
    }
  } catch (err) {
    console.error('Failed to parse DATABASE_URL/MYSQL_URL:', err.message);
    throw err;
  }
} else {
  // Use individual environment variables (for local development)
  const host = process.env.DB_HOST || 'localhost';
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  
  poolConfig = {
    host: host,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumni_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };
  
  // Add SSL for non-localhost connections
  if (!isLocalhost) {
    poolConfig.ssl = { rejectUnauthorized: false };
    console.log(`Connecting to database at ${host} with SSL (production mode)`);
  } else {
    console.log(`Connecting to database at ${host} (local mode)`);
  }
}

const pool = mysql.createPool(poolConfig);

// Test connection on startup with helpful error messages
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
  } catch (err) {
    const errorCode = err.code;
    const errorMessage = err.message;
    
    console.error('❌ Database connection failed:');
    
    // Provide helpful error messages for common connection failures
    switch (errorCode) {
      case 'ECONNREFUSED':
        console.error('  → MySQL server is not running or not accessible');
        console.error('  → Check if MySQL is running and the host/port are correct');
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('  → Invalid database credentials (username or password)');
        console.error('  → Verify DB_USER and DB_PASSWORD environment variables');
        break;
      case 'ER_BAD_DB_ERROR':
        console.error('  → Database does not exist');
        console.error('  → Create the database or check DB_NAME environment variable');
        break;
      case 'ETIMEDOUT':
        console.error('  → Connection timeout - database server took too long to respond');
        console.error('  → Check network connectivity or increase timeout');
        break;
      case 'ENOTFOUND':
        console.error('  → Database host not found');
        console.error('  → Check DB_HOST or DATABASE_URL/MYSQL_URL');
        break;
      default:
        console.error(`  → Error: ${errorMessage}`);
        console.error(`  → Code: ${errorCode}`);
    }
    
    // Don't exit - let the app use fallback mechanism
    console.error('  → Application will attempt to use fallback database');
  }
})();

module.exports = pool;
