const express = require('express');
const router = express.Router();
const peticionController = require('../controllers/peticionController');

router.get('/create', peticionController.mostrarFormulario);
router.post('/create', peticionController.createPeticion);

module.exports = router;
