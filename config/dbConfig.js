// config/dbConfig.js
require('dotenv').config({ path: '../env' }); // Load environment variables

const sql = require('mssql');

// SQL Server configuration using environment variables
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // For Azure
    trustServerCertificate: true, // For local development
  },
};

// Connect to the SQL server
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch((err) => console.log('Database connection failed: ', err));

module.exports = {
  sql,
  poolPromise,
};
