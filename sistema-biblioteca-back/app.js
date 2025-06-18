require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // <-- ¡Añade esta línea!
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en las solicitudes
app.use(express.json());
app.use(cors());

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Crear un pool de conexiones para mejor manejo de la DB
const pool = mysql.createPool(dbConfig);

// Middleware para hacer la conexión a la DB disponible en las rutas
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Importar rutas
const autoresRoutes = require('./routes/autores');
const librosRoutes = require('./routes/libros');
const miembrosRoutes = require('./routes/miembros');
const prestamosRoutes = require('./routes/prestamos');

// Usar rutas
app.use('/api/autores', autoresRoutes);
app.use('/api/libros', librosRoutes);
app.use('/api/miembros', miembrosRoutes);
app.use('/api/prestamos', prestamosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Sistema de Biblioteca v2!');
});

// Manejo de errores 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal en el servidor', error: err.message });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});