const Peticion = require('../models/peticionModel');
const Profesor = require('../models/profesorModel');
const Grupo = require('../models/grupoModel');
const { validationResult } = require('express-validator');

exports.createForm = async (req, res) => {
    try {
      const profesores = await Profesor.find();
      const grupos = await Grupo.find().populate('asignatura_id');
      const data = req.body;
      res.render('create/createPeticion', { title: 'Agregar Nueva Petición', profesores, grupos, data });
    } catch (error) {
      console.error('Error al renderizar formulario de petición:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

exports.getPeticiones = async (req, res) => {
  try {
    const title = 'Peticiones';
    const peticiones = await Peticion.find()
    .populate('profesor')
    .populate({
      path: 'grupo',
      populate: { path: 'asignatura_id' }
    });
    res.render('list/peticiones', { peticiones, title});
  } catch (error) {
    console.error('Error al obtener peticiones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.createPeticion = async (req, res) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const profesores = await Profesor.find();
      const grupos = await Grupo.find();
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = { msg: error.msg };
        return acc;
      }, {});
      return res.render('create/createPeticion', { title: 'Agregar Nueva Petición', data: req.body, errors: errorObj, profesores, grupos });      
    }
    const { profesor, grupo, prioridad } = req.body;
    const nuevaPeticion = new Peticion({ profesor, grupo, prioridad });
    await nuevaPeticion.save();
    
    const grupoBD = await Grupo.findById(grupo);
    await Grupo.findByIdAndUpdate( 
      { _id: grupo }, 
      { 
          peticiones: grupoBD.peticiones + 1              
      } 
  ); 

    res.redirect('/');
  } catch (error) {
    console.error('Error al crear petición:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deletePeticion = async (req, res) => {
  try {
    const peticionId = req.params.id;
    await Peticion.deleteMany({_id: peticionId});
    res.redirect('/peticiones');
  } catch (error) {
    console.error('Error al borrar la petición:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
