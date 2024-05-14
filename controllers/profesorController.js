const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const Asignacion = require('../models/asignacionModel');
const { esAdmin } = require('../utils/authUtils');
const { validationResult } = require('express-validator');

exports.getAllProfesores = async (req, res) => {
  try {
    const profesores = await Profesor.find();
    const title = 'Profesores';
    res.render('list/profesores', { profesores, title });
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deleteProfesor = async (req, res) => {
  try {
    const profesorId = req.params.id;
    await Peticion.deleteMany({ profesor: profesorId });
    await Asignacion.deleteMany({"profesor._id": profesorId});
    await Profesor.findByIdAndDelete(profesorId);
    res.redirect('/profesores');
  } catch (error) {
    console.error('Error al borrar el profesor', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.createForm = async (req, res) => {
  try {
    const data = req.body;
    res.render('create/createProfesor', { title: 'Agregar Nuevo Profesor', data });
  } catch (error) {
    console.error('Error al renderizar formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createProfesor = async (req, res) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = { msg: error.msg };
        return acc;
      }, {});
      return res.render('create/createProfesor', { title: 'Agregar Nuevo Profesor', data: req.body, errors: errorObj });
    }    

    const { orden, nombre, apellidos, uvus, capacidad } = req.body;
    const nuevoProfesor = new Profesor({ orden, nombre, apellidos, uvus, capacidad });
    nuevoProfesor.asignados = 0;
    nuevoProfesor.excedente = 0;
    nuevoProfesor.creditos1 = 0;
    nuevoProfesor.creditos2 = 0;
    await nuevoProfesor.save();
    res.redirect('/profesores'); 
  } catch (error) {
    console.error('Error al crear profesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
