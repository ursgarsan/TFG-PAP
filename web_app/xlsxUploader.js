const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const router = express.Router();
const upload = multer();
const Asignatura = require('./models/asignaturaModel');

router.post('/upload', upload.single('xlsxFile'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.redirect('/asignaturas?uploaded=false&error=No se ha proporcionado ningún archivo');
    }

    // Verificar que el archivo sea de tipo xlsx
    const fileExtension = path.extname(file.originalname);
    if (fileExtension.toLowerCase() !== '.xlsx') {
      return res.redirect('/asignaturas?uploaded=false&error=El archivo no es de tipo .xlsx');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const asignaturas = [];

    // Recorrer los datos y crear instancias de Asignatura
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

    res.redirect('/asignaturas?uploaded=true');
  } catch (error) {
    console.error('Error al procesar el archivo XLSX:', error);
    res.redirect('/asignaturas?uploaded=false&error=Error al procesar el archivo XLSX');
  }
});


module.exports = router;
