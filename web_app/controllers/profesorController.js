const Profesor = require('../models/profesorModel');
const { esAdmin } = require('../utils/authUtils');

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