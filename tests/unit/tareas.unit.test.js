// unit/tareas.unit.test.js

const {
    getTareas,
    getTareaById,
    createTarea,
    updateTarea,
    deleteTarea
} = require('../../controllers/tareasController');

// Mockear el módulo de supabase
const supabase = require('../../config/supabase'); 
jest.mock('../../config/supabase');

// Mocks de Supabase
const mockFrom = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn(() => ({ data: [], error: null })),
    eq: jest.fn(() => ({
        single: jest.fn(() => ({ data: {}, error: null })),
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

describe('Unit Tests: Tareas Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- GET /api/tareas (con JOIN) ---
    describe('getTareas', () => {
        test('debe retornar 200 y una lista de tareas con datos de JOIN', async () => {
            const mockTareas = [{ id_tarea: 1, alumnos: { nombre: 'Julián' } }];
            
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(), // El select(join_syntax)
                order: jest.fn().mockResolvedValue({ data: mockTareas, error: null }),
            });

            await getTareas(mockReq, mockRes);

            expect(mockFrom).toHaveBeenCalledWith('tareas');
            expect(mockRes.json).toHaveBeenCalledWith(mockTareas);
        });
    });

    // --- GET /api/tareas/:id (con JOIN) ---
    describe('getTareaById', () => {
        const req = { params: { id: 1 } };
        
        test('debe retornar 200 y la tarea específica con datos de JOIN', async () => {
            const mockTarea = { id_tarea: 1, titulo: 'Examen', materias: { nombre: 'Mate' } };
            
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(), // El select(join_syntax)
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockTarea, error: null }),
            });

            await getTareaById(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockTarea);
        });

        test('debe retornar 404 si la tarea no es encontrada', async () => {
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await getTareaById(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tarea no encontrada' });
        });
    });

    // --- POST /api/tareas ---
    describe('createTarea', () => {
        const baseReq = {
            body: {
                id_alumno: 1,
                id_materia: 10,
                titulo: 'Nueva Tarea',
                fecha_entrega: '2025-12-31',
            }
        };

        test('debe retornar 201 y el nuevo tarea, con estado "pendiente" por defecto', async () => {
            const req = { body: { ...baseReq.body } };
            const newTarea = { id_tarea: 100, ...req.body, estado: 'pendiente' };
            
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: newTarea, error: null }),
            });

            await createTarea(req, mockRes);

            // Verifica que el valor insertado use 'pendiente' si 'estado' no se proporciona
            expect(mockFrom).toHaveBeenCalledWith('tareas');
            expect(mockFrom.mock.calls[0][0]).toBe('tareas');
            const insertPayload = mockFrom.mock.results[0].value.insert.mock.calls[0][0][0];
            expect(insertPayload.estado).toBe('pendiente');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newTarea);
        });
        
        test('debe retornar 201 y el nuevo tarea, respetando el estado proporcionado', async () => {
            const req = { body: { ...baseReq.body, estado: 'completada' } };
            const newTarea = { id_tarea: 101, ...req.body };
            
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: newTarea, error: null }),
            });

            await createTarea(req, mockRes);

            const insertPayload = mockFrom.mock.results[0].value.insert.mock.calls[0][0][0];
            expect(insertPayload.estado).toBe('completada');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newTarea);
        });
    });
    
    // --- PUT /api/tareas/:id ---
    describe('updateTarea', () => {
        const req = { params: { id: 1 }, body: { titulo: 'T. Modificada', estado: 'en_curso' } };

        test('debe retornar 200 y la tarea actualizada al ser exitoso', async () => {
            const updatedTarea = { id_tarea: 1, ...req.body };
            
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: updatedTarea, error: null }),
            });

            await updateTarea(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(updatedTarea);
        });

        test('debe retornar 404 si la tarea a actualizar no es encontrada', async () => {
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await updateTarea(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tarea no encontrada' });
        });
    });

    // --- DELETE /api/tareas/:id ---
    describe('deleteTarea', () => {
        const req = { params: { id: 1 } };

        test('debe retornar 200 y mensaje de éxito al ser exitoso', async () => {
            const deletedTarea = { id_tarea: 1 };
            
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: deletedTarea, error: null }),
            });

            await deleteTarea(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tarea eliminada correctamente', data: deletedTarea });
        });
    });
});