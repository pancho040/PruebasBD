const request = require('supertest');
const app = require('../server');

let materiaId;

describe('CRUD de Materias', () => {
    
    // TEST: Obtener todas las materias
    describe('GET /api/materias', () => {
        test('Debe retornar todas las materias con status 200', async () => {
            const response = await request(app)
                .get('/api/materias')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    // TEST: Crear una materia
    describe('POST /api/materias', () => {
        test('Debe crear una nueva materia con status 201', async () => {
            const nuevaMateria = {
                nombre: 'Matemáticas Avanzadas',
                descripcion: 'Curso de cálculo diferencial e integral'
            };

            const response = await request(app)
                .post('/api/materias')
                .send(nuevaMateria)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('id_materia');
            expect(response.body.nombre).toBe(nuevaMateria.nombre);
            expect(response.body.descripcion).toBe(nuevaMateria.descripcion);

            materiaId = response.body.id_materia;
        });

        test('Debe crear materia sin descripción', async () => {
            const materiaSimple = {
                nombre: 'Física'
            };

            const response = await request(app)
                .post('/api/materias')
                .send(materiaSimple)
                .expect(201);

            expect(response.body.nombre).toBe(materiaSimple.nombre);
        });
    });

    // TEST: Obtener una materia por ID
    describe('GET /api/materias/:id', () => {
        test('Debe retornar una materia específica con status 200', async () => {
            const response = await request(app)
                .get(`/api/materias/${materiaId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('id_materia', materiaId);
            expect(response.body).toHaveProperty('nombre');
        });
    });

    // TEST: Actualizar una materia
    describe('PUT /api/materias/:id', () => {
        test('Debe actualizar una materia existente con status 200', async () => {
            const datosActualizados = {
                nombre: 'Matemáticas Aplicadas',
                descripcion: 'Curso actualizado de matemáticas'
            };

            const response = await request(app)
                .put(`/api/materias/${materiaId}`)
                .send(datosActualizados)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.nombre).toBe(datosActualizados.nombre);
            expect(response.body.descripcion).toBe(datosActualizados.descripcion);
        });
    });

    // TEST: Eliminar una materia
    describe('DELETE /api/materias/:id', () => {
        test('Debe eliminar una materia con status 200', async () => {
            const response = await request(app)
                .delete(`/api/materias/${materiaId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
        });
    });
});