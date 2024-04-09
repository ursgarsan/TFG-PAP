const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');

exports.loginForm = (req, res) => {
  const data = req.body;
  res.render('login/loginForm', { title: 'Iniciar sesión', data });
};

exports.login = async (req, res) => {
  const { usuario, pass } = req.body;
  const errors = {}; // Objeto para almacenar los errores

  try {
    const admin = await Admin.findOne({ usuario });
    if (!admin) {
      errors.user = 'Usuario no encontrado';
    } else {
      const contraseñaValida = await bcrypt.compare(pass, admin.pass);
      if (!contraseñaValida) {
        errors.pass = 'Contraseña incorrecta';
      } else {
        req.session.adminId = admin._id;
        return res.redirect('/');
      }
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }

  res.render('login/loginForm', { title: 'Iniciar sesión', data: req.body, errors });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};



exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
