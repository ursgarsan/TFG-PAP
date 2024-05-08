const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const profesoresRoutes = require('./routes/profesorRoutes');
const asignaturasRoutes = require('./routes/asignaturaRoutes');
const gruposRoutes = require('./routes/grupoRoutes');
const peticionesRoutes = require('./routes/peticionRoutes');
const asignacionesRoutes = require('./routes/asignacionRoutes');
const authRoutes = require('./routes/authRoutes');
const xlsxUploader = require('./upload/xlsxUploader');
const { requireAdmin } = require('./utils/authUtils');

const Asignacion = require('./models/asignacionModel');
const Asignatura = require('./models/asignaturaModel');
const Profesor = require('./models/profesorModel');
const Peticion = require('./models/peticionModel');
const Grupo = require('./models/grupoModel');


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
app.use('/profesores', profesoresRoutes);
app.use('/asignaturas', asignaturasRoutes);
app.use('/grupos', gruposRoutes);
app.use('/peticiones', peticionesRoutes);
app.use('/asignaciones', asignacionesRoutes);
app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.post('/upload', xlsxUploader);

app.get('/dashboard', requireAdmin, (req, res) => {
  res.render('dashboard');
});

app.get('/clear', requireAdmin, async (req, res) => {
  try {
      await Asignacion.deleteMany({})
      await Peticion.deleteMany({})
      await Profesor.deleteMany({})
      await Grupo.deleteMany({})
      await Asignatura.deleteMany({})
      return res.redirect(await addQueryParams('/dashboard', { uploaded: true }));
  } catch (error) {
    return res.redirect(await addQueryParams('/dashboard', { uploaded: false, error: 'Error al borrar los elementos de la base de datos'  }));
  }

});

app.listen(PORT, async () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}\n`);
});

async function addQueryParams(url, params) {
  const urlParams = new URLSearchParams();
  for (const key in params) {
    urlParams.set(key, params[key]);
  }
  return url + '?' + urlParams.toString();
}
