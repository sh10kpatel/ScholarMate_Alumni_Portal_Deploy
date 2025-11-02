// mysql_test.js - quick local test to connect using server/.env creds
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();
(async ()=>{
  try{
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const db = process.env.DB_NAME || 'alumni_db';
    console.log('Connecting to MySQL at', host, 'user', user);
    const conn = await mysql.createConnection({ host, user, password });
    const [dbs] = await conn.query('SHOW DATABASES');
    console.log('Databases:', dbs.map(d=>d.Database).join(', '));
    try{
      await conn.query('USE ' + db);
      const [tables] = await conn.query("SHOW TABLES");
      console.log('Tables in', db, ':', tables.map(r => Object.values(r)[0]).join(', '));
    }catch(e){ console.error('Could not USE', db, e.message) }
    await conn.end();
  }catch(err){
    console.error('MySQL test failed:', err.message || err);
    process.exit(1);
  }
})();
