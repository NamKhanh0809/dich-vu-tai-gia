const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  // QUAN TRỌNG: Phải dùng đúng tên biến môi trường của Railway
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'password_cua_ban',
  database: process.env.MYSQLDATABASE || 'home_service_db',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;