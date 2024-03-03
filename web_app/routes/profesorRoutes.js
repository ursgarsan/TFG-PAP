const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

router.get('/', profesorController.getAllProfesores);

module.exports = router;
