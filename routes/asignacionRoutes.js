const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/', asignacionController.getAllAsignaciones);
router.get('/create', asignacionController.crearAsignaciones);
router.get('/generate', asignacionController.generarAsignaciones);
router.get('/export', asignacionController.exportarAsignaciones);

module.exports = router;