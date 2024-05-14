const { body, check } = require('express-validator');

exports.createGrupoValidation = [
  body('tipo').notEmpty().withMessage('El tipo es requerido').matches(/^[A-Z]?$/).withMessage('El tipo debe ser una única letra en mayúsculas'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  body('cuatrimestre').notEmpty().withMessage('El cuatrimestre es requerido'),
  body('acreditacion').notEmpty().withMessage('La acreditación es requerida'),
  body('asignatura_id').notEmpty().withMessage('La asignatura es requerida'),
  body('presencial').customSanitizer(value => {
    return value === 'true';
  }),
  body('horario1.hora_inicio').if((value, { req }) => req.body.presencial === true).notEmpty().withMessage('La hora de inicio es requerida').matches(/^(?:([01]\d|2[0-3]):[0-5]\d)?$/).withMessage('El formato de hora de inicio debe ser HH:MM y válido').custom((value, { req }) => {
    const hora_inicio = req.body['horario1.hora_inicio'];
    const hora_fin = req.body['horario1.hora_fin'];    
    if (hora_inicio && hora_fin) {
        const horaInicio = new Date(`2000-01-01T${hora_inicio}`);
        const horaFin = new Date(`2000-01-01T${hora_fin}`);
        horaInicio.setFullYear(2000, 0, 1);
        horaFin.setFullYear(2000, 0, 1);
        if (horaInicio >= horaFin) {
          throw new Error('La hora de inicio debe ser anterior a la de fin');
        }
    }
    return true;
  }),
  body('horario1.hora_fin').if((value, { req }) => req.body.presencial === true).notEmpty().withMessage('La hora de fin es requerida').matches(/^(?:([01]\d|2[0-3]):[0-5]\d)?$/).withMessage('El formato de hora de fin debe ser HH:MM y válido'),
  body('horario1.dias').if((value, { req }) => req.body.presencial === true).notEmpty().withMessage('Debe seleccionar al menos un día de la semana'),
  body('horario2.hora_inicio').custom((value, { req }) => {
    if (value && (!req.body['horario2.hora_fin'] || !req.body['horario2.dias'])) {
      return false;
    }
    return true;
  }).withMessage('Se debe terminar de definir el horario antes de guardarlo'),
  body('horario2.hora_fin').custom((value, { req }) => {
    if (value && (!req.body['horario2.hora_inicio'] || !req.body['horario2.dias'])) {
      return false;
    }
    return true;
  }).withMessage('Se debe terminar de definir el horario antes de guardarlo'),
  body('horario2.dias').custom((value, { req }) => {
    if (value && (!req.body['horario2.hora_inicio'] || !req.body['horario2.hora_fin'])) {
      return false;
    }
    return true;
  }).withMessage('Se debe terminar de definir el horario antes de guardarlo'),
  body('horario2.hora_inicio').custom((value, { req }) => {
    if (value && (!req.body['horario1.hora_inicio'] || !req.body['horario1.hora_fin'] || !req.body['horario1.dias'])) {
      return false;
    }
    return true;
  }).withMessage('Antes de definir un horario de la primera semana debe establecer el horario fijo'),
  body('horario2.hora_fin').custom((value, { req }) => {
    if (value && (!req.body['horario1.hora_inicio'] || !req.body['horario1.hora_fin'] || !req.body['horario1.dias'])) {
      return false;
    }
    return true;
  }).withMessage('Antes de definir un horario de la primera semana debe establecer el horario fijo'),
  body('horario2.dias').custom((value, { req }) => {
    if (value && (!req.body['horario1.hora_inicio'] || !req.body['horario1.hora_fin'] || !req.body['horario1.dias'])) {
      return false;
    }
    return true;
  }).withMessage('Antes de definir un horario de la primera semana debe establecer el horario fijo'), 
];