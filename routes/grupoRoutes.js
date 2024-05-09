const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { requireAdmin } = require('../utils/authUtils');
const { createGrupoValidation } = require('../validations/grupoValidation');

router.get('/create', requireAdmin, grupoController.createForm);
router.post('/create', requireAdmin, createGrupoValidation, grupoController.createGrupo);
router.get('/:id/delete', requireAdmin, grupoController.deleteGrupo);

module.exports = router;
