const express = require('express');
const router = express.Router();
const asignaturaController = require('../controllers/asignaturaController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/', asignaturaController.getAllAsignaturas);
router.get('/create', requireAdmin, asignaturaController.createForm);
router.post('/create', requireAdmin, asignaturaController.createAsignatura);
router.get('/:id', asignaturaController.getAsignaturaDetails);


module.exports = router;
