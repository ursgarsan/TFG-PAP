const horario_original = 'Mi. - 10:40 a 13:20'

function formatHorario(horario) {
    let new_horario = {};
    let horario_aux;
    let hora_inicio;
    let hora_fin;

    // tengo que mirar antes si hay , en los dias para meter varios

    if (horario.includes(' - ')) {
        horario_aux = horario.replace('.', '').split(' - ');
        console.log(horario_aux[1])
    } else {
        // ponerle la hroa predeterminada 18:30 a 19:50
    }
    
    if (horario_aux[1].includes(' a ')) {
        const horas = horario_aux[1].split(' a ');
        hora_inicio = horas[0];
        hora_fin = horas[1];
    } else {
        // sumarle la hora y 50 y ponerla en fin
    }


    new_horario = {
        'dias': horario_aux[0],
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin
    }
    return new_horario
}

console.log(formatHorario(horario_original))
