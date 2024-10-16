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

pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySql 연결 실패', err);
  } else {
    console.log('MySql 연결 성공');
    connection.release(); // 연결 사용 후 해제
  }
});

module.exports = pool.promise();




