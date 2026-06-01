const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
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
    
    // Check if user exists
    const existing = await conn.query("SELECT id FROM User WHERE email = ?", ['admin@aura.com']);
    
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const id = require('crypto').randomUUID(); // generate a CUID/UUID
      const now = new Date();
      
      await conn.query(
        "INSERT INTO User (id, email, name, password, role, points, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, 'admin@aura.com', 'Admin User', hashedPassword, 'ADMIN', 0, now, now]
      );
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    if (conn) conn.end();
    process.exit();
  }
}

main();
