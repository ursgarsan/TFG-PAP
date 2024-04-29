const { Schema, model } = require('mongoose');
const Profesor = require('./profesorModel');
const Grupo = require('./grupoModel');

const asignacionSchema = new Schema({
    profesor: {
        type: Profesor.schema,
        require: true,
    },
    grupo: {
        type: Grupo.schema,
        require: true,
    },
    curso: {
        type: String,
        require: true,
    }
})

const Asignacion = model('asignaciones', asignacionSchema);
module.exports = Asignacion;