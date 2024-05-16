const { Schema, model } = require('mongoose');

const peticionSchema = new Schema({
    profesor: {
        type: Schema.Types.ObjectId,
        ref: 'profesores',
        require: true,
    },
    grupo: {
        type: Schema.Types.ObjectId,
        ref: 'grupos',
        require: true,
    },
    prioridad: {
        type: Number,
        require: true,
    }
})
const Peticion = model('peticiones', peticionSchema);
module.exports = Peticion;
