const mongoose = require('mongoose');

const asignaturaSchema = new mongoose.Schema({
  acronimo: String,
  grupos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'grupos'
    }
  ]
});

const Asignatura = mongoose.model('asignaturas', asignaturaSchema);

module.exports = Asignatura;
