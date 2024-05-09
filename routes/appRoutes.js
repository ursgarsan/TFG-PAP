const express = require('express');
const router = express.Router();
const xlsxUploader = require('../upload/xlsxUploader');
const { requireAdmin } = require('../utils/authUtils');
const Asignacion = require('../models/asignacionModel');
const Asignatura = require('../models/asignaturaModel');
const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const Grupo = require('../models/grupoModel');

const profesoresRoutes = require('../routes/profesorRoutes');
const asignaturasRoutes = require('../routes/asignaturaRoutes');
const gruposRoutes = require('../routes/grupoRoutes');
const peticionesRoutes = require('../routes/peticionRoutes');
const asignacionesRoutes = require('../routes/asignacionRoutes');
const authRoutes = require('../routes/authRoutes');

router.get('/', (req, res) => {
  res.render('index', { title: 'Inicio'});
});

router.post('/upload', xlsxUploader);

router.get('/clear', requireAdmin, async (req, res) => {
  try {
      await Asignacion.deleteMany({})
      await Peticion.deleteMany({})
      await Profesor.deleteMany({})
      await Grupo.deleteMany({})
      await Asignatura.deleteMany({})
      return res.redirect(await addQueryParams('/', { uploaded: true }));
  } catch (error) {
    return res.redirect(await addQueryParams('/', { uploaded: false, error: 'Error al borrar los elementos de la base de datos'  }));
  }
});

router.use('/profesores', profesoresRoutes);
router.use('/asignaturas', asignaturasRoutes);
router.use('/grupos', gruposRoutes);
router.use('/peticiones', peticionesRoutes);
router.use('/asignaciones', asignacionesRoutes);
router.use('/auth', authRoutes);

async function addQueryParams(url, params) {
  const urlParams = new URLSearchParams();
  for (const key in params) {
    urlParams.set(key, params[key]);
  }
  return url + '?' + urlParams.toString();
}

module.exports = router;