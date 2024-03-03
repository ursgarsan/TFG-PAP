const mongoose = require('mongoose');

const asignaturaSchema = new mongoose.Schema({
  nombre: String,
  titulacion: String,
  codigo: String,
  acronimo: String
});

const Asignatura = mongoose.model('asignaturas', asignaturaSchema);

module.exports = Asignatura;
