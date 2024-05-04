const { body } = require('express-validator');

exports.createAsignaturaValidation = [
  body('acronimo').notEmpty().withMessage('El acrónimo es requerido')
];
