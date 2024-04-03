const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  dias: [{ type: String, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] }],  
  // hora: {
  //   type: String,
  //   validate: {
  //     validator: function(v) {
  //       return /\d{2}:\d{2}/.test(v);
  //     },
  //     message: props => `${props.value} no es un formato de hora válido. Debe ser HH:MM`
  //   }
  // }
  hora_inicio: String,
  hora_fin: String
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
