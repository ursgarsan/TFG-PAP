const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/create', requireAdmin, asignacionController.createAsignaciones);

module.exports = router;