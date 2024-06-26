const Grupo = require('../models/grupoModel');
const Asignatura = require('../models/asignaturaModel');
const Peticion = require('../models/peticionModel');
const Asignacion = require('../models/asignacionModel');
const { validationResult } = require('express-validator');


exports.createForm = async (req, res) => {
  try {
    const asignaturas = await Asignatura.find({}, '_id acronimo');
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
    const asignaturas = await Asignatura.find({}, '_id acronimo');
    const { tipo, grupo, presencial, cuatrimestre, acreditacion, asignatura_id } = req.body;

    let horario1 = req.body['horario1.dias'] ? {
      dias: req.body['horario1.dias'],
      hora_inicio: req.body['horario1.hora_inicio'],
      hora_fin: req.body['horario1.hora_fin']
    } : null;

    let horario2 = req.body['horario2.dias'] ? {
      dias: req.body['horario2.dias'],
      hora_inicio: req.body['horario2.hora_inicio'],
      hora_fin: req.body['horario2.hora_fin']
    } : null;

    if (!errors.isEmpty()) {
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = { msg: error.msg };
        return acc;
      }, {});
      return res.render('create/createGrupo', { title: 'Agregar Nuevo Grupo', asignaturas, data: req.body, errors: errorObj });
    }

    const nuevoGrupo = new Grupo({ tipo, grupo, cuatrimestre, acreditacion, asignatura_id });

    if (presencial) {
      if (horario1) {
        nuevoGrupo.horario1 = horario1;
      }
      if (horario2) {
        nuevoGrupo.horario2 = horario2;
      }
    }

    nuevoGrupo.peticiones = 0;

    await nuevoGrupo.save();

    await Asignatura.findByIdAndUpdate(asignatura_id, { $push: { grupos: nuevoGrupo._id } });

    res.redirect(`/asignaturas/${asignatura_id}`);
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deleteGrupo = async (req, res) => {
  try {
    const grupoId = req.params.id;
    await Peticion.deleteMany({grupo: grupoId})
    await Asignacion.deleteMany({"grupo._id": grupoId});
    await Asignatura.updateMany({}, { $pull: { grupos: grupoId } });
    await Grupo.deleteMany({ _id: grupoId });
    res.redirect('/asignaturas');
  } catch (error) {
    console.error('Error al borrar el grupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}