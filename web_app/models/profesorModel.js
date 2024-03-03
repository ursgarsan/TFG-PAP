const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
  orden: Number,
  nombre: String,
  uvus: String,
  capacidad: Number
});

const Profesor = mongoose.model('profesores', profesorSchema);

module.exports = Profesor;
