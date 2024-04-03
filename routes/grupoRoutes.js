const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/create', requireAdmin, grupoController.createForm);
router.post('/create', requireAdmin, grupoController.createGrupo);

module.exports = router;
