const supabase = require('../config/supabase');

// GET - Obtener todas las tareas con JOIN
exports.getTareas = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tareas')
            .select(`
                *,
                alumnos:id_alumno (
                    id_alumno,
                    nombre,
                    apellido,
                    email
                ),
                materias:id_materia (
                    id_materia,
                    nombre,
                    descripcion
                )
            `)
            .order('id_tarea', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET - Obtener una tarea por ID con JOIN
exports.getTareaById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('tareas')
            .select(`
                *,
                alumnos:id_alumno (
                    id_alumno,
                    nombre,
                    apellido,
                    email
                ),
                materias:id_materia (
                    id_materia,
                    nombre,
                    descripcion
                )
            `)
            .eq('id_tarea', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST - Crear una tarea
exports.createTarea = async (req, res) => {
    try {
        const { id_alumno, id_materia, titulo, descripcion, fecha_entrega, estado } = req.body;

        const { data, error } = await supabase
            .from('tareas')
            .insert([{
                id_alumno,
                id_materia,
                titulo,
                descripcion,
                fecha_entrega,
                estado: estado || 'pendiente'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT - Actualizar una tarea
exports.updateTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_alumno, id_materia, titulo, descripcion, fecha_entrega, estado } = req.body;

        const { data, error } = await supabase
            .from('tareas')
            .update({
                id_alumno,
                id_materia,
                titulo,
                descripcion,
                fecha_entrega,
                estado
            })
            .eq('id_tarea', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE - Eliminar una tarea
exports.deleteTarea = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('tareas')
            .delete()
            .eq('id_tarea', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        res.json({ message: 'Tarea eliminada correctamente', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};