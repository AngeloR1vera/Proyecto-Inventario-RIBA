const { prisma } = require('../lib/prisma');

function listarCategorias() {
  return prisma.categoria.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });
}

async function crearCategoria(nombre, prefijo) {
  try {
    return await prisma.categoria.create({ data: { nombre, prefijo } });
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicada = new Error('Ya existe una categoría con ese nombre o prefijo');
      duplicada.status = 409;
      throw duplicada;
    }
    throw error;
  }
}

async function actualizarCategoria(id, nombre) {
  try {
    return await prisma.categoria.update({ where: { id }, data: { nombre } });
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicada = new Error('Ya existe una categoría con ese nombre');
      duplicada.status = 409;
      throw duplicada;
    }
    if (error.code === 'P2025') {
      const noExiste = new Error('La categoría no existe');
      noExiste.status = 404;
      throw noExiste;
    }
    throw error;
  }
}

async function desactivarCategoria(id) {
  const productosActivos = await prisma.producto.count({
    where: { categoriaId: id, activo: true }
  });

  if (productosActivos > 0) {
    const error = new Error(`No se puede desactivar: la categoría tiene ${productosActivos} producto(s) activo(s)`);
    error.status = 409;
    throw error;
  }

  try {
    return await prisma.categoria.update({ where: { id }, data: { activo: false } });
  } catch (error) {
    if (error.code === 'P2025') {
      const noExiste = new Error('La categoría no existe');
      noExiste.status = 404;
      throw noExiste;
    }
    throw error;
  }
}

module.exports = {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  desactivarCategoria
};