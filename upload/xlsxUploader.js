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
        const profesores = [];
        for (const row of data) {
          const profesorData = {
            orden: row.Orden,
            nombre: row.Nombre,
            apellidos: row.Apellidos,
            uvus: row.UVUS,
            capacidad: row.Capacidad
          };
          const profesor = new Profesor(profesorData);
          profesores.push(profesor);
        }
        await Profesor.insertMany(profesores);
        res.redirect(addQueryParams('/profesores', { uploaded: true }));
        break;
      case 'grupos':
        const grupos = [];
        for (const row of data) {
          const asignatura = await Asignatura.findOne({ codigo: String(row.Codigo) });

          if (!asignatura) {
            console.error('No se encontró la asignatura con el código:', String(row.Codigo));
            continue;
          }
        
          const existingGrupo = await Grupo.findOne({
            tipo: row.Tipo,
            grupo: row.Grupo,
            cuatrimestre: row.Cuatrimestre,
            acreditacion: row.Acreditacion,
            curso: row.Curso,
            asignatura_id: asignatura._id
          });
        
          if (existingGrupo) {
            // Verificar si ya existe un horario con las mismas horas
            const existingHorario = existingGrupo.horario.find(item =>
              item.hora_inicio === row.Hora_Inicio && item.hora_fin === row.Hora_Fin
            );
          
            // Si existe un horario con las mismas horas, agregar los nuevos días al horario existente
            if (existingHorario) {
              const nuevosDias = row.Dias.split(',').map(dia => dia.trim());
              for (const dia of nuevosDias) {
                if (!existingHorario.dias.includes(dia)) {
                  existingHorario.dias.push(dia);
                }
              }
              existingGrupo.save();
              continue;
            }
          
            // Si no hay ningún horario con las mismas horas, crear un nuevo objeto de horario y añadirlo al grupo
            const horario = {
              dias: row.Dias.split(',').map(dia => dia.trim()),
              hora_inicio: row.Hora_Inicio,
              hora_fin: row.Hora_Fin
            };
            existingGrupo.horario.push(horario);
            existingGrupo.save();
            continue;
          }
          
          const grupoData = {
            tipo: row.Tipo,
            grupo: row.Grupo,
            cuatrimestre: row.Cuatrimestre,
            acreditacion: row.Acreditacion,
            curso: row.Curso,
            asignatura_id: asignatura._id
            };
        
          const grupo = new Grupo(grupoData);
          const horario = {
            dias: row.Dias.split(',').map(dia => dia.trim()),
            hora_inicio: row.Hora_Inicio,
            hora_fin: row.Hora_Fin
          };
          grupo.horario.push(horario);
          grupos.push(grupo);

          asignatura.grupos.push(grupo._id);
          await asignatura.save();
        }
        await Grupo.insertMany(grupos);
        res.redirect(addQueryParams('/asignaturas', { uploaded: true }));
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
