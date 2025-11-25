const request = require('supertest');
const app = require('../server');

let tareaId;
let alumnoId;
let materiaId;

describe('CRUD de Tareas', () => {
    
    // Crear alumno y materia antes de los tests
    beforeAll(async () => {
        // Crear alumno
        const alumnoResponse = await request(app)
            .post('/api/alumnos')
            .send({
                nombre: 'Test',
                apellido: 'Usuario',
                email: `testuser${Date.now()}@test.com`
            });
        alumnoId = alumnoResponse.body.id_alumno;

        // Crear materia
        const materiaResponse = await request(app)
            .post('/api/materias')
            .send({
                nombre: 'Materia Test',
                descripcion: 'Descripción de prueba'
            });
        materiaId = materiaResponse.body.id_materia;
    });

    // Limpiar datos después de todos los tests
    afterAll(async () => {
        // Eliminar alumno y materia creados
        if (alumnoId) {
            await request(app).delete(`/api/alumnos/${alumnoId}`);
        }
        if (materiaId) {
            await request(app).delete(`/api/materias/${materiaId}`);
        }
    });

    // TEST: Obtener todas las tareas
    describe('GET /api/tareas', () => {
        test('Debe retornar todas las tareas con status 200', async () => {
            const response = await request(app)
                .get('/api/tareas')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    // TEST: Crear una tarea
    describe('POST /api/tareas', () => {
        test('Debe crear una nueva tarea con status 201', async () => {
            const nuevaTarea = {
                id_alumno: alumnoId,
                id_materia: materiaId,
                titulo: 'Tarea de Prueba',
                descripcion: 'Descripción de la tarea',
                fecha_entrega: '2025-12-31',
                estado: 'pendiente'
            };

            const response = await request(app)
                .post('/api/tareas')
                .send(nuevaTarea)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('id_tarea');
            expect(response.body.titulo).toBe(nuevaTarea.titulo);
            expect(response.body.id_alumno).toBe(alumnoId);
            expect(response.body.id_materia).toBe(materiaId);

            tareaId = response.body.id_tarea;
        });

        test('Debe crear tarea con estado por defecto pendiente', async () => {
            const tareaSimple = {
                id_alumno: alumnoId,
                id_materia: materiaId,
                titulo: 'Tarea Simple',
                descripcion: 'Test',
                fecha_entrega: '2025-12-31'
            };

            const response = await request(app)
                .post('/api/tareas')
                .send(tareaSimple)
                .expect(201);

            expect(response.body.estado).toBe('pendiente');
            
            // Limpiar esta tarea de prueba
            await request(app).delete(`/api/tareas/${response.body.id_tarea}`);
        });
    });

    // TEST: Obtener una tarea por ID
    describe('GET /api/tareas/:id', () => {
        test('Debe retornar una tarea específica con JOIN de alumno y materia', async () => {
            const response = await request(app)
                .get(`/api/tareas/${tareaId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id_tarea', tareaId);
            expect(response.body).toHaveProperty('titulo');
            expect(response.body).toHaveProperty('alumnos');
            expect(response.body).toHaveProperty('materias');
            expect(response.body.alumnos).toHaveProperty('nombre');
            expect(response.body.materias).toHaveProperty('nombre');
        });
    });

    // TEST: Actualizar una tarea
    describe('PUT /api/tareas/:id', () => {
        test('Debe actualizar una tarea existente con status 200', async () => {
            const datosActualizados = {
                id_alumno: alumnoId,
                id_materia: materiaId,
                titulo: 'Tarea Actualizada',
                descripcion: 'Nueva descripción',
                fecha_entrega: '2025-12-25',
                estado: 'completada'
            };

            const response = await request(app)
                .put(`/api/tareas/${tareaId}`)
                .send(datosActualizados)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.titulo).toBe(datosActualizados.titulo);
            expect(response.body.estado).toBe(datosActualizados.estado);
        });
    });

    // TEST: Eliminar una tarea
    describe('DELETE /api/tareas/:id', () => {
        test('Debe eliminar una tarea con status 200', async () => {
            const response = await request(app)
                .delete(`/api/tareas/${tareaId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
        });
    });
});