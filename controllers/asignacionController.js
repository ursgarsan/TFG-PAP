const Grupo = require('../models/grupoModel');
const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const Asignacion = require('../models/asignacionModel');
const Asignatura = require('../models/asignaturaModel');
const fs = require('fs');
const ExcelJS = require('exceljs');

let index = 0;
let limCuatrimestre = 12;
let asignaciones = [];
let memoria = new Set();
let peticiones;
let profesores;
let gruposPendientes;
let numGrupos;
let numProf;

(async function() {
    ({ peticiones, profesores, gruposPendientes, numGrupos, numProf } = await getData());
})();

exports.crearAsignaciones = (req, res) => {
    res.render('loading');
}

exports.generarAsignaciones = async (req, res) => {
    await generaAsignaciones();
    res.status(200).send();
}

async function crearAsignacionObj(profesor, grupo, index) {
    return {
        profesor: profesor,
        grupo: grupo,
        orden: index
    };
}

async function getData() {
    let profesoresRaw = await Profesor.find();
    profesoresRaw = profesoresRaw.sort((a, b) => a.orden - b.orden);
    let numProf = profesoresRaw.length;
    const peticionesRaw = await Peticion.find();
    const gruposRaw = await Grupo.find();
    let numGrupos = gruposRaw.length;
    let peticiones = [];
    let profesores = [];
    let gruposPendientes = gruposRaw.map(grupo => grupo._id.toString());
    let orden = 0;

    for (const profesor of profesoresRaw) {
        let peticionesProfesor = peticionesRaw.filter(peticion => peticion.profesor.equals(profesor._id));
        peticionesProfesor = peticionesProfesor.sort((a, b) => a.orden - b.orden);

        let profesorObj = {
            _id:profesor._id,
            orden: profesor.orden,
            uvus: profesor.uvus,
            capacidad: profesor.capacidad,
            creditos1: 0.0,
            creditos2: 0.0,
        }

        profesores.push(profesorObj);

        for (const peticion of peticionesProfesor) {
            let grupo = await Grupo.findById(peticion.grupo);
            let peticionObj = {
                profesor: profesorObj,
                grupo: grupo,
                orden: orden++
            };
            peticiones.push(peticionObj);
        }
    }

    return { peticiones, profesores, gruposPendientes, numGrupos, numProf };
}

async function grupoOnline(grupo) {
    return !grupo.horario1 || (Array.isArray(grupo.horario1) && grupo.horario1.length === 0);
}

async function formatHorario(horario) {
    const [horaStr, minutoStr] = horario.split(":");
    const hora = parseInt(horaStr);
    const minuto = parseInt(minutoStr);
    return hora * 60 + minuto;
}

async function obtenerDiasComunes(grupo1, grupo2) {
    const dias1 = new Set();
    const dias2 = new Set();

    for (const dia of grupo1.horario1.dias) {
        dias1.add(dia);
    }

    if (grupo1.horario2) {
        for (const dia of grupo1.horario2.dias) {
            dias1.add(dia);
        }
    }

    for (const dia of grupo2.horario1.dias) {
        dias2.add(dia);
    }

    if (grupo2.horario2) {
        for (const dia of grupo2.horario2.dias) {
            dias2.add(dia);
        }
    }

    const diasComunes = new Set([...dias1].filter(dia => dias2.has(dia)));

    return diasComunes;
}

async function haySolapamiento(grupo1, grupo2, solo1) {
    const horarios1 = [grupo1.horario1];
    const horarios2 = [grupo2.horario1];

    if (!solo1) {
        if (grupo1.horario2) {
            horarios1.push(grupo1.horario2);
        }

        if (grupo2.horario2) {
            horarios2.push(grupo2.horario2);
        }
    }

    for (const horario1 of horarios1) {
        for (const dia of horario1.dias) {
            for (const horario2 of horarios2) {
                if (horario2.dias.includes(dia)) {
                    const inicio1 = await formatHorario(horario1.hora_inicio);
                    const inicio2 = await formatHorario(horario2.hora_inicio);
                    const fin1 = await formatHorario(horario1.hora_fin);
                    const fin2 = await formatHorario(horario2.hora_fin);

                    if (
                        (inicio1 <= inicio2 && inicio2 < fin1) ||
                        (inicio2 <= inicio1 && inicio1 < fin2) ||
                        (inicio1 <= inicio2 && fin2 <= fin1) ||
                        (inicio2 <= inicio1 && fin1 <= fin2)
                    ) {
                        return true; // hay solapamiento horario
                    }
                }
            }
        }
    }

    return false; // no hay solapamiento horario
}

