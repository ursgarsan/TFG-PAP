const { body } = require('express-validator');

exports.createProfesorValidation = [
  body('orden').notEmpty().withMessage('El orden es requerido'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'), 
  body('apellidos').notEmpty().withMessage('Los apellidos son requeridos'),
  body('uvus').notEmpty().withMessage('El uvus es requerido'),
  body('capacidad').notEmpty().withMessage('La capacidad acreditativa es requerida'),       
];
