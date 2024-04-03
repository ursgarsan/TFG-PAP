const Asignatura = require('../models/asignaturaModel');
const Grupo = require('../models/grupoModel');

exports.getAllAsignaturas = async (req, res) => {
    try {
      const asignaturas = await Asignatura.find();
      const title = 'Asignaturas';
      res.render('list/asignaturas', { asignaturas, title});
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  exports.getAsignaturaDetails = async (req, res) => {
    try {
        const asignaturaId = req.params.id;
        const asignatura = await Asignatura.findById(asignaturaId);
        const gruposPromises = asignatura.grupos.map(async (grupoId) => {
            return await Grupo.findById(grupoId);
        });
        const grupos = await Promise.all(gruposPromises);
        res.render('details/asignaturaDetalles', { asignatura, grupos });
        
    } catch (error) {
        console.error('Error al obtener detalles de la asignatura:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.createForm = async (req, res) => {
  try {
    res.render('create/createAsignatura', { title: 'Agregar Nueva Asignatura' });
  } catch (error) {
    console.error('Error al renderizar formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createAsignatura = async (req, res) => {
  try {
    const { nombre, titulacion, codigo, acronimo, curso } = req.body;
    const nuevaAsignatura = new Asignatura({ nombre, titulacion, codigo, acronimo, curso });
    await nuevaAsignatura.save();
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al crear asignatura:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
  
