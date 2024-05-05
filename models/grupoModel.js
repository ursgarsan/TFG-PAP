const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dias: [{ type: String, enum: ['L', 'Ma', 'Mi', 'J', 'V'] }],    
  hora_inicio: {
    type: String,
    required: true,
    match: /\d{1,2}:\d{2}/,
    message: 'El formato de hora debe ser HH:MM'
  },
  hora_fin: {
    type: String,
    required: true,
    match: /\d{1,2}:\d{2}/,
    message: 'El formato de hora debe ser HH:MM'
  }
  
});

const grupoSchema = new mongoose.Schema({
  tipo: String,
  grupo: String,
  cuatrimestre: String,
  acreditacion: Number,
  peticiones: Number,
  horario1: horarioSchema,
  horario2: horarioSchema,
  asignatura_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'asignaturas'
  }
});

const Grupo = mongoose.model('grupos', grupoSchema);

module.exports = Grupo;
