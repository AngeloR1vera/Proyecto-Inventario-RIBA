const { prisma } = require('../lib/prisma');

async function listarProductos() {
  return prisma.producto.findMany({
    where: { activo: true },
    include: { categoria: { select: { nombre: true, prefijo: true } } },
    orderBy: { codigo: 'asc' }
  });
}

async function crearProducto(nombre, categoriaId, stockMinimo, unidadMedida, imagenUrl) {
  return prisma.$transaction(async (tx) => {
    const categoria = await tx.categoria.update({
      where: { id: categoriaId },
      data: { ultimoNumero: { increment: 1 } }
    });

    const codigo = `${categoria.prefijo}-${String(categoria.ultimoNumero).padStart(3, '0')}`;

    return tx.producto.create({
      data: { nombre, codigo, categoriaId, stockMinimo, unidadMedida, imagenUrl }
    });
  });
}

async function actualizarProducto(id, nombre, categoriaId, stockMinimo, unidadMedida, imagenUrl) {
  return prisma.producto.update({
    where: { id },
    data: { nombre, categoriaId, stockMinimo, unidadMedida, imagenUrl }
  });
}

async function desactivarProducto(id) {
  return prisma.producto.update({
    where: { id },
    data: { activo: false }
  });
}

module.exports = { listarProductos, crearProducto, actualizarProducto, desactivarProducto };