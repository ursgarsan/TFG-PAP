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
    }
})
const Peticion = model('peticiones', peticionSchema);
module.exports = Peticion;
