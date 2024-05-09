const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const admin_colecc = 'administradores';

mongoose.connect('mongodb://127.0.0.1:27017/PAP')
  .then(() => {
    console.log('Conexión exitosa a MongoDB');
    mongoose.connection.db.dropDatabase()
      .then(() => {
        console.log('Base de datos borrada exitosamente');
        const Admin = mongoose.model(admin_colecc, new mongoose.Schema({
          nombre: String,
          apellidos: String,
          usuario: String,
          pass: String
        }));

        bcrypt.hash('admin', 10, (err, hash) => {
          if (err) {
            console.error('Error al generar el hash de la contraseña:', err);
            process.exit(1);
          }

          const admin = new Admin({
            nombre: 'Administrador',
            apellidos: 'Administrador',
            usuario: 'admin',
            pass: hash
          });

          admin.save()
            .then(() => {
              console.log('Administrador creado e insertado correctamente.');
              mongoose.connection.close().then(() => console.log('Conexión a MongoDB cerrada.'));
            })
            .catch(err => console.error('Error al insertar el administrador:', err));
        });
      })
      .catch(err => console.error('Error al borrar la base de datos:', err));
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));