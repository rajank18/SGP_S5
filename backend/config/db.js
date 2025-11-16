import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Support both DB_PASS and DB_PASSWORD env var names
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_USER = process.env.DB_USER || process.env.DB_USERNAME || 'root';
const DB_PASS = process.env.DB_PASS ?? process.env.DB_PASSWORD ?? '';
const DB_NAME = process.env.DB_NAME || process.env.DB_DATABASE || 'prograde_db';

const shouldLogSql = (process.env.SEQUELIZE_LOGGING === 'true');

// Create a mysql2 connection pool (exported for raw queries if needed)
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  // Increase connect timeout to handle slower network/proxy connections
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 15000),
  // Railway often requires TLS; for convenience set rejectUnauthorized: false
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize Sequelize (keeps existing ORM usage intact)
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  port: DB_PORT,
  logging: shouldLogSql ? (msg) => console.debug(msg) : false,
  pool: {
    max: Number(process.env.SEQUELIZE_POOL_MAX || 10),
    min: Number(process.env.SEQUELIZE_POOL_MIN || 0),
    acquire: Number(process.env.SEQUELIZE_ACQUIRE || 30000),
    idle: Number(process.env.SEQUELIZE_IDLE || 10000),
  },
  dialectOptions: {
    ssl: {
      // Railway requires TLS; allow self-signed by disabling verification
      rejectUnauthorized: false,
    },
  },
});

// Test the connections (pool + sequelize)
(async () => {
  try {
    // Test mysql2 pool with a simple query (less aggressive than getConnection + ping)
    await pool.query('SELECT 1');
    console.log('✅ mysql2 pool connected to database successfully.');
  } catch (err) {
    console.error('❌ mysql2 pool connection failed:', err.message || err);
    console.error('   - This may be a network timeout (ETIMEDOUT) or Railway access restriction.');
    console.error('   - Try running from your machine: Test-NetConnection -ComputerName', DB_HOST, '-Port', DB_PORT);
    console.error('   - You can also increase DB_CONNECT_TIMEOUT in your .env to allow more time.');
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connection has been established successfully.');
  } catch (err) {
    console.error('❌ Sequelize unable to connect to the database:', err.message || err);
  }
})();

export default sequelize;
export { pool };