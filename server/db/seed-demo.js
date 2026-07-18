const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'iglesia_registro';

async function main() {
  const pool = await mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4'
  });

  try {
    await pool.query(`
      INSERT IGNORE INTO iglesias (id, nombre, activa) VALUES
      (1, 'Iglesia 1', TRUE),
      (2, 'Iglesia 2', TRUE),
      (3, 'Iglesia 3', TRUE),
      (4, 'Iglesia 4', TRUE),
      (5, 'Iglesia 5', TRUE),
      (6, 'Iglesia 6', TRUE),
      (7, 'Iglesia 7', TRUE),
      (8, 'Iglesia 8', TRUE),
      (9, 'Iglesia 9', TRUE),
      (10, 'Iglesia 10', TRUE),
      (11, 'Iglesia 11', TRUE),
      (12, 'Iglesia 12', TRUE),
      (13, 'Iglesia 13', TRUE)
    `);

    await pool.query(`
      INSERT IGNORE INTO usuarios (id, nombre, email, password_hash)
      VALUES (1, 'Junta Demo', 'junta@iglesia.local', '$2b$10$Qn2vXb1X1jY1wP7u6G7gouKJqXEs4lD7p9L6OzQ5WzvO2Gq6F6Ae.')
    `);

    const [countIglesias] = await pool.query('SELECT COUNT(*) AS total FROM iglesias');
    const [countUsuarios] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');

    console.log(JSON.stringify({
      iglesias: countIglesias[0].total,
      usuarios: countUsuarios[0].total
    }));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
