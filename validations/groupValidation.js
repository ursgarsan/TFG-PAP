const { body } = require('express-validator');
const horaFormato = /^(?:([01]\d|2[0-3]):[0-5]\d)?$/;

exports.createGrupoValidation = [
  body('tipo').notEmpty().withMessage('El tipo es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  body('cuatrimestre').notEmpty().withMessage('El cuatrimestre es requerido'),
  body('acreditacion').notEmpty().withMessage('La acreditación es requerida'),
  body('curso').notEmpty().withMessage('El curso es requerido'),
  body('asignatura_id').notEmpty().withMessage('La asignatura es requerida'),
  body('horario.*.hora_inicio').notEmpty().withMessage('La hora de inicio es requerida').matches(horaFormato).withMessage('El formato de hora de inicio debe ser HH:MM'),
  body('horario.*.hora_fin').notEmpty().withMessage('La hora de fin es requerida').matches(horaFormato).withMessage('El formato de hora de fin debe ser HH:MM'),
  body('horario.*.dias').notEmpty().withMessage('Debe seleccionar al menos un día de la semana')
];