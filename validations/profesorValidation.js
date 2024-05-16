const { body } = require('express-validator');

exports.createProfesorValidation = [
  body('prelacion').notEmpty().withMessage('La prelación es requerida'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'), 
  body('apellidos').notEmpty().withMessage('Los apellidos son requeridos'),
  body('uvus').notEmpty().withMessage('El uvus es requerido'),
  body('capacidad').notEmpty().withMessage('La capacidad acreditativa es requerida'),       
];
