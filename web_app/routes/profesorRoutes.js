const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

router.get('/', profesorController.getAllProfesores);
router.get('/create', profesorController.createForm);
router.post('/create', profesorController.createProfesor);

module.exports = router;
