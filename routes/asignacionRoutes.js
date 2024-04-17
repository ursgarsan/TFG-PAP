const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const { requireAdmin } = require('../utils/authUtils');

router.get('/', asignacionController.createAsignaciones); //hay que ponerlo en create y que se necesita admin pero para agilizar esta provisional asi


module.exports = router;
