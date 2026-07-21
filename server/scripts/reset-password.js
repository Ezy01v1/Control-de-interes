const bcrypt = require('bcryptjs');
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
const newPassword = process.argv[2];

if (!newPassword) {
  console.error('Uso: node server/scripts/reset-password.js nueva-contraseña');
  process.exit(1);
}

async function main() {
  const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    connectTimeout: 20000,
    ...(sslConfig ? { ssl: sslConfig } : {})
  });

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [rows] = await pool.execute('SELECT id FROM usuarios ORDER BY id LIMIT 1');

    if (!rows || rows.length === 0) {
      console.error('No se encontró ningún usuario en la tabla usuarios.');
      process.exit(1);
    }

    const [result] = await pool.execute(
      'UPDATE usuarios SET password_hash = ? WHERE id = ?',
      [passwordHash, rows[0].id]
    );

    if (result.affectedRows === 0) {
      console.error('No se encontró ningún usuario en la tabla usuarios.');
      process.exit(1);
    }

    console.log('Contraseña actualizada correctamente para el usuario único de la junta.');
  } catch (error) {
    console.error('No se pudo actualizar la contraseña:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
