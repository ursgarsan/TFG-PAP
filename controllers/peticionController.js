const Peticion = require('../models/peticionModel');
const Profesor = require('../models/profesorModel');
const Grupo = require('../models/grupoModel');
const { validationResult } = require('express-validator');

exports.createForm = async (req, res) => {
    try {
      const profesores = await Profesor.find();
      const grupos = await Grupo.find();
      const data = req.body;
      res.render('create/createPeticion', { title: 'Agregar Nueva Petición', profesores, grupos, data });
    } catch (error) {
      console.error('Error al renderizar formulario de petición:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

exports.createPeticion = async (req, res) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const profesores = await Profesor.find();
      const grupos = await Grupo.find();
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = { msg: error.msg };
        console.log(acc);
        return acc;
      }, {});
      return res.render('create/createPeticion', { title: 'Agregar Nueva Petición', data: req.body, errors: errorObj, profesores, grupos });      
    }
    const { profesor, grupo, orden, curso } = req.body;
    const nuevaPeticion = new Peticion({ profesor, grupo, orden, curso });
    await nuevaPeticion.save();

    res.redirect('/');
  } catch (error) {
    console.error('Error al crear petición:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
