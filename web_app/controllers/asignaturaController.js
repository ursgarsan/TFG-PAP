const Asignatura = require('../models/asignaturaModel');

exports.getAllAsignaturas = async (req, res) => {
    try {
      const asignaturas = await Asignatura.find();
      const title = 'Asignaturas';
      res.render('asignaturas', { asignaturas, title});
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
  