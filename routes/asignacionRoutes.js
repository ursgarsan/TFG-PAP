const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/', asignacionController.getAllAsignaciones);
router.get('/create', requireAdmin, asignacionController.crearAsignaciones);
router.get('/generate', requireAdmin, asignacionController.generarAsignaciones);
router.get('/export', requireAdmin, asignacionController.exportarAsignaciones);

module.exports = router;