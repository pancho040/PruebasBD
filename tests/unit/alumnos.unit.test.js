// unit/alumnos.unit.test.js

const {
    getAlumnos,
    getAlumnoById,
    createAlumno,
    updateAlumno,
    deleteAlumno
} = require('../../controllers/alumnosController');

// Mockear el módulo de supabase
const supabase = require('../../config/supabase'); 
jest.mock('../../config/supabase');

// Funciones mock de Supabase
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
    select: mockSelect,
    order: jest.fn(() => ({ data: [], error: null })), // Default para getAlumnos
    eq: jest.fn(() => ({
        single: jest.fn(() => ({ data: {}, error: null })), // Default para single()
        select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })), // Default para select().single()
    })),
    insert: jest.fn(() => ({
        select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
    })),
    update: jest.fn(() => ({
        eq: jest.fn(() => ({
            select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
        })),
    })),
    delete: jest.fn(() => ({
        eq: jest.fn(() => ({
            select: jest.fn(() => ({ single: jest.fn(() => ({ data: {}, error: null })) })),
        })),
    })),
}));

// Asignar el mock al objeto supabase para que el require lo use
supabase.from = mockFrom;

// Mocks de Express: Request, Response y Next
const mockReq = {};
const mockRes = {
    json: jest.fn((x) => x),
    status: jest.fn(() => mockRes),
    send: jest.fn((x) => x),
};

describe('Unit Tests: Alumnos Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- GET /api/alumnos ---
    describe('getAlumnos', () => {
        test('debe retornar 200 y una lista de alumnos al ser exitoso', async () => {
            const mockAlumnos = [{ id_alumno: 1, nombre: 'Ana' }];
            
            // Simular respuesta exitosa de Supabase
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: mockAlumnos, error: null }),
            });

            await getAlumnos(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockAlumnos);
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Database error');
            
            // Simular un error de Supabase
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await getAlumnos(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });

    // --- GET /api/alumnos/:id ---
    describe('getAlumnoById', () => {
        const req = { params: { id: 1 } };

        test('debe retornar 200 y el alumno al ser exitoso', async () => {
            const mockAlumno = { id_alumno: 1, nombre: 'Beto' };
            
            // Simular respuesta exitosa de Supabase
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockAlumno, error: null }),
            });

            await getAlumnoById(req, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockAlumno);
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        test('debe retornar 404 si el alumno no es encontrado', async () => {
            // Simular no encontrar datos
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await getAlumnoById(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Alumno no encontrado' });
        });

        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Fetch error');
            
            // Simular un error de Supabase
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await getAlumnoById(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });

    // --- POST /api/alumnos ---
    describe('createAlumno', () => {
        const req = { body: { nombre: 'Carlos', apellido: 'Diaz', email: 'c@d.com' } };

        test('debe retornar 201 y el nuevo alumno al ser exitoso', async () => {
            const newAlumno = { id_alumno: 5, ...req.body };
            
            // Simular respuesta exitosa de Supabase
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: newAlumno, error: null }),
            });

            await createAlumno(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newAlumno);
        });

        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Insert error');
            
            // Simular un error de Supabase (ej. email duplicado, falta NOT NULL)
            mockFrom.mockReturnValueOnce({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await createAlumno(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });
    
    // --- PUT /api/alumnos/:id ---
    describe('updateAlumno', () => {
        const req = { params: { id: 1 }, body: { nombre: 'Elena', apellido: 'Frias', email: 'e@f.com' } };

        test('debe retornar 200 y el alumno actualizado al ser exitoso', async () => {
            const updatedAlumno = { id_alumno: 1, ...req.body };
            
            // Simular respuesta exitosa de Supabase
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: updatedAlumno, error: null }),
            });

            await updateAlumno(req, mockRes);

            expect(mockRes.status).not.toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(updatedAlumno);
        });

        test('debe retornar 404 si el alumno a actualizar no es encontrado', async () => {
            // Simular no encontrar datos
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await updateAlumno(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Alumno no encontrado' });
        });
        
        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Update error');
            
            // Simular un error de Supabase
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await updateAlumno(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });

    // --- DELETE /api/alumnos/:id ---
    describe('deleteAlumno', () => {
        const req = { params: { id: 1 } };

        test('debe retornar 200 y mensaje de éxito al ser exitoso', async () => {
            const deletedAlumno = { id_alumno: 1, nombre: 'Gaby' };
            
            // Simular respuesta exitosa de Supabase
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: deletedAlumno, error: null }),
            });

            await deleteAlumno(req, mockRes);

            expect(mockRes.status).not.toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Alumno eliminado correctamente', data: deletedAlumno });
        });

        test('debe retornar 404 si el alumno a eliminar no es encontrado', async () => {
            // Simular no encontrar datos
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            await deleteAlumno(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Alumno no encontrado' });
        });
        
        test('debe retornar 500 si hay un error de Supabase', async () => {
            const mockError = new Error('Delete error');
            
            // Simular un error de Supabase
            mockFrom.mockReturnValueOnce({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            });

            await deleteAlumno(req, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: mockError.message });
        });
    });
});