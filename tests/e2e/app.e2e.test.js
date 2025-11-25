const request = require('supertest');
const app = require('../../server');

let alumnoId, materiaId, tareaId;

describe('E2E - Flujo completo Alumnos, Materias y Tareas', () => {

    // Crear alumno
    test('Crear un alumno', async () => {
        const alumno = { nombre: 'E2E Alumno', apellido: 'Test', email: `e2e${Date.now()}@test.com` };
        const res = await request(app)
            .post('/api/alumnos')
            .send(alumno)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toHaveProperty('id_alumno');
        alumnoId = res.body.id_alumno;
    });

    // Crear materia
    test('Crear una materia', async () => {
        const materia = { nombre: 'E2E Materia', descripcion: 'Materia para test E2E' };
        const res = await request(app)
            .post('/api/materias')
            .send(materia)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toHaveProperty('id_materia');
        materiaId = res.body.id_materia;
    });

    // Crear tarea
    test('Crear una tarea para el alumno y materia', async () => {
        const tarea = {
            id_alumno: alumnoId,
            id_materia: materiaId,
            titulo: 'E2E Tarea',
            descripcion: 'Tarea creada en prueba E2E',
            fecha_entrega: '2025-12-31',
            estado: 'pendiente'
        };
        const res = await request(app)
            .post('/api/tareas')
            .send(tarea)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toHaveProperty('id_tarea');
        expect(res.body.id_alumno).toBe(alumnoId);
        expect(res.body.id_materia).toBe(materiaId);

        tareaId = res.body.id_tarea;
    });

    // Obtener tarea y verificar datos
    test('Obtener tarea creada', async () => {
        const res = await request(app)
            .get(`/api/tareas/${tareaId}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body).toHaveProperty('id_tarea', tareaId);
        expect(res.body.alumnos.id_alumno).toBe(alumnoId);
        expect(res.body.materias.id_materia).toBe(materiaId);
    });

    // Actualizar tarea
    test('Actualizar estado de la tarea', async () => {
        const res = await request(app)
            .put(`/api/tareas/${tareaId}`)
            .send({ estado: 'completada', id_alumno: alumnoId, id_materia: materiaId, titulo: 'E2E Tarea', descripcion: 'Tarea actualizada', fecha_entrega: '2025-12-31' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body.estado).toBe('completada');
    });

    // Limpiar: eliminar tarea, alumno y materia
    test('Eliminar tarea, alumno y materia', async () => {
        await request(app).delete(`/api/tareas/${tareaId}`).expect(200);
        await request(app).delete(`/api/alumnos/${alumnoId}`).expect(200);
        await request(app).delete(`/api/materias/${materiaId}`).expect(200);
    });
});
