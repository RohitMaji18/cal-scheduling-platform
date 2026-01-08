// database.js (Backend folder mein)
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  // Ye line sabse important hai.
  // Deploy hone par ye 'DATABASE_URL' variable dhoondega.
  // Laptop par ye tumhare .env file se values lega.
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Cloud DB ke liye zaroori hai
  },
});

module.exports = pool;
