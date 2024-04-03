const Grupo = require('../models/grupoModel');
const Asignatura = require('../models/asignaturaModel');

exports.createForm = async (req, res) => {
  try {
    const asignaturas = await Asignatura.find({}, '_id nombre');
    res.render('create/createGrupo', { title: 'Agregar Nuevo Grupo', asignaturas });
  } catch (error) {
    console.error('Error al renderizar formulario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createGrupo = async (req, res) => {
  try {
    const { tipo, grupo, cuatrimestre, acreditacion, curso, horario, asignatura_id } = req.body;
    const nuevoGrupo = new Grupo({ tipo, grupo, cuatrimestre, acreditacion, curso, horario, asignatura_id });
    await nuevoGrupo.save();

    await Asignatura.findByIdAndUpdate(asignatura_id, { $push: { grupos: nuevoGrupo._id } });

    res.redirect(`/asignaturas/${asignatura_id}`);
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
