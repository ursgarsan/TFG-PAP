const Grupo = require('../models/grupoModel');
const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const Asignacion = require('../models/asignacionModel');

let index = 0;
let limCuatrimestre = 12;
let asignaciones = [];
let peticiones;
let profesores;
let gruposPendientes;
let numGrupos;
let numProf;

(async function() {
    ({ peticiones, profesores, gruposPendientes, numGrupos, numProf } = await getData('2023-2024'));
})();



exports.createAsignaciones = async (req, res) => {
    const title = 'Asignaciones';

    // hay que añadir tambien los atributos que faltan de las asignaciones, hay que mirar el modelo y también hay que actualizar los profesores
    // const asignaciones = await asignarGrupos(profesores, grupos);
    // for (const asignacion of asignaciones) {
    //     await asignacion.save();
    // }  
    await generaAsignaciones();
    res.render('list/asignaciones', { title });
}

async function crearAsignacionObj(profesor, grupo, index) {
    return {
        profesor: profesor,
        grupo: grupo,
        orden: index
    };
}

async function getData(curso) {
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
    return !grupo.horario || (Array.isArray(grupo.horario) && grupo.horario.length === 0);
}

async function formatHorario(horario) {
    const [horaStr, minutoStr] = horario.split(":");
    const hora = parseInt(horaStr);
    const minuto = parseInt(minutoStr);
    return hora * 60 + minuto;
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

    // en el caso de que sean del mismo cuatrimestre vamos a comprobar si se dan el mismo día
    const dias1 = new Set();
    const dias2 = new Set();
    for (const horario of grupo1.horario) {
        for (const dia of horario.dias) {
            dias1.add(dia);
        }
    }
    for (const horario of grupo2.horario) {
        for (const dia of horario.dias) {
            dias2.add(dia);
        }
    }
    const diasComunes = new Set([...dias1].filter(dia => dias2.has(dia)));

    // si no coinciden los días del horario no hay conflictos
    if (diasComunes.size == 0) {
        return false;
    }

    // en el caso de que los grupos sean en los mismos días vamos a comprobar si las horas coinciden
    for (const dia of diasComunes) {
        for (const horario1 of grupo1.horario) {
            if (horario1.dias.includes(dia)) {
                for (const horario2 of grupo2.horario) {
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
    }

    return false; // no hay solapamiento horario
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
        case 1:
            const c1 = grupo.acreditacion + profesor.creditos1;
            if (c1 > limCuatrimestre) {
                return true;
            }
            break;
        case 2:
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
    profesor.as
    switch (grupo.cuatrimestre) {
        case 1:
            profesor.creditos1 += grupo.acreditacion;

            break;
        case 2:
            profesor.creditos2 += grupo.acreditacion;
            break;
    }  
}

// asigna un grupo a un profesor si cumple las condiciones
async function asignarGrupoSiEsPosible(profesor, grupo) {
    const existeAsignacion = asignaciones.find(asignacion => asignacion.grupo === grupo);
    if (!existeAsignacion) {
        if (await darGrupo(grupo, profesor) && !(await conflictoCreditosCuatrimestre(grupo, profesor)) && !(await conflictoHorario(grupo, profesor))) {
            const asignacion = await crearAsignacionObj(profesor, grupo, index++);
            await asignaCreditos(profesor, grupo);
            asignaciones.push(asignacion);
            // si se asigna un grupo se quita de los pendientes
            gruposPendientes = gruposPendientes.filter(id => id !== grupo._id.toString()); 
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

            for (const profesor of profesores) {
                if (await asignarGrupoSiEsPosible(profesor, grupo)) {
                    asignado = true;
                    break;
                }
            }

            if(!asignado && asignaciones.length > 0) {
                let ultima = asignaciones.pop();
                index--;
                gruposPendientes.push(ultima.grupo._id.toString());
            }
            
        }
        intentos++;
    }
}

// función principal que va a devolver una lista con las asignaciones definitivas
async function generaAsignaciones () {
    await asignacionPeticiones();
    if(gruposPendientes.length == 0) {
        return;
    }
    await asignacionGruposRestantes();
    if (gruposPendientes.length == 0) {
        return;
    }
}