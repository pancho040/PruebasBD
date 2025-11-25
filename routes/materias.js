const express = require('express');
const router = express.Router();
const materiasController = require('../controllers/materiasController');

router.get('/', materiasController.getMaterias);
router.get('/:id', materiasController.getMateriaById);
router.post('/', materiasController.createMateria);
router.put('/:id', materiasController.updateMateria);
router.delete('/:id', materiasController.deleteMateria);

module.exports = router;