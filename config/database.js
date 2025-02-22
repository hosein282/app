// src/config/database.js
// const mysql = require('mysql2/promise');
require('dotenv').config();


const mysql = require('mysql2');


const pool = mysql.createConnection({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME,
  waitForConnections: true,
connectionLimit: 10,
 queueLimit: 0,
});

// MySQL database connection



// Connect to the database
pool.connect((err) => {
  if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
  }
  console.log('Connected to MySQL database.');
});



module.exports = pool;
