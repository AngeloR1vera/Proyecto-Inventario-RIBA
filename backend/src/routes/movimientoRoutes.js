const { Router } = require('express');
const movimientoController = require('../controllers/movimientoController');
const verificarToken = require('../middlewares/verificarToken');

const router = Router();

router.use(verificarToken);

router.get('/', movimientoController.listar);
router.post('/', movimientoController.registrar);

module.exports = router;