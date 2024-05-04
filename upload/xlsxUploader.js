const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const router = express.Router();
const upload = multer();
const Asignatura = require('../models/asignaturaModel');
const Profesor = require('../models/profesorModel');
const Grupo = require('../models/grupoModel');

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

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const fullRange = XLSX.utils.decode_range(worksheet['!ref']);


    const profesorRange = { s: { c: 8, r: 0 }, e: { c: fullRange.e.c, r: 5 } };
    const profesores = XLSX.utils.sheet_to_json(worksheet, { range: XLSX.utils.encode_range(profesorRange), header: 1 });
    
    let profesoresDB = [];
    
      for (let i = 0; i < profesores[0].length; i++) {
        [nombre, apellidos] = formatNombre(profesores[1][i])
        const profesor = new Profesor({
          orden: i,
          nombre: nombre,
          apellidos: apellidos,
          uvus: profesores[0][i],
          capacidad: profesores[2][i],
          excedente: 0.0,
          asignados: 0.0,
          creditos1: 0.0,
          creditos2: 0.0
        });
    
        profesoresDB.push(profesor);
      }
    
    try {
      // await Profesor.insertMany(profesoresDB);
      console.log('Todos los profesores han sido guardados en la base de datos.');
    } catch (error) {
      console.error('Error al guardar los profesores en la base de datos:', error);
      // Aquí puedes manejar el error como prefieras...
    }

    const gruposRange = { s: { c: 0, r: 7 }, e: { c: 7, r: fullRange.e.r } };
    const grupos = XLSX.utils.sheet_to_json(worksheet, { range: XLSX.utils.encode_range(gruposRange), header: 1 }); 

    let gruposDB = [];
    let asignaturasDB = []

    for (let i = 0; i < grupos.length; i++) {
      const acronimo = grupos[i][0];
      const asignaturaExistente = asignaturasDB.find(asignatura => asignatura.acronimo === acronimo);
    
      if (!asignaturaExistente) {
        const asignatura = new Asignatura({
          acronimo: acronimo
        });
    
        asignaturasDB.push(asignatura);
      }

      const grupo = new Grupo({
        tipo: grupos[i][1],
        grupo: grupos[i][2],
        cuatrimestre: grupos[i][3],
        acreditacion: grupos[i][4],
        horario1: grupos[i][6],
        horario2: grupo[i][7]
      });
    
      gruposDB.push(grupo);


    }
    
    // Guarda todos los grupos en la base de datos
    try {
      // await Grupo.insertMany(gruposDB);
      // console.log(asignaturasDB);
      console.log(gruposDB);
      console.log('Todos los grupos han sido guardados en la base de datos.');
    } catch (error) {
      console.error('Error al guardar los grupos en la base de datos:', error);
      // Aquí puedes manejar el error como prefieras...
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

function formatNombre(nombre_original) {
  const [apellidos, nombre] = nombre_original.split(', ');
  return [nombre, apellidos];
}

module.exports = router;