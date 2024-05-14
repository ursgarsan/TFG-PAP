const { body } = require('express-validator');

exports.createAsignaturaValidation = [
  body('acronimo').notEmpty().withMessage('El acrónimo es requerido').matches(/[a-zA-Z]/).withMessage('El acrónimo no puede ser un valor únicamente numérico')
];
