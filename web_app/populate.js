const { exec } = require('child_process');

// Ejecuta el script Python para la inicialización de la base de datos Mongo
const child = exec('poblar_bbdd.py');

child.stdout.on('data', (data) => {
    console.log(`Salida del script de inicialización de la base de datos:\n${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`Error al ejecutar el script de inicialización de la base de datos:\n${data}`);
});

child.on('close', (code) => {
    if (code === 0) {
        console.log('Script de inicialización de la base de datos ejecutado exitosamente.');
    } else {
        console.error(`El script de inicialización de la base de datos se cerró con el código de salida ${code}.`);
    }
});