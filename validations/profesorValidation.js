const { body } = require('express-validator');

exports.createProfesorValidation = [
  body('orden').notEmpty().withMessage('El acrónimo es requerido'),
  body('nombre').notEmpty().withMessage('El acrónimo es requerido'), 
  body('apellidos').notEmpty().withMessage('El acrónimo es requerido'),
  body('uvus').notEmpty().withMessage('El acrónimo es requerido'),
  body('capacidad').notEmpty().withMessage('El acrónimo es requerido'),       
];
