const express = require('express');
const rateLimit = require('express-rate-limit');
const { getIglesiasPublicas, registrarPersona, registroRules, validateRegistro } = require('../controllers/registro.controller');

const router = express.Router();

const registroLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.' }
});

router.get('/iglesias', getIglesiasPublicas);
router.post('/registro', registroLimiter, registroRules, validateRegistro, registrarPersona);

module.exports = router;
