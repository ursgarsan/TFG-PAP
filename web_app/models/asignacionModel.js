const { Schema, model } = require('mongoose');

const asignacionSchema = new Schema({
    docente: {
        type: Schema.Types.ObjectId,
        ref: 'Profesor',
        require: true,
    },
    grupo: {
        type: Schema.Types.ObjectId,
        ref: 'Grupo',
        require: true,
    },
    curso: {
        type: String,
        require: true,
    }
})

const Asignacion = model('asignaciones', asignacionSchema);
module.exports = Asignacion;