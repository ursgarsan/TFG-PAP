const mongoose = require('mongoose');

const grupoSchema = new mongoose.Schema({
  tipo: String,
  grupo: String,
  cuatrimestre: String,
  acreditacion: String,
  curso: String,
  horario: [String],
  asignatura_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asignatura'
  }
});

const Grupo = mongoose.model('grupos', grupoSchema);

module.exports = Grupo;
