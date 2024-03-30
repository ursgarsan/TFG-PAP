const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');

router.get('/create', grupoController.mostrarFormulario);
router.post('/create', grupoController.createGrupo);

module.exports = router;
