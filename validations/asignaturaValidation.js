const { body } = require('express-validator');

exports.createAsignaturaValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('titulacion').notEmpty().withMessage('La titulación es requerida'),
  body('codigo').notEmpty().withMessage('El código es requerido'),
  body('acronimo').notEmpty().withMessage('El acrónimo es requerido'),
  body('curso').notEmpty().withMessage('El curso es requerido'),
];
