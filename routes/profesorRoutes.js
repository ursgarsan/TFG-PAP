const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const { requireAdmin } = require('../utils/authUtils');
const { createProfesorValidation } = require('../validations/profesorValidation');

router.get('/', profesorController.getAllProfesores);
router.get('/create', requireAdmin, profesorController.createForm);
router.post('/create', requireAdmin, createProfesorValidation, profesorController.createProfesor);
router.get('/:id/delete', requireAdmin, profesorController.deleteProfesor);

module.exports = router;
