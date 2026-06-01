const mariadb = require('mariadb');
require('dotenv').config();

async function main() {
  const url = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/aura_db';
  const dbUrl = new URL(url);
  
  const pool = mariadb.createPool({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
  });

  let conn;
  try {
    conn = await pool.getConnection();
    const users = await conn.query("SELECT email, password FROM User");
    console.log("Users in DB:", users);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    if (conn) conn.end();
    process.exit();
  }
}

main();
