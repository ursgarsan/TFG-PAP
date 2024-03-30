const express = require('express');
const router = express.Router();
const asignaturaController = require('../controllers/asignaturaController');

router.get('/', asignaturaController.getAllAsignaturas);
router.get('/create', asignaturaController.createForm);
router.post('/create', asignaturaController.createAsignatura);
router.get('/:id', asignaturaController.getAsignaturaDetails);


module.exports = router;
