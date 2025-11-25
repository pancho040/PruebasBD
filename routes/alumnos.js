const express = require('express');
const router = express.Router();
const alumnosController = require('../controllers/alumnosController');

router.get('/', alumnosController.getAlumnos);
router.get('/:id', alumnosController.getAlumnoById);
router.post('/', alumnosController.createAlumno);
router.put('/:id', alumnosController.updateAlumno);
router.delete('/:id', alumnosController.deleteAlumno);

module.exports = router;