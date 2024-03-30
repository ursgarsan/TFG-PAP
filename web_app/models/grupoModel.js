const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dias: [{ type: String, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }],  
  hora: String
});

const grupoSchema = new mongoose.Schema({
  tipo: String,
  grupo: String,
  cuatrimestre: String,
  acreditacion: String,
  curso: String,
  horario: [horarioSchema],
  asignatura_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asignatura'
  }
});

const Grupo = mongoose.model('grupos', grupoSchema);

module.exports = Grupo;
