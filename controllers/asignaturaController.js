const Asignatura = require('../models/asignaturaModel');
const Grupo = require('../models/grupoModel');
const { validationResult } = require('express-validator');
const Peticion = require('../models/peticionModel');

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
        const asignatura = await Asignatura.findById(asignaturaId).populate('grupos');
        res.render('details/asignaturaDetalles', { asignatura });
        
    } catch (error) {
        console.error('Error al obtener detalles de la asignatura:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.deleteAsignatura = async (req, res) => {
  try {
    const asignaturaId = req.params.id;
    const grupos = (await Grupo.find({asignatura_id: asignaturaId})).map(grupo => grupo._id);
    await Peticion.deleteMany({grupo: {$in: grupos}})
    await Grupo.deleteMany({ asignatura_id: asignaturaId });
    await Asignatura.findByIdAndDelete(asignaturaId);
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al borrar la asignatura y sus grupos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.createForm = async (req, res) => {
  try {
    const data = req.body;
    res.render('create/createAsignatura', { title: 'Agregar Nueva Asignatura', data });
  } catch (error) {
    console.error('Error al renderizar formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createAsignatura = async (req, res) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = { msg: error.msg };
        return acc;
      }, {});
      return res.render('create/createAsignatura', { title: 'Agregar Nueva Asignatura', data: req.body, errors: errorObj });
    }

    const { acronimo } = req.body;
    const nuevaAsignatura = new Asignatura({ acronimo });
    await nuevaAsignatura.save();
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al crear asignatura:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

  
