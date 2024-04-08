const Grupo = require('../models/grupoModel');
const Asignatura = require('../models/asignaturaModel');
const { validationResult } = require('express-validator');


exports.createForm = async (req, res) => {
  try {
    const asignaturas = await Asignatura.find({}, '_id nombre');
    const data = req.body;
    res.render('create/createGrupo', { title: 'Agregar Nuevo Grupo', asignaturas, data });
  } catch (error) {
    console.error('Error al renderizar formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.createGrupo = async (req, res) => {
  const errors = validationResult(req);
  try {
    const asignaturas = await Asignatura.find({}, '_id nombre');
    const { tipo, grupo, cuatrimestre, acreditacion, curso, horario, asignatura_id } = req.body;
    if (!errors.isEmpty()) {
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = { msg: error.msg };
        return acc;
      }, {});
      return res.render('create/createGrupo', { title: 'Agregar Nuevo Grupo', asignaturas, data: req.body, errors: errorObj });
    }

    const nuevoGrupo = new Grupo({ tipo, grupo, cuatrimestre, acreditacion, curso, horario, asignatura_id });
    await nuevoGrupo.save();

    await Asignatura.findByIdAndUpdate(asignatura_id, { $push: { grupos: nuevoGrupo._id } });

    res.redirect(`/asignaturas/${asignatura_id}`);
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};