const pool = require('../config/dbConfig');

const getMySQLConnection = () => pool;

const executeQuery = async (query, params) => {
  const connection = getMySQLConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

module.exports = {
  getMySQLConnection,
  executeQuery
};
