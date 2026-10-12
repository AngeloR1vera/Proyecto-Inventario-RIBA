const { Router } = require('express');
const categoriaController = require('../controllers/categoriaController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = Router();

router.use(verificarToken);

router.get('/', categoriaController.listar);
router.post('/', verificarRol('admin'), categoriaController.crear);
router.put('/:id', verificarRol('admin'), categoriaController.actualizar);
router.delete('/:id', verificarRol('admin'), categoriaController.desactivar);

module.exports = router;