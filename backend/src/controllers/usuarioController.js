const usuarioService = require('../services/usuarioService');

async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const nombre = req.body.nombre ? req.body.nombre.trim() : '';
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;
    const rol = req.body.rol || 'operador';

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ mensaje: 'El correo no es válido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (rol !== 'admin' && rol !== 'operador') {
      return res.status(400).json({ mensaje: 'El rol debe ser admin u operador' });
    }

    const usuarioNuevo = await usuarioService.crearUsuario(nombre, email, password, rol);
    res.status(201).json(usuarioNuevo);
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear };