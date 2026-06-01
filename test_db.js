const mariadb = require('mariadb');
require('dotenv').config();

async function main() {
  const pool = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'aura_db',
    connectionLimit: 10,
  });

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT CURRENT_USER()");
    console.log("Connected as:", rows);
    conn.end();
  } catch(e) {
    console.error("Pool error:", e);
  } finally {
    process.exit(0);
  }
}
main();
