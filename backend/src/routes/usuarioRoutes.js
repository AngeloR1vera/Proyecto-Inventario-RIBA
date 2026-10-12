const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol('admin'));

router.get('/', usuarioController.listar);
router.post('/', usuarioController.crear);
router.put('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.desactivar);
router.patch('/:id/reactivar', usuarioController.reactivar);

module.exports = router;