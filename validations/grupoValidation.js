const { body } = require('express-validator');
const horaFormato = /^(?:([01]\d|2[0-3]):[0-5]\d)?$/;
const cursoFormato = /^(?:\d{4}-\d{4})?$/;

exports.createGrupoValidation = [
  body('tipo').notEmpty().withMessage('El tipo es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  body('cuatrimestre').notEmpty().withMessage('El cuatrimestre es requerido'),
  body('acreditacion').notEmpty().withMessage('La acreditación es requerida'),
  body('curso').notEmpty().withMessage('El curso es requerido').matches(cursoFormato).withMessage('El formato del curso debe ser YYYY-YYYY'),
  body('asignatura_id').notEmpty().withMessage('La asignatura es requerida'),
  body('horario.*.hora_inicio').notEmpty().withMessage('La hora de inicio es requerida').matches(horaFormato).withMessage('El formato de hora de inicio debe ser HH:MM y válido').custom((value, { req }) => {
    const horarios = req.body.horario;
    if (horarios) {
      for (const horario of horarios) {
        if (horario.hora_inicio && horario.hora_fin) {
          const horaInicio = new Date(`2000-01-01T${horario.hora_inicio}`);
          const horaFin = new Date(`2000-01-01T${horario.hora_fin}`);
          if (horaInicio >= horaFin) {
            throw new Error('La hora de inicio debe ser anterior a la hora de fin');
          }
        }
      }
    }
    return true;
  }),
  body('horario.*.hora_fin').notEmpty().withMessage('La hora de fin es requerida').matches(horaFormato).withMessage('El formato de hora de fin debe ser HH:MM y válido'),
  body('horario.*.dias').notEmpty().withMessage('Debe seleccionar al menos un día de la semana'),
  body('horario.*.hora_inicio')
];
