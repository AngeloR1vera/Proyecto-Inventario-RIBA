const { Router } = require('express');
const productoController = require('../controllers/productoController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = Router();

router.use(verificarToken);

router.get('/', productoController.listar);
router.post('/', verificarRol('admin'), productoController.crear);
router.put('/:id', verificarRol('admin'), productoController.actualizar);
router.delete('/:id', verificarRol('admin'), productoController.desactivar);

module.exports = router;