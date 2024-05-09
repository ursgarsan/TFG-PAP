const express = require('express');
const router = express.Router();
const peticionController = require('../controllers/peticionController');
const { createPeticionValidation } = require('../validations/peticionValidation');
const { requireAdmin } = require('../utils/authUtils');

router.get('/create', peticionController.createForm);
router.post('/create', createPeticionValidation, peticionController.createPeticion);
router.get('/', peticionController.getPeticiones);
router.get('/:id/delete', requireAdmin, peticionController.deletePeticion);

module.exports = router;
