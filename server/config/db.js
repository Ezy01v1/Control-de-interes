const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'iglesia_registro';

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    charset: 'utf8mb4'
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  } finally {
    await connection.end();
  }
}

async function ensureSchema() {
  const connection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = ? AND table_name = 'personas'`,
      [dbName]
    );

    if (rows[0].total > 0) {
      return;
    }

    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('Esquema inicializado correctamente.');
  } catch (error) {
    console.warn('No se pudo garantizar el esquema:', error.message);
  } finally {
    await connection.end();
  }
}

ensureDatabase()
  .then(() => ensureSchema())
  .catch((error) => {
    console.warn('No se pudo garantizar la base de datos:', error.message);
  });

const poolConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

if (process.env.DB_SSL) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
