const Peticion = require('../models/peticionModel');
const Profesor = require('../models/profesorModel');
const Grupo = require('../models/grupoModel');

exports.mostrarFormulario = async (req, res) => {
    try {
      const profesores = await Profesor.find();
      const grupos = await Grupo.find();
  
      res.render('createPeticion', { title: 'Agregar Nueva Petición', profesores, grupos });
    } catch (error) {
      console.error('Error al renderizar formulario de petición:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

exports.createPeticion = async (req, res) => {
  try {
    const { profesor, grupo, orden, curso } = req.body;

    const nuevaPeticion = new Peticion({ profesor, grupo, orden, curso });
    await nuevaPeticion.save();

    res.redirect('/');
  } catch (error) {
    console.error('Error al crear petición:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
