const express = require('express');
const { login, solicitarReset, resetPassword } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.post('/solicitar-reset', solicitarReset);
router.post('/reset-password', resetPassword);

module.exports = router;
