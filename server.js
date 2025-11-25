const express = require('express');
const cors = require('cors');
require('dotenv').config();

const alumnosRoutes = require('./routes/alumnos');
const materiasRoutes = require('./routes/materias');
const tareasRoutes = require('./routes/tareas');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/tareas', tareasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ message: 'API de Gestión de Tareas con Supabase funcionando correctamente' });
});

// Solo iniciar servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}

// Exportar app para testing
module.exports = app;