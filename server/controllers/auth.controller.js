const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, email, password_hash, rol, iglesia_id FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const usuario = rows[0];
    const passwordOk = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        iglesia_id: usuario.iglesia_id
      },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Login exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        iglesia_id: usuario.iglesia_id
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al intentar iniciar sesión.' });
  }
}

module.exports = {
  login
};
