const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
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
      return res.redirect(await addQueryParams('/', { uploaded: false, error: 'No se ha proporcionado ningún archivo' }));
    }

    const fileExtension = path.extname(file.originalname);
    if (fileExtension.toLowerCase() !== '.xlsx') {
      return res.redirect(await addQueryParams('/', { uploaded: false, error: 'El archivo no es de tipo .xlsx' }));
    }

    try {
      // borra todos los datos existentes
      await Profesor.deleteMany({});
      await Grupo.deleteMany({});
      await Asignatura.deleteMany({});
      await Asignacion.deleteMany({});
      await Peticion.deleteMany({});
  
    } catch (error) {
      console.error('Error al procesar el archivo XLSX:', error);
      res.redirect(await addQueryParams('/', { uploaded: false, error: 'Error al eliminar los datos anteriores' }));
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const fullRange = XLSX.utils.decode_range(worksheet['!ref']);


    const profesorRange = { s: { c: 8, r: 0 }, e: { c: fullRange.e.c, r: 2 } };
    const profesores = XLSX.utils.sheet_to_json(worksheet, { range: XLSX.utils.encode_range(profesorRange), header: 1 });

    for (let i = 0; i < profesores[0].length; i++) {
      try {
        [nombre, apellidos] = await formatNombre(profesores[1][i])
        const profesor = new Profesor({
          prelacion: i,
          nombre: nombre,
          apellidos: apellidos,
          uvus: profesores[0][i],
          capacidad: profesores[2][i],
          excedente: 0.0,
          asignados: 0.0,
          creditos1: 0.0,
          creditos2: 0.0
        });
    
        await profesor.save();
      } catch (error) {
        return res.redirect(await addQueryParams('/', { uploaded: false, error: `Error al guardar el profesor de la columna ${i + 1}: ${error.message}` }));
      }
    }

    const gruposRange = { s: { c: 0, r: 8 }, e: { c: 7, r: fullRange.e.r } };
    const grupos = XLSX.utils.sheet_to_json(worksheet, { range: XLSX.utils.encode_range(gruposRange), header: 1 }); 
    let gruposDB = [];

    for (let i = 0; i < grupos.length; i++) {
      const acronimo = grupos[i][0];
      const asignaturaExistente = await Asignatura.findOne({ acronimo: acronimo });
    
      try {
        if (!asignaturaExistente) {
          const asignatura = new Asignatura({
            acronimo: acronimo,
            grupos:[]
          });
      
          await asignatura.save();
        }        
      } catch (error){
        return res.redirect(await addQueryParams('/', { uploaded: false, error: `Error al guardar la asignatura de la fila ${i + 1}: ${error.message}` }));
      }


      let horario1 = null;
      let horario2 = null;

      if (grupos[i][6]) {
        horario1 = await formatHorario(grupos[i][6]);
      }
      
      if (grupos[i][7]) {
        horario2 = await formatHorario(grupos[i][7]);
      }

      const grupo = new Grupo({
        tipo: grupos[i][1],
        grupo: grupos[i][2],
        cuatrimestre: grupos[i][3],
        acreditacion: grupos[i][4],
        peticiones: 0
      });

      if (horario1) {
        grupo.horario1 = horario1;
      }
      
      if (horario2) {
        grupo.horario2 = horario2;
      }

      const asigCorrespondiente = await Asignatura.findOne({ acronimo: acronimo })
      grupo.asignatura_id = asigCorrespondiente._id;

      await Asignatura.findByIdAndUpdate(
        { _id: asigCorrespondiente._id }, 
        { 
          $push: {
            grupos: grupo._id
          }
        }
      );
    
      gruposDB.push(grupo);

    }
    
    try {
      for (const grupo of gruposDB) {
        try {
            await new Grupo(grupo).save();
        } catch (error) {
            return res.redirect(await addQueryParams('/', { uploaded: false, error: `Error al guardar el grupo: ${JSON.stringify(grupo)}` }));

        }
    }
    } catch (error) {
      res.redirect(await addQueryParams('/', { uploaded: false, error: 'Error al guardar los grupos en la base de datos, asegúrese de que el formato es el acordado' }));
    }

    const peticionesRange = { s: { c: 8, r: 8 }, e: { c: fullRange.e.c, r: fullRange.e.r } };
    const peticiones = XLSX.utils.sheet_to_json(worksheet, { range: XLSX.utils.encode_range(peticionesRange), header: 1 });
    for (let i = 0; i < peticiones.length; i++) {
      for (let j = 0; j < peticiones[i].length; j++) {
        if (peticiones[i][j]) {
          const profesor = await Profesor.findOne({uvus: profesores[0][j]});
          const asignatura = await Asignatura.findOne({acronimo:grupos[i][0]});

          let horario1 = null;
          let horario2 = null;
          
          if (grupos[i][6]) {
              horario1 = await formatHorario(grupos[i][6]);
          }
          
          if (grupos[i][7]) {
              horario2 = await formatHorario(grupos[i][7]);
          }
          
          let query = {
              tipo: grupos[i][1], 
              grupo: grupos[i][2].toString(), 
              cuatrimestre: grupos[i][3].toString(), 
              acreditacion: grupos[i][4], 
              asignatura_id: asignatura._id
          };
          
          if (horario1) {
            query['horario1.dias'] = horario1.dias;
            query['horario1.hora_inicio'] =horario1.hora_inicio
            query['horario1.hora_fin'] =horario1.hora_fin
          }
          
          if (horario2) {
            query['horario2.dias'] = horario2.dias;
            query['horario2.hora_inicio'] =horario2.hora_inicio
            query['horario2.hora_fin'] =horario2.hora_fin
          }
          
          const grupo = await Grupo.findOne(query);

          const peticion = new Peticion ({
            profesor: profesor._id,
            grupo: grupo._id,
            prioridad: peticiones[i][j]
          });

          peticion.save();

          await Grupo.findByIdAndUpdate(
            { _id: grupo._id }, 
            { 
              peticiones: grupo.peticiones + 1
            }
          );
        }
      }
    }
    res.redirect(await addQueryParams('/', { uploaded: true}));
  } catch (error) {
    res.redirect(await addQueryParams('/', { uploaded: false, error: `Error al procesar el archivo ${error}` }));
  }
});

async function addQueryParams(url, params) {
  const urlParams = new URLSearchParams();
  for (const key in params) {
    urlParams.set(key, params[key]);
  }
  return url + '?' + urlParams.toString();
}

async function formatNombre(nombre_original) {
  const [apellidos, nombre] = nombre_original.split(', ');
  return [nombre, apellidos];
}

async function formatHorario(horario) {
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
          dias = [horario_aux[0]];
      }
  } else {
      if (horario.includes(',')) {
          dias = horario.replace('.', '').split(', ');
      } else {
          dias= [horario];
      }

      hora_inicio = '18:30';
      hora_fin = '19:50';
  }
  
  new_horario = {
    'dias': dias.map(dia => dia.replace(/\.|\s/g, '')),
    'hora_inicio': hora_inicio,
    'hora_fin': hora_fin
  }
  
  return new_horario
}

module.exports = router;