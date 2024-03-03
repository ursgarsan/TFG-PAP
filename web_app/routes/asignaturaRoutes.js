const express = require('express');
const router = express.Router();
const asignaturaController = require('../controllers/asignaturaController');

router.get('/', asignaturaController.getAllAsignaturas);

module.exports = router;