// comprueba si existen conflictos entre dos grupos
async function conflictoHorarioEntreGrupos(grupo1, grupo2) {
    // si son de distintos cuatrimestres no hay conflictos
    if (grupo1.cuatrimestre != grupo2.cuatrimestre) {
        return false;
    }

    // si al menos una de las dos es online no hay conflicto
    if (await grupoOnline(grupo1) || await grupoOnline(grupo2)) {
        return false;
    }

    // si no comparten días no hay conflicto
    if (await obtenerDiasComunes(grupo1, grupo2).size == 0) {
        return false;
    }

    const asignGrupo1 = await Asignatura.findById(grupo1.asignatura_id);
    const asignGrupo2 = await Asignatura.findById(grupo2.asignatura_id);
    let esGrupo1SO = false;
    let esGrupo2SO = false;
    let esGrupo1LAb = true;
    let esGrupo2LAb = true;

    const teorias = ['A', 'B', 'Turno 1', 'Turno 2'];

    if(asignGrupo1.acronimo === 'SSOO-IS') {
        esGrupo1SO = true;
    }

    if (asignGrupo2.acronimo === 'SSOO-IS') {
        esGrupo2SO = true;
    }

    if(teorias.includes(grupo1.tipo)) {
        esGrupo1LAb = false;
    }

    if(teorias.includes(grupo2.tipo)) {
        esGrupo2LAb = false;
    }

    // si ambos grupos son SSOO-IS no hay conflicto
    if (esGrupo1SO && esGrupo2SO) {
        return false;
    }

    // si ambos grupos son lab o teoría hay que mirar todos los horarios
    if (esGrupo1LAb === esGrupo2LAb) {
        return await haySolapamiento(grupo1, grupo2, false);
    } else {
        if(esGrupo1SO || esGrupo2SO) {
            return await haySolapamiento(grupo1, grupo2, false);
        } else {
            // si ninguno de los dos es SO y estoy comparando teoría y lab únicamente causa conflicto el horario1
            return await haySolapamiento(grupo1, grupo2, true);
        }
    }
}

async function filtroPorProfesor(profesorId) {
    return asignaciones.filter(a => a.profesor._id.equals(profesorId));
}

// comprueba si existe un conflicto horario entre las asignaciones del profesor y el grupo a asignar
async function conflictoHorario(grupo, profesor) {
    const asignacionesProf = await filtroPorProfesor(profesor._id);

    // Si no hay asignaciones para el profesor, no hay conflicto
    if (asignaciones.length === 0) {
        return false;
    }

    for (const asignacion of asignacionesProf) {
        const grupo2 = asignacion.grupo;
        if (await conflictoHorarioEntreGrupos(grupo, grupo2)) {
            return true;
        }
    }

    return false;
}

// comprueba si es óptimo darle la asignatura al profesor dado por créditos
async function conflictoCreditosCuatrimestre(grupo, profesor) {    
    switch (grupo.cuatrimestre) {
        case '1':
            const c1 = grupo.acreditacion + profesor.creditos1;
            if (c1 > limCuatrimestre) {
                return true;
            }
            break;
        case '2':
            const c2 = grupo.acreditacion + profesor.creditos2;
            if (c2 > limCuatrimestre) {
                return true;
            }
            break;
    }    
    return false;
}

// decide si es mejor dar el grupo o no a un profesor
async function darGrupo(grupo, profesor) {
    const credNo = profesor.creditos1 + profesor.creditos2;
    const credSi = credNo + grupo.acreditacion;

    if (Math.abs(credNo - profesor.capacidad) < Math.abs(credSi - profesor.capacidad)) {
        return false;
    } else {
        return true;
    }
}

async function asignaCreditos(profesor, grupo) {
    fs.appendFileSync('log.txt', `A __________ ${profesor.uvus} __________ ${grupo._id} __________ ${gruposPendientes.length}\n`)
    switch (grupo.cuatrimestre) {
        case '1':
            profesor.creditos1 += grupo.acreditacion;
            break;
        case '2':
            profesor.creditos2 += grupo.acreditacion;
            break;
    }  
}

