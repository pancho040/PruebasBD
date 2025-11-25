const supabase = require('../config/supabase');

// GET - Obtener todas las materias
exports.getMaterias = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('materias')
            .select('*')
            .order('id_materia', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET - Obtener una materia por ID
exports.getMateriaById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('materias')
            .select('*')
            .eq('id_materia', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST - Crear una materia
exports.createMateria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const { data, error } = await supabase
            .from('materias')
            .insert([{ nombre, descripcion }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT - Actualizar una materia
exports.updateMateria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const { data, error } = await supabase
            .from('materias')
            .update({ nombre, descripcion })
            .eq('id_materia', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE - Eliminar una materia
exports.deleteMateria = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('materias')
            .delete()
            .eq('id_materia', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }

        res.json({ message: 'Materia eliminada correctamente', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};