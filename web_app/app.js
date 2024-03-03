// Importa las dependencias necesarias
const express = require('express');
const mongoose = require('mongoose');

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Define el esquema del modelo Profesor
const profesorSchema = new mongoose.Schema({
  orden: Number,
  nombre: String,
  uvus: String,
  capacidad: Number
});

// Crea el modelo Profesor a partir del esquema
const Profesor = mongoose.model('profesores', profesorSchema);

// Inicializa la aplicación Express
const app = express();

// Ruta para obtener todos los profesores
app.get('/profesores', async (req, res) => {
  try {
    // Busca todos los profesores en la base de datos
    const profesores = await Profesor.find();
    res.json(profesores); // Envía la respuesta como JSON
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Puerto en el que escucha el servidor
const PORT = process.env.PORT || 3000;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
