const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const { esAdmin } = require('../utils/authUtils');

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
    await Profesor.findByIdAndDelete(profesorId);
    res.redirect('/profesores');
  } catch (error) {
    console.error('Error al borrar el profesor', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.createForm = async (req, res) => {
  try {
    res.render('create/createProfesor', { title: 'Agregar Nuevo Profesor' });
  } catch (error) {
    console.error('Error al renderizar formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createProfesor = async (req, res) => {
  try {
    const { orden, nombre, apellidos, uvus, capacidad } = req.body;
    const nuevoProfesor = new Profesor({ orden, nombre, apellidos, uvus, capacidad });
    await nuevoProfesor.save();
    res.redirect('/profesores'); 
  } catch (error) {
    console.error('Error al crear profesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