async function desasignaCreditos(profesor, grupo) {
    fs.appendFileSync('log.txt', `D __________ ${profesor.uvus} __________ ${grupo._id} __________ ${gruposPendientes.length}\n`)
    switch (grupo.cuatrimestre) {
        case '1':
            profesor.creditos1 -= grupo.acreditacion;
            break;
        case '2':
            profesor.creditos2 -= grupo.acreditacion;
            break;
    } 
}

async function desasignaGrupo () {
    let ultima = await asignaciones.pop();
    await desasignaCreditos(ultima.profesor, ultima.grupo);
    index--;
    await gruposPendientes.push(ultima.grupo._id.toString());
    let anterior = asignaciones[asignaciones.length - 1];
    let memoriaObj = JSON.stringify({
        profesor: ultima.profesor._id.toString(),
        grupo: ultima.profesor._id.toString(),
        anterior: anterior.grupo._id.toString()
    });

    if(memoria.has(memoriaObj)) {
        await desasignaGrupo();
    } else {
        memoria.add(memoriaObj);
    }
}

// asigna un grupo a un profesor si cumple las condiciones
async function asignarGrupoSiEsPosible(profesor, grupo) {
    const existeAsignacion = await asignaciones.find(asignacion => asignacion.grupo._id === grupo._id);
    if (!existeAsignacion) {
        if (await darGrupo(grupo, profesor) && !(await conflictoCreditosCuatrimestre(grupo, profesor)) && !(await conflictoHorario(grupo, profesor))) {
            await asignaCreditos(profesor, grupo);
            const asignacion = await crearAsignacionObj(profesor, grupo, index++);
            asignaciones.push(asignacion);
            // si se asigna un grupo se quita de los pendientes
            gruposPendientes = await gruposPendientes.filter(id => id !== grupo._id.toString()); 
            return true;             
        }
    }
    return false;
}

// asigna las peticiones que pueda en orden mirando que cumplan las condiciones de creditos y horarios
async function asignacionPeticiones () {
    for (const peticion of peticiones) {
        const profesor = peticion.profesor;
        const grupo = await Grupo.findById(peticion.grupo);
        await asignarGrupoSiEsPosible(profesor, grupo);
    }
}

// asigna los grupos que han sobrado a profesores que cumplan todas las condiciones
async function asignacionGruposRestantes() {
    let intentos = 0;
    let maxIntentos = (numGrupos ** numGrupos) * numProf;

    while (gruposPendientes.length>0 && intentos <= maxIntentos) {
        for (const grupoId of gruposPendientes) {
            const grupo = await Grupo.findById(grupoId);
            let asignado = false;

            for (const profesor of [...profesores].reverse()) {
                if (await asignarGrupoSiEsPosible(profesor, grupo)) {
                    asignado = true;
                    break;
                }
            }

            if(!asignado && asignaciones.length > 0) {
                await desasignaGrupo();
            }
            
        }
        intentos++;
        console.log(intentos);
    }
}

// función principal que va a devolver una lista con las asignaciones definitivas
async function generaAsignaciones () {
    fs.appendFileSync('log.txt', ` __________ DATOS INICIALES __________ \n ${peticiones.length} __________ ${asignaciones.length} __________ ${gruposPendientes.length}\n`)
    
    await asignacionPeticiones();
    fs.appendFileSync('log.txt', ` __________ DATOS DESPUÉS DE PETICIONES __________ \n ${peticiones.length} __________ ${asignaciones.length} __________ ${gruposPendientes.length}\n`)
    if(gruposPendientes.length == 0) {
        await guardaAsignaciones();
        return;
    }
    await asignacionGruposRestantes();
    fs.appendFileSync('log.txt', ` __________ DATOS DESPUÉS DEL ALGORITMO __________ \n ${peticiones.length} __________ ${asignaciones.length} __________ ${gruposPendientes.length}\n`)
    if (gruposPendientes.length == 0) {
        await guardaAsignaciones();
        return;
    }
}

