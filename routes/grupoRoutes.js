const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const { requireAdmin } = require('../utils/authUtils');

const horaFormato = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

router.get('/create', requireAdmin, grupoController.createForm);
const { body } = require('express-validator');

router.post('/create', requireAdmin, [
  body('tipo').notEmpty().withMessage('El tipo es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  body('cuatrimestre').notEmpty().withMessage('El cuatrimestre es requerido'),
  body('acreditacion').notEmpty().withMessage('La acreditación es requerida'),
  body('curso').notEmpty().withMessage('El curso es requerido'),
//   body('horario.*.hora_inicio').matches(horaFormato).withMessage('El formato de hora de inicio debe ser HH:MM'),
//   body('horario.*.hora_fin').matches(horaFormato).withMessage('El formato de hora de fin debe ser HH:MM'),
], grupoController.createGrupo);


module.exports = router;
