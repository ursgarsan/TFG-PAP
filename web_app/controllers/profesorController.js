const Profesor = require('../models/profesorModel');

exports.getAllProfesores = async (req, res) => {
    try {
      const profesores = await Profesor.find();
      res.render('profesores', { profesores });
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
  
