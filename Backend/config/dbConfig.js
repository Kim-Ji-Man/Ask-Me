// dbConfig.js
require('dotenv').config({ path: '../.env' });  // .env 파일 경로 명시
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true
});

module.exports = pool.promise();




