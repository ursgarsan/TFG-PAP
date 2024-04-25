const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
  orden: Number,
  nombre: String,
  apellidos: String,
  uvus: String,
  capacidad: Number,
  asignados: Number,
  excedente: Number
});

const Profesor = mongoose.model('profesores', profesorSchema);

module.exports = Profesor;
