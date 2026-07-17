const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'iglesia_registro';

async function main() {
  const connection = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    charset: 'utf8mb4'
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Base de datos asegurada: ${dbName}`);
  } finally {
    await connection.end();
  }

  const pool = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = ? AND table_name = 'personas'`,
      [dbName]
    );

    if (rows[0].total > 0) {
      console.log('El esquema ya existe. Se omite la creación de tablas.');
      return;
    }

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('Tablas creadas correctamente con schema.sql');
  } catch (error) {
    console.error('Error al crear el esquema:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
