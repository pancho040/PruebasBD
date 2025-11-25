const request = require('supertest');
const app = require('../../server');

let alumnos = [];
let materias = [];
let tareas = [];

describe('E2E Avanzado - Alumnos, Materias y Tareas', () => {

    // CREAR MULTIPLES ALUMNOS
    test('Crear 2 alumnos', async () => {
        const datosAlumnos = [
            { nombre: 'Alumno1', apellido: 'Test1', email: `e2e1_${Date.now()}@test.com` },
            { nombre: 'Alumno2', apellido: 'Test2', email: `e2e2_${Date.now()}@test.com` }
        ];

        for (const alumno of datosAlumnos) {
            const res = await request(app)
                .post('/api/alumnos')
                .send(alumno)
                .expect(201);
            expect(res.body).toHaveProperty('id_alumno');
            alumnos.push(res.body);
        }
    });

    // CREAR MULTIPLES MATERIAS
    test('Crear 2 materias', async () => {
        const datosMaterias = [
            { nombre: 'Materia1', descripcion: 'Descripcion1' },
            { nombre: 'Materia2', descripcion: 'Descripcion2' }
        ];

        for (const materia of datosMaterias) {
            const res = await request(app)
                .post('/api/materias')
                .send(materia)
                .expect(201);
            expect(res.body).toHaveProperty('id_materia');
            materias.push(res.body);
        }
    });

    // CREAR TAREAS PARA LOS ALUMNOS Y MATERIAS
    test('Crear tareas cruzadas para alumnos y materias', async () => {
        for (const alumno of alumnos) {
            for (const materia of materias) {
                const tarea = {
                    id_alumno: alumno.id_alumno,
                    id_materia: materia.id_materia,
                    titulo: `Tarea de ${alumno.nombre} - ${materia.nombre}`,
                    descripcion: 'Tarea de prueba E2E',
                    fecha_entrega: '2025-12-31',
                    estado: 'pendiente'
                };

                const res = await request(app)
                    .post('/api/tareas')
                    .send(tarea)
                    .expect(201);
                expect(res.body).toHaveProperty('id_tarea');
                tareas.push(res.body);
            }
        }
    });

    // OBTENER TODAS LAS TAREAS Y VERIFICAR RELACIONES
    test('GET /api/tareas - todas las tareas con alumno y materia', async () => {
        const res = await request(app)
            .get('/api/tareas')
            .expect(200);

        for (const tarea of tareas) {
            const encontrada = res.body.find(t => t.id_tarea === tarea.id_tarea);
            expect(encontrada).toBeDefined();
            expect(encontrada.alumnos).toHaveProperty('id_alumno');
            expect(encontrada.materias).toHaveProperty('id_materia');
        }
    });

    // ESCENARIO DE ERROR: Crear alumno sin nombre
    test('Crear alumno sin nombre debe fallar', async () => {
        const res = await request(app)
            .post('/api/alumnos')
            .send({ apellido: 'Test', email: 'fail@test.com' })
            .expect(500);
    });

    // ACTUALIZAR TAREA
    test('Actualizar estado de una tarea', async () => {
        const tarea = tareas[0];
        const res = await request(app)
            .put(`/api/tareas/${tarea.id_tarea}`)
            .send({
                id_alumno: tarea.id_alumno,
                id_materia: tarea.id_materia,
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                fecha_entrega: tarea.fecha_entrega,
                estado: 'completada'
            })
            .expect(200);

        expect(res.body.estado).toBe('completada');
    });

    // ESCENARIO DE ERROR: Obtener tarea inexistente
    test('GET tarea inexistente debe retornar 404 o error', async () => {
        await request(app)
            .get('/api/tareas/999999')
            .expect(500);
    });

    // LIMPIEZA: eliminar todas las tareas, alumnos y materias
    test('Eliminar todas las tareas, alumnos y materias', async () => {
        for (const tarea of tareas) {
            await request(app).delete(`/api/tareas/${tarea.id_tarea}`).expect(200);
        }
        for (const alumno of alumnos) {
            await request(app).delete(`/api/alumnos/${alumno.id_alumno}`).expect(200);
        }
        for (const materia of materias) {
            await request(app).delete(`/api/materias/${materia.id_materia}`).expect(200);
        }
    });

});
