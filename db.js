const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'agrimarket.frontend-bachand',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

pool.getConnection()
  .then(conn => { console.log('Database connected'); conn.release(); })
  .catch(err => console.error('DB connection error:', err));

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = { pool, uuid };
