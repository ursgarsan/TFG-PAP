const express = require('express');
const mongoose = require('mongoose');
const profesoresRoutes = require('./routes/profesorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const ejs = require('ejs');

app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

app.use(express.json());

app.use('/profesores', profesoresRoutes);

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});

module.exports = app;
