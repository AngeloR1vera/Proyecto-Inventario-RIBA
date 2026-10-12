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

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const nombre = req.body.nombre ? req.body.nombre.trim() : '';
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;
    const rol = req.body.rol;

    if (isNaN(id)) {
      return res.status(400).json({ mensaje: 'El id del usuario no es válido' });
    }

    if (!nombre || !email || !rol) {
      return res.status(400).json({ mensaje: 'Nombre, correo y rol son obligatorios' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ mensaje: 'El correo no es válido' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (rol !== 'admin' && rol !== 'operador') {
      return res.status(400).json({ mensaje: 'El rol debe ser admin u operador' });
    }

    if (id === req.usuario.id && rol !== 'admin') {
      return res.status(400).json({ mensaje: 'No puedes quitarte el rol de administrador' });
    }

    const usuarioActualizado = await usuarioService.actualizarUsuario(id, nombre, email, rol, password);
    res.json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
}

async function desactivar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ mensaje: 'El id del usuario no es válido' });
    }

    if (id === req.usuario.id) {
      return res.status(400).json({ mensaje: 'No puedes desactivar tu propia cuenta' });
    }

    await usuarioService.desactivarUsuario(id);
    res.json({ mensaje: 'Usuario desactivado' });
  } catch (error) {
    next(error);
  }
}

async function reactivar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ mensaje: 'El id del usuario no es válido' });
    }

    const usuarioReactivado = await usuarioService.reactivarUsuario(id);
    res.json(usuarioReactivado);
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, desactivar, reactivar };