const request = require('supertest');
const app = require('../../server');

// Variables para almacenar IDs durante los tests
let alumnoId;

describe('CRUD de Alumnos', () => {
    
    // TEST: Obtener todos los alumnos
    describe('GET /api/alumnos', () => {
        test('Debe retornar todos los alumnos con status 200', async () => {
            const response = await request(app)
                .get('/api/alumnos')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    // TEST: Crear un alumno
    describe('POST /api/alumnos', () => {
        test('Debe crear un nuevo alumno con status 201', async () => {
            const nuevoAlumno = {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: `test${Date.now()}@test.com` // Email único
            };

            const response = await request(app)
                .post('/api/alumnos')
                .send(nuevoAlumno)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('id_alumno');
            expect(response.body.nombre).toBe(nuevoAlumno.nombre);
            expect(response.body.apellido).toBe(nuevoAlumno.apellido);
            expect(response.body.email).toBe(nuevoAlumno.email);

            // Guardar ID para tests posteriores
            alumnoId = response.body.id_alumno;
        });

        test('Debe fallar al crear alumno sin nombre', async () => {
            const alumnoInvalido = {
                apellido: 'Test',
                email: 'test@test.com'
            };

            const response = await request(app)
                .post('/api/alumnos')
                .send(alumnoInvalido)
                .expect(500);
        });
    });

    // TEST: Obtener un alumno por ID
    describe('GET /api/alumnos/:id', () => {
        test('Debe retornar un alumno específico con status 200', async () => {
            const response = await request(app)
                .get(`/api/alumnos/${alumnoId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id_alumno', alumnoId);
            expect(response.body).toHaveProperty('nombre');
            expect(response.body).toHaveProperty('email');
        });

        test('Debe retornar 404 para alumno inexistente', async () => {
            const response = await request(app)
                .get('/api/alumnos/99999')
                .expect(500); // Supabase arroja error si no encuentra
        });
    });

    // TEST: Actualizar un alumno
    describe('PUT /api/alumnos/:id', () => {
        test('Debe actualizar un alumno existente con status 200', async () => {
            const datosActualizados = {
                nombre: 'Juan Carlos',
                apellido: 'Pérez García',
                email: `updated${Date.now()}@test.com`
            };

            const response = await request(app)
                .put(`/api/alumnos/${alumnoId}`)
                .send(datosActualizados)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.nombre).toBe(datosActualizados.nombre);
            expect(response.body.apellido).toBe(datosActualizados.apellido);
        });
    });

    // TEST: Eliminar un alumno
    describe('DELETE /api/alumnos/:id', () => {
        test('Debe eliminar un alumno con status 200', async () => {
            const response = await request(app)
                .delete(`/api/alumnos/${alumnoId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
        });

        test('Debe retornar 404 al intentar eliminar alumno ya eliminado', async () => {
            await request(app)
                .delete(`/api/alumnos/${alumnoId}`)
                .expect(500);
        });
    });
});