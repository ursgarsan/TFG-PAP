const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/', profesorController.getAllProfesores);
router.get('/create', requireAdmin, profesorController.createForm);
router.post('/create', requireAdmin, profesorController.createProfesor);

module.exports = router;
