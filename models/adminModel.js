const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  usuario: String,
  pass: String
});

const Admin = mongoose.model('administradores', adminSchema);

module.exports = Admin;