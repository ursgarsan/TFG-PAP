const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');

router.get('/login', (req, res) => {
  res.render('loginForm', { title: 'Iniciar sesión' });
});

router.post('/login', async (req, res) => {
  const { usuario, pass } = req.body;
  try {
    const admin = await Admin.findOne({ usuario });
    if (!admin) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const contraseñaValida = await bcrypt.compare(pass, admin.pass);
    if (!contraseñaValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    req.session.adminId = admin._id;
    res.redirect('/');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
