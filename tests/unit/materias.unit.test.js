// unit/materias.unit.test.js

const {
    getMaterias,
    getMateriaById,
    createMateria,
    updateMateria,
    deleteMateria
} = require('../../controllers/materiasController');

// Mockear el módulo de supabase
const supabase = require('../../config/supabase'); 
jest.mock('../../config/supabase');

// Mocks de Supabase (reutilizables o específicos para este archivo)
const mockFrom = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn(() => ({ data: [], error: null })),
    eq: jest.fn(() => ({
        single: jest.fn(() => ({ data: {}, error: null })),
        select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
    })),
    insert: jest.fn(() => ({
        select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
    })),
    update: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
    })),
    delete: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
    })),
}));

supabase.from = mockFrom;

// Mocks de Express
const mockReq = {};
const mockRes = {
    json: jest.fn((x) => x),
    status: jest.fn(() => mockRes),
    send: jest.fn((x) => x),
};

describe('Unit Tests: Materias Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- GET /api/materias ---
    describe('getMaterias', () => {
        test('debe retornar 200 y una lista de materias al ser exitoso', async () => {
            const mockMaterias = [{ id_materia: 1, nombre: 'Física' }];
            
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: mockMaterias, error: null }),
            });

            await getMaterias(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockMaterias);
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Database error');
            
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await getMaterias(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });

    // --- GET /api/materias/:id ---
    describe('getMateriaById', () => {
        const req = { params: { id: 1 } };

        test('debe retornar 200 y la materia al ser exitoso', async () => {
            const mockMateria = { id_materia: 1, nombre: 'Cálculo' };
            
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockMateria, error: null }),
            });

            await getMateriaById(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockMateria);
        });

        test('debe retornar 404 si la materia no es encontrada', async () => {
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await getMateriaById(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Materia no encontrada' });
        });
    });

    // --- POST /api/materias ---
    describe('createMateria', () => {
        const req = { body: { nombre: 'Historia', descripcion: 'Materia de historia' } };

        test('debe retornar 201 y la nueva materia al ser exitoso', async () => {
            const newMateria = { id_materia: 5, ...req.body };
            
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: newMateria, error: null }),
            });

            await createMateria(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newMateria);
        });
        
        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Insert error');
            
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await createMateria(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });
    
    // --- PUT /api/materias/:id ---
    describe('updateMateria', () => {
        const req = { params: { id: 1 }, body: { nombre: 'Química Avanzada', descripcion: 'Nueva desc' } };

        test('debe retornar 200 y la materia actualizada al ser exitoso', async () => {
            const updatedMateria = { id_materia: 1, ...req.body };
            
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: updatedMateria, error: null }),
            });

            await updateMateria(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(updatedMateria);
        });

        test('debe retornar 404 si la materia a actualizar no es encontrada', async () => {
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await updateMateria(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Materia no encontrada' });
        });
    });

    // --- DELETE /api/materias/:id ---
    describe('deleteMateria', () => {
        const req = { params: { id: 1 } };

        test('debe retornar 200 y mensaje de éxito al ser exitoso', async () => {
            const deletedMateria = { id_materia: 1 };
            
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: deletedMateria, error: null }),
            });

            await deleteMateria(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Materia eliminada correctamente', data: deletedMateria });
        });

        test('debe retornar 404 si la materia a eliminar no es encontrada', async () => {
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await deleteMateria(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Materia no encontrada' });
        });
    });
});