const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { exec } = require('child_process');

const profesoresRoutes = require('./routes/profesorRoutes');
const asignaturasRoutes = require('./routes/asignaturaRoutes');
const gruposRoutes = require('./routes/grupoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => console.log('Conexión exitosa a MongoDB\n'))
  .catch(err => console.error('Error al conectar a MongoDB:\n', err));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio' });
});

// Rutas para otras funcionalidades
app.use('/profesores', profesoresRoutes);
app.use('/asignaturas', asignaturasRoutes);
app.use('/grupos', gruposRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, async () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}\n`);

  // Ejecuta el script Python para la inicialización de la base de datos Mongo
  // const child = exec('poblar_bbdd.py');

  // child.stdout.on('data', (data) => {
  //   console.log(`Salida del script de inicialización de la base de datos:\n${data}`);
  // });

  // child.stderr.on('data', (data) => {
  //   console.error(`Error al ejecutar el script de inicialización de la base de datos:\n${data}`);
  // });

  // child.on('close', (code) => {
  //   if (code === 0) {
  //     console.log('Script de inicialización de la base de datos ejecutado exitosamente.');
  //   } else {
  //     console.error(`El script de inicialización de la base de datos se cerró con el código de salida ${code}.`);
  //   }
  // });
});
