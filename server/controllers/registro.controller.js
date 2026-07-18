const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

function validateRegistro(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  return next();
}

const registroRules = [
  body('nombre_completo').trim().notEmpty().withMessage('El nombre completo es obligatorio.'),
  body('correo').isEmail().withMessage('El correo no tiene un formato válido.'),
  body('codigo_postal').trim().notEmpty().withMessage('El código postal es obligatorio.'),
  body('edad').isInt({ min: 1, max: 120 }).withMessage('La edad debe estar entre 1 y 120 años.')
];

async function registrarPersona(req, res) {
  const { nombre_completo, correo, codigo_postal, edad, evento_descripcion } = req.body;

  const nombre = String(nombre_completo || '').trim();
  const correoNormalizado = String(correo || '').trim().toLowerCase();
  const codigoPostal = String(codigo_postal || '').trim();
  const edadNumerica = Number(edad);
  const descripcion = String(evento_descripcion || '').trim();

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre completo es obligatorio.' });
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado);
  if (!correoValido) {
    return res.status(400).json({ message: 'El correo no tiene un formato válido.' });
  }

  if (!codigoPostal) {
    return res.status(400).json({ message: 'El código postal es obligatorio.' });
  }

  if (!Number.isInteger(edadNumerica) || edadNumerica < 1 || edadNumerica > 120) {
    return res.status(400).json({ message: 'La edad debe estar entre 1 y 120 años.' });
  }

  try {
    await pool.execute(
      `INSERT INTO personas (nombre_completo, correo, codigo_postal, edad, evento_descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, correoNormalizado, codigoPostal, edadNumerica, descripcion || null]
    );

    return res.status(201).json({ message: '¡Gracias, tu información fue registrada!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo guardar el registro.' });
  }
}

module.exports = {
  registroRules,
  validateRegistro,
  registrarPersona
};
