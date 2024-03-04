const express = require('express');
const mongoose = require('mongoose');
const { engine } =require('express-handlebars');
const path = require('path');

const profesoresRoutes = require('./routes/profesorRoutes');
const asignaturasRoutes = require('./routes/asignaturaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  defaultLayout: 'main',
}));
app.set('view engine', '.hbs');

// Definir la ruta para la página de inicio
app.get('/', (req, res) => {
  res.render('index', { title: 'Página de inicio' });
});

app.use(express.json());

// Rutas para otras funcionalidades
app.use('/profesores', profesoresRoutes);
app.use('/asignaturas', asignaturasRoutes);

// Establecer el directorio de vistas
app.set('views', path.join(__dirname, 'views'));

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app;
