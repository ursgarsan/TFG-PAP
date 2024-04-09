const { body } = require('express-validator');

exports.createPeticionValidation = [
  body('profesor').notEmpty().withMessage('El profesor es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  body('orden').notEmpty().withMessage('El orden es requerido'),
  body('curso').notEmpty().withMessage('El curso es requerido'),
];
