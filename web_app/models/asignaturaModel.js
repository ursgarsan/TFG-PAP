const mongoose = require('mongoose');

const asignaturaSchema = new mongoose.Schema({
  nombre: String,
  titulacion: String,
  codigo: String,
  acronimo: String,
  grupos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grupo'
    }
  ]
});

const Asignatura = mongoose.model('asignaturas', asignaturaSchema);

module.exports = Asignatura;
