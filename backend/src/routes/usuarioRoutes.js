const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = express.Router();

router.use(verificarToken);
router.use(verificarRol('admin'));

router.get('/', usuarioController.listar);
router.post('/', usuarioController.crear);

module.exports = router;