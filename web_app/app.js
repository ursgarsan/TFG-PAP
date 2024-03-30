const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { exec } = require('child_process');

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

app.listen(PORT, async () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);

  // Ejecuta el script Python como un proceso secundario
  const child = exec('poblar_bbdd.py');

  child.stdout.on('data', (data) => {
    console.log(`Salida del script de inicialización de la base de datos: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`Error al ejecutar el script de inicialización de la base de datos: ${data}`);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('Script de inicialización de la base de datos ejecutado exitosamente.');
    } else {
      console.error(`El script de inicialización de la base de datos se cerró con el código de salida ${code}.`);
    }
  });
});
