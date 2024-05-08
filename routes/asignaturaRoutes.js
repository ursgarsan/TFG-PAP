const express = require('express');
const router = express.Router();
const asignaturaController = require('../controllers/asignaturaController');
const { requireAdmin } = require('../utils/authUtils');
const { createAsignaturaValidation } = require('../validations/asignaturaValidation');

router.get('/', asignaturaController.getAllAsignaturas);
router.get('/create', requireAdmin, asignaturaController.createForm);
router.post('/create', requireAdmin, createAsignaturaValidation, asignaturaController.createAsignatura);
router.get('/:id', asignaturaController.getAsignaturaDetails);
router.get('/:id/delete', requireAdmin, asignaturaController.deleteAsignatura);


module.exports = router;