async function guardaAsignaciones () {
    for (const asignacion of asignaciones) {
        let profesorDB = await Profesor.findById(asignacion.profesor._id);

        await Profesor.findByIdAndUpdate( 
            { _id: profesorDB._id }, 
            { 
                asignados: asignacion.profesor.creditos1 + asignacion.profesor.creditos2, 
                excedente: profesorDB.capacidad - (asignacion.profesor.creditos1 + asignacion.profesor.creditos2),
                creditos1: asignacion.profesor.creditos1, 
                creditos2: asignacion.profesor.creditos2                 
            } 
        ); 

        const profesorAsign = await Profesor.findById(profesorDB._id);
        const grupoDB = await Grupo.findById(asignacion.grupo._id)

        
        const nuevaAsignacion = new Asignacion({
            profesor: profesorAsign,
            grupo: grupoDB,
        });
        await nuevaAsignacion.save();
    }
}

exports.getAllAsignaciones = async (req, res) => {
    try {
      const asignaciones = await Asignacion.find().populate('grupo.asignatura_id');
      const title = 'Asignaciones';
      res.render('list/asignaciones', { asignaciones, title});
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.exportarAsignaciones = async (req, res) => {
    const workbook = new ExcelJS.Workbook();

    // Crear una nueva hoja de trabajo
    const worksheet = workbook.addWorksheet('Asignaciones');
    
    // Obtener los datos de los profesores
    const profesores = await Profesor.find();
    
    // Crear las filas con los datos de los profesores
    const uvusRow = Array(8).fill(null);
    const nombresRow = Array(8).fill(null);
    const capacidadRow = Array(7).fill(null);
    const excedenteRow = Array(7).fill(null);
    const asignadosRow = Array(7).fill(null);  
    const creditos1Row = Array(7).fill(null);  
    const creditos2Row = Array(7).fill(null);
    const headerGrupoRow = [];          
    capacidadRow.push('Capacidad') ;
    excedenteRow.push('Excedente');
    asignadosRow.push('Asignados');
    creditos1Row.push('C1');
    creditos2Row.push('C2');
    headerGrupoRow.push('Acrónimo', 'Tipo', 'Grupo', 'Cuatrimestre','Peticiones', 'Acreditación', 'Horario1', 'Horario2');

    profesores.forEach(profesor => {
        uvusRow.push(profesor.uvus);
        nombresRow.push(`${profesor.apellidos}, ${profesor.nombre}`);
        capacidadRow.push(profesor.capacidad);
        excedenteRow.push(profesor.excedente);
        asignadosRow.push(profesor.asignados);
        creditos1Row.push(profesor.creditos1);
        creditos2Row.push(profesor.creditos2);
    });
    
    // Agregar todas las filas a la hoja de trabajo a la vez
    worksheet.addRows([uvusRow, nombresRow, capacidadRow, excedenteRow, asignadosRow, creditos1Row, creditos2Row, headerGrupoRow]);

    // Obtener los datos de los grupos
    const grupos = await Grupo.find().populate('asignatura_id');

    // Agregar una fila por cada grupo
    grupos.forEach(grupo => {
        const grupoRow = [
            grupo.asignatura_id.acronimo,
            grupo.tipo,
            Number(grupo.grupo),
            Number(grupo.cuatrimestre),
            grupo.peticiones,
            grupo.acreditacion,
            horarioToString(grupo.horario1),
            horarioToString(grupo.horario2)
        ];
        worksheet.addRow(grupoRow);
    });

    // Establecer el ancho de las columnas
    for(let i = 1; i <= worksheet.columnCount; i++) {
        if (i === 7 || i === 8) {
            worksheet.getColumn(i).width = 15;
        } else {
            worksheet.getColumn(i).width = 10.5;
        }
    }
    
    // Dar formato a las celdas de los nombres
    nombresRow.forEach((nombre, index) => {
        if (index >= 4) { // Ignorar las primeras 4 celdas vacías
            const cell = worksheet.getCell(2, index + 1);
            cell.alignment = { textRotation: 90, wrapText: true };
        }
    });
    
    // Configurar los encabezados de la respuesta para indicar que se trata de un archivo descargable
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Asignaciones.xlsx');
    
    // Enviar el archivo Excel al cliente
    await workbook.xlsx.write(res);
    
    res.end();
}

function horarioToString(horario) {
    if (!horario) {
        return '';
    }

    const dias = horario.dias.join(', ');
    const hora_inicio = horario.hora_inicio;
    const hora_fin = horario.hora_fin;

    return `${dias} - ${hora_inicio} a ${hora_fin}`;
}