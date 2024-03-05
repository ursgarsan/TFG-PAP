const Profesor = require('../models/profesorModel');

exports.getAllProfesores = async (req, res) => {
    try {
      const profesores = await Profesor.find();
      const title = 'Profesores';
      res.render('profesores', { profesores, title });
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
  
