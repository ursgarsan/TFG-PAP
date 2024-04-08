const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { requireAdmin } = require('../utils/authUtils');
const { createGrupoValidation } = require('../validations/groupValidation');

router.get('/create', requireAdmin, grupoController.createForm);
router.post('/create', requireAdmin, createGrupoValidation, grupoController.createGrupo);

module.exports = router;
