const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const router = express.Router();
const upload = multer();
const Asignatura = require('./models/asignaturaModel');
const Profesor = require('./models/profesorModel');
const Grupo = require('./models/grupoModel');

router.post('/upload', upload.single('xlsxFile'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.redirect(addQueryParams('/asignaturas', { uploaded: false, error: 'No se ha proporcionado ningún archivo' }));
    }

    const fileExtension = path.extname(file.originalname);
    if (fileExtension.toLowerCase() !== '.xlsx') {
      return res.redirect(addQueryParams('/asignaturas', { uploaded: false, error: 'El archivo no es de tipo .xlsx' }));
    }

    const fileName = file.originalname;
    let prefix = '';
    if (fileName.startsWith('asignatura')) {
      prefix = 'asignatura';
    } else if (fileName.startsWith('profesores')) {
      prefix = 'profesores';
    } else if (fileName.startsWith('grupos')) {
      prefix = 'grupos';
    } else {
      return res.redirect(addQueryParams('/asignaturas', { uploaded: false, error: 'Nombre de archivo no reconocido' }));
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Dependiendo del prefijo, realiza la acción correspondiente
    switch (prefix) {
      case 'asignatura':
        const asignaturas = [];
        for (const row of data) {
          const asignaturaData = {
            nombre: row.Nombre,
            titulacion: row.Titulacion,
            codigo: row.Codigo,
            acronimo: row.Acronimo,
            curso: row.Curso
          };
          const asignatura = new Asignatura(asignaturaData);
          asignaturas.push(asignatura);
        }
        await Asignatura.insertMany(asignaturas);
        res.redirect(addQueryParams('/asignaturas', { uploaded: true }));
        break;
      case 'profesores':
        // Lógica para cargar datos de profesores
        break;
      case 'grupos':
        // Lógica para cargar datos de grupos
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Error al procesar el archivo XLSX:', error);
    res.redirect(addQueryParams('/asignaturas', { uploaded: false, error: 'Error al procesar el archivo XLSX' }));
  }
});

function addQueryParams(url, params) {
  const urlParams = new URLSearchParams();
  for (const key in params) {
    urlParams.set(key, params[key]);
  }
  return url + '?' + urlParams.toString();
}

module.exports = router;
