const categoriaService = require('../services/categoriaService');

async function listar(req, res, next) {
  try {
    const categorias = await categoriaService.listarCategorias();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const prefijo = String(req.body.prefijo || '').trim().toUpperCase();

    if (!nombre || !/^[A-Z]{2,3}$/.test(prefijo)) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio y el prefijo debe tener 2 o 3 letras' });
    }

    const categoria = await categoriaService.crearCategoria(nombre, prefijo);
    res.status(201).json(categoria);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const nombre = String(req.body.nombre || '').trim();

    if (!Number.isInteger(id) || !nombre) {
      return res.status(400).json({ mensaje: 'Se necesita un id válido y un nombre' });
    }

    const categoria = await categoriaService.actualizarCategoria(id, nombre);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
}

async function desactivar(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensaje: 'El id no es válido' });
    }

    await categoriaService.desactivarCategoria(id);
    res.json({ mensaje: 'Categoría desactivada' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, crear, actualizar, desactivar };