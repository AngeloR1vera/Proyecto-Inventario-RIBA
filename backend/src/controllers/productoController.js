const productoService = require('../services/productoService');

async function listar(req, res, next) {
  try {
    const buscar = req.query.buscar ? req.query.buscar.trim() : '';
    const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : null;

    if (categoriaId !== null && isNaN(categoriaId)) {
      return res.status(400).json({ mensaje: 'El filtro de categoría no es válido' });
    }

    const productos = await productoService.listarProductos(buscar, categoriaId);
    res.json(productos);
  } catch (error) {
    next(error);
  }
}

async function listarAlertas(req, res, next) {
  try {
    const productosEnAlerta = await productoService.listarProductosEnAlerta();
    res.json(productosEnAlerta);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const categoriaId = Number(req.body.categoriaId);
    const precio = Number(req.body.precio ?? 0);
    const stockMinimo = Number(req.body.stockMinimo ?? 0);
    const unidadMedida = String(req.body.unidadMedida || '').trim();
    const imagenUrl = req.body.imagenUrl ? String(req.body.imagenUrl).trim() : null;

    if (!nombre || !categoriaId || !unidadMedida) {
      return res.status(400).json({ mensaje: 'Nombre, categoría y unidad de medida son obligatorios' });
    }
    if (stockMinimo < 0) {
      return res.status(400).json({ mensaje: 'El stock mínimo no puede ser negativo' });
    }
    if (!(precio >= 0)) {                                       
      return res.status(400).json({ mensaje: 'El precio no puede ser negativo' });  
    }

    const producto = await productoService.crearProducto(nombre, categoriaId, precio, stockMinimo, unidadMedida, imagenUrl);
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const nombre = String(req.body.nombre || '').trim();
    const categoriaId = Number(req.body.categoriaId);
    const precio = req.body.precio === undefined ? undefined : Number(req.body.precio); 
    const stockMinimo = Number(req.body.stockMinimo ?? 0);
    const unidadMedida = String(req.body.unidadMedida || '').trim();
    const imagenUrl = req.body.imagenUrl ? String(req.body.imagenUrl).trim() : null;

    if (!Number.isInteger(id) || !nombre || !categoriaId || !unidadMedida) {
      return res.status(400).json({ mensaje: 'Datos incompletos o inválidos' });
    }
    if (precio !== undefined && !(precio >= 0)) {               
      return res.status(400).json({ mensaje: 'El precio no puede ser negativo' });  
    }

    const producto = await productoService.actualizarProducto(id, nombre, categoriaId, precio, stockMinimo, unidadMedida, imagenUrl);
    res.json(producto);
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

    await productoService.desactivarProducto(id);
    res.json({ mensaje: 'Producto desactivado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, listarAlertas, crear, actualizar, desactivar };