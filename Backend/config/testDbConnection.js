require('dotenv').config(); 

const db = require('./dbConfig');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log('Connection successful:', rows[0].solution);
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

testConnection();
