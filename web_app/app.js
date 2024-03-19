const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Swal = require('sweetalert2');

const profesoresRoutes = require('./routes/profesorRoutes');
const asignaturasRoutes = require('./routes/asignaturaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

app.set('view engine', 'pug');

app.use(express.json());

app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio' });
});

// Rutas para otras funcionalidades
app.use('/profesores', profesoresRoutes);
app.use('/asignaturas', asignaturasRoutes);

// Establecer el directorio de vistas
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = {app, Swal};
