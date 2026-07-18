const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'iglesia_registro';
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const sslConfig = useSsl ? { rejectUnauthorized: false } : undefined;

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    charset: 'utf8mb4',
    connectTimeout: 20000,
    ...(sslConfig ? { ssl: sslConfig } : {})
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
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true,
    charset: 'utf8mb4',
    connectTimeout: 20000,
    ...(sslConfig ? { ssl: sslConfig } : {})
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

const shouldSkipDbInit = process.env.NODE_ENV === 'production' || process.env.SKIP_DB_INIT === 'true' || process.env.SKIP_DB_INIT === '1';

if (!shouldSkipDbInit) {
  ensureDatabase()
    .then(() => ensureSchema())
    .catch((error) => {
      console.warn('No se pudo garantizar la base de datos:', error.message);
    });
} else {
  console.log('DB init skipped: NODE_ENV=production or SKIP_DB_INIT enabled.');
}

console.log('DB env debug:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
});

const poolConfig = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 20000
};

if (useSsl) {
  poolConfig.ssl = sslConfig;
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
