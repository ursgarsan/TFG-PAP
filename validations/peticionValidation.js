const { body } = require('express-validator');

exports.createPeticionValidation = [
  body('profesor').notEmpty().withMessage('El profesor es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  body('prioridad').notEmpty().withMessage('La prioridad es requerida'),
];
