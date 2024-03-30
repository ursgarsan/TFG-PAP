const Peticion = require('../models/peticionModel');
const Profesor = require('../models/profesorModel'); // Importa el modelo del profesor
const Grupo = require('../models/grupoModel'); // Importa el modelo del grupo

exports.mostrarFormulario = async (req, res) => {
    try {
      const profesores = await Profesor.find(); // Obtiene todos los profesores
      const grupos = await Grupo.find(); // Obtiene todos los grupos
  
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
