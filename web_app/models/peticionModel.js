const { Schema, model } = require('mongoose');

const peticionSchema = new Schema({
    profesor: {
        type: Schema.Types.ObjectId,
        ref: 'Profesor',
        require: true,
    },
    grupo: {
        type: Schema.Types.ObjectId,
        ref: 'Grupo',
        require: true,
    },
    orden: {
        type: Number,
        require: true,
    },
    status: {
        type: String,
        require: true,
        default: 'solicitado',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    curso: {
        type: String,
        require: true,
    }
})
const Peticion = model('Peticion', peticionSchema);
module.exports = Peticion;
