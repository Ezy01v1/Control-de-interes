const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getPersonas, exportPersonas } = require('../controllers/personas.controller');

const router = express.Router();

router.use(authenticateToken);
router.get('/', getPersonas);
router.get('/export', exportPersonas);

module.exports = router;
