const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/', asignacionController.getAllAsignaciones);
router.get('/crear', requireAdmin, asignacionController.crearAsignaciones);
router.get('/generar', requireAdmin, asignacionController.generarAsignaciones);
router.get('/exportar', requireAdmin, asignacionController.exportarAsignaciones);

module.exports = router;