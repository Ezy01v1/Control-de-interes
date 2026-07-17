const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getPersonas, exportPersonas } = require('../controllers/personas.controller');

const router = express.Router();

router.use(authenticateToken);
router.get('/', authorizeRoles('pastor', 'junta'), getPersonas);
router.get('/export', authorizeRoles('pastor', 'junta'), exportPersonas);

module.exports = router;
