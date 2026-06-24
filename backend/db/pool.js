// db/pool.js
const { Pool, types } = require("pg");
require("dotenv").config();

types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// db/pool.js - Add this before module.exports
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    console.log('   Time:', res.rows[0].now);
  }
});
module.exports = pool;
