const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const pool = require('../config/db');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?',
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
        email: usuario.email
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
        email: usuario.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al intentar iniciar sesión.' });
  }
}

async function solicitarReset(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: 'El correo es obligatorio.' });
  }

  try {
    const [rows] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (rows.length) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiraEn = new Date(Date.now() + 60 * 60 * 1000);

      await pool.execute(
        'UPDATE usuarios SET reset_token = ?, reset_token_expira = ? WHERE email = ?',
        [token, expiraEn, email]
      );

      await enviarCorreoReset(email, token);
    }

    return res.status(200).json({
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
    });
  } catch (error) {
    console.error('Error al solicitar reset de contraseña:', error);
    return res.status(200).json({
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
    });
  }
}

async function resetPassword(req, res) {
  const token = String(req.body?.token || '').trim();
  const nuevaPassword = String(req.body?.nuevaPassword || '').trim();

  if (!token || !nuevaPassword) {
    return res.status(400).json({ message: 'Token y contraseña son obligatorios.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id FROM usuarios WHERE reset_token = ? AND reset_token_expira > NOW()',
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Enlace inválido o expirado' });
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    await pool.execute(
      'UPDATE usuarios SET password_hash = ?, reset_token = NULL, reset_token_expira = NULL WHERE id = ?',
      [passwordHash, rows[0].id]
    );

    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ message: 'No se pudo restablecer la contraseña.' });
  }
}

async function enviarCorreoReset(email, token) {
  if (!resend) {
    throw new Error('RESEND_API_KEY no configurada.');
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'https://control-de-interes.onrender.com'}/reset-password.html?token=${token}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: [email],
    subject: 'Restablece tu contraseña',
    html: `
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `
  });
}

module.exports = {
  login,
  solicitarReset,
  resetPassword
};
