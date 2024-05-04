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
const Asignacion = require('../models/asignacionModel');
const Peticion = require('../models/peticionModel');

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

    try {
      // Borrar todos los datos existentes
      await Profesor.deleteMany({});
      await Grupo.deleteMany({});
      await Asignatura.deleteMany({});
      await Asignacion.deleteMany({});
      await Peticion.deleteMany({});
  
      // El resto de tu código...
    } catch (error) {
      console.error('Error al procesar el archivo XLSX:', error);
      res.redirect(addQueryParams('/asignaturas', { uploaded: false, error: 'Error al procesar el archivo XLSX' }));
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
      await Profesor.insertMany(profesoresDB);
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

      let horario1 = null;
      let horario2 = null;

      if (grupos[i][6]) {
        horario1 = formatHorario(grupos[i][6]);
      }
      
      if (grupos[i][7]) {
        horario2 = formatHorario(grupos[i][7]);
      }

      const grupo = new Grupo({
        tipo: grupos[i][1],
        grupo: grupos[i][2],
        cuatrimestre: grupos[i][3],
        acreditacion: grupos[i][4]
      });

      if (horario1) {
        grupo.horario1 = horario1;
      }
      
      if (horario2) {
        grupo.horario2 = horario2;
      }
    
      gruposDB.push(grupo);

    }
    
    try {
      await Grupo.insertMany(gruposDB);
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

function formatHorario(horario) {
  let new_horario = {};
  let horario_aux;
  let hora_inicio;
  let hora_fin;
  let dias;

  if (horario.includes(' - ')) {
      horario_aux = horario.replace('.', '').split(' - ');

      if (horario_aux[1].includes(' a ')) {
          const horas = horario_aux[1].split(' a ');
          hora_inicio = horas[0];
          hora_fin = horas[1];
      } else {
          hora_inicio= horario_aux[1];
          let horas_aux = parseInt(horario_aux[1].split(':')[0]);
          let minutos_aux = parseInt(horario_aux[1].split(':')[1]);

          horas_aux +=1;
          minutos_aux +=50;

          if (minutos_aux>60) {
              horas_aux +=1;
              minutos_aux -=60;
          }
          hora_fin= `${horas_aux}:${minutos_aux}`;
      }

      if(horario_aux[0].includes(',')) {
          dias = horario_aux[0].split(', ');
      } else {
          dias = horario_aux[0];
      }
  } else {
      if (horario.includes(',')) {
          dias = horario.replace('.', '').split(', ');
      } else {
          dias= horario;
      }

      hora_inicio = '18:30';
      hora_fin = '19:50';
  }
  
  new_horario = {
      'dias': dias,
      'hora_inicio': hora_inicio,
      'hora_fin': hora_fin
  }
  
  return new_horario
}

module.exports = router;