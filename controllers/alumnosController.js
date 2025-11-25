const supabase = require('../config/supabase');

// GET - Obtener todos los alumnos
exports.getAlumnos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alumnos')
            .select('*')
            .order('id_alumno', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET - Obtener un alumno por ID
exports.getAlumnoById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('alumnos')
            .select('*')
            .eq('id_alumno', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST - Crear un alumno
exports.createAlumno = async (req, res) => {
    try {
        const { nombre, apellido, email } = req.body;

        const { data, error } = await supabase
            .from('alumnos')
            .insert([{ nombre, apellido, email }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT - Actualizar un alumno
exports.updateAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email } = req.body;

        const { data, error } = await supabase
            .from('alumnos')
            .update({ nombre, apellido, email })
            .eq('id_alumno', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE - Eliminar un alumno
exports.deleteAlumno = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('alumnos')
            .delete()
            .eq('id_alumno', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }

        res.json({ message: 'Alumno eliminado correctamente', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};