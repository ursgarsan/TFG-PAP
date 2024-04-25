const Grupo = require('../models/grupoModel');
const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const Asignacion = require('../models/asignacionModel');

let index = 0;
let asignaciones = [];
let peticiones;
let profesores;

(async function() {
    ({ peticiones, profesores } = await getData('2023-2024'));
})();



exports.createAsignaciones = async (req, res) => {
    const title = 'Asignaciones';

    // hay que añadir tambien los atributos que faltan de las asignaciones, hay que mirar el modelo
    // const asignaciones = await asignarGrupos(profesores, grupos);
    // for (const asignacion of asignaciones) {
    //     await asignacion.save();
    // }
    res.render('list/asignaciones', { title });
}

function crearAsignacionObj(profesor, grupo, index) {
    return {
        profesor: profesor,
        grupo: grupo,
        orden: index
    };
}

async function getData(curso) {
    let profesoresRaw = await Profesor.find();
    profesoresRaw = profesoresRaw.sort((a, b) => a.orden - b.orden);
    const peticionesRaw = await Peticion.find();
    let peticiones = [];
    let profesores = [];
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

    return { peticiones, profesores };
}

function grupoOnline(grupo) {
    return !grupo.horario || (Array.isArray(grupo.horario) && grupo.horario.length === 0);
}

function formatHorario(horario) {
    const [horaStr, minutoStr] = horario.split(":");
    const hora = parseInt(horaStr);
    const minuto = parseInt(minutoStr);
    return hora * 60 + minuto;
}

// comprueba si existen conflictos entre dos grupos
function conflictoHorarioEntreGrupos(grupo1, grupo2) {
    // si son de distintos cuatrimestres no hay conflictos
    if (grupo1.cuatrimestre != grupo2.cuatrimestre) {
        return false;
    }

    // si al menos una de las dos es online no hay conflicto
    if (grupoOnline(grupo1) || grupoOnline(grupo2)) {
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
                        const inicio1 = formatHorario(horario1.hora_inicio);
                        const inicio2 = formatHorario(horario2.hora_inicio);
                        const fin1 = formatHorario(horario1.hora_fin);
                        const fin2 = formatHorario(horario2.hora_fin);

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

function filtroPorProfesor(profesorId) {
    return asignaciones.filter(a => a.profesor._id.equals(profesorId));
}

// comprueba si existe un conflicto horario entre las asignaciones del profesor y el grupo a asignar
function conflictoHorario(grupo, profesor) {
    const asignacionesProf = filtroPorProfesor(profesor._id);

    // Si no hay asignaciones para el profesor, no hay conflicto
    if (asignaciones.length === 0) {
        return false;
    }

    for (const asignacion of asignacionesProf) {
        const grupo2 = asignacion.grupo;
        if (conflictoHorarioEntreGrupos(grupo, grupo2)) {
            return true;
        }
    }

    return false;
}

// comprueba si es óptimo darle la asignatura al profesor dado por créditos
function conflictoCreditosCuatrimestre(grupo, profesor) {    
    switch (grupo.cuatrimestre) {
        case 1:
            const c1 = grupo.acreditacion + profesor.creditos1;
            if (c1 > 12) {
                return true;
            }
            break;
        case 2:
            const c2 = grupo.acreditacion + profesor.creditos2;
            if (c2 > 12) {
                return true;
            }
            break;
    }    
    return false;
}

// decide si es mejor dar el grupo o no a un profesor
function darGrupo(grupo, profesor) {
    const credNo = profesor.creditos1 + profesor.creditos2;
    const credSi = credNo + grupo.acreditacion;

    if (Math.abs(credNo - profesor.capacidad) < Math.abs(credSi - profesor.capacidad)) {
        return false;
    } else {
        return true;
    }
}

function asignacionPeticiones () {
    for (const peticion of peticiones) {
        const profesor = peticion.profesor;
        const grupo = peticion.grupo;
        if (darGrupo(grupo, profesor) && !conflictoCreditosCuatrimestre(grupo, profesor) && !conflictoHorario(grupo, profesor)) {
            const existeAsignacion = asignaciones.find(asignacion => asignacion.grupo === grupo);
            if (!existeAsignacion) {
                const asignacion = crearAsignacionObj(profesor, grupo, index++);
                asignaciones.push(asignacion);
            }
        }
    }
}