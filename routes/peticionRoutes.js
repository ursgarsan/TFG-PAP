const express = require('express');
const router = express.Router();
const peticionController = require('../controllers/peticionController');
const { createPeticionValidation } = require('../validations/peticionValidation');

router.get('/create', peticionController.createForm);
router.post('/create', createPeticionValidation, peticionController.createPeticion);
router.get('/', peticionController.getPeticiones);

module.exports = router;
