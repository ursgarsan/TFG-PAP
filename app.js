const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const appRoutes = require('./routes/appRoutes');

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

app.use('/', appRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.listen(PORT, async () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}\n`);
});