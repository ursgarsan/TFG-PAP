const Asignatura = require('../models/asignaturaModel');
const Grupo = require('../models/grupoModel');
const Profesor = require('../models/profesorModel');
const Peticion = require('../models/peticionModel');
const Asignacion = require('../models/asignacionModel');

exports.createAsignaciones = async (req, res) => {
    const title = 'Asignaciones';
    const { grupos, profesores, peticiones } = await getData('2023-2024'); //tengo que cambiarlo por un selector que le viene de fuera

    res.render('list/asignaciones', { title });
}

async function getData(curso) {
    const grupos = await Grupo.find({ curso: curso });
    const profesores = await Profesor.find();
    const peticiones = await Peticion.find();
    return { grupos, profesores, peticiones };
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

async function conflictoHorario(grupo1, grupo2) {

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
                console.log(horario1);
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



