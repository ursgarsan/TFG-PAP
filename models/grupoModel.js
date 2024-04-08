const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dias: [{ type: String, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }],  
  hora_inicio: {
    type: String,
    required: true,
    match: /\d{2}:\d{2}/,
    message: 'El formato de hora debe ser HH:MM'
  },
  hora_fin: {
    type: String,
    required: true,
    match: /\d{2}:\d{2}/,
    message: 'El formato de hora debe ser HH:MM'
  }
  
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
