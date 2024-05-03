const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const Profesor = require('./models/profesorModel');
const { requireAdmin } = require('./utils/authUtils');

const profesoresRoutes = require('./routes/profesorRoutes');
const asignaturasRoutes = require('./routes/asignaturaRoutes');
const gruposRoutes = require('./routes/grupoRoutes');
const peticionesRoutes = require('./routes/peticionRoutes');
const asignacionesRoutes = require('./routes/asignacionRoutes');
const authRoutes = require('./routes/authRoutes');
const xlsxUploader = require('./upload/xlsxUploader');


const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:\n', err));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const pass = crypto.randomBytes(32).toString('hex');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: pass,
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.isAdminLoggedIn = req.session.adminId ? true : false;
  next();
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio'});
});

// Rutas para otras funcionalidades
app.post('/upload', requireAdmin, xlsxUploader);
app.use('/profesores', profesoresRoutes);
app.use('/asignaturas', asignaturasRoutes);
app.use('/grupos', gruposRoutes);
app.use('/peticiones', peticionesRoutes);
app.use('/asignaciones', asignacionesRoutes);
app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.listen(PORT, async () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}\n`);
});
