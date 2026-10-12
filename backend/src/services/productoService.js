const { prisma } = require('../lib/prisma');

async function listarProductos(buscar, categoriaId) {
  const filtros = { activo: true };

  if (buscar) {
    filtros.OR = [
      { nombre: { contains: buscar, mode: 'insensitive' } },
      { codigo: { contains: buscar, mode: 'insensitive' } }
    ];
  }

  if (categoriaId) {
    filtros.categoriaId = categoriaId;
  }

  return prisma.producto.findMany({
    where: filtros,
    include: { categoria: { select: { nombre: true, prefijo: true } } },
    orderBy: { codigo: 'asc' }
  });
}

async function crearProducto(nombre, categoriaId, precio, stockMinimo, unidadMedida, imagenUrl) {
  return prisma.$transaction(async (tx) => {
    const categoria = await tx.categoria.update({
      where: { id: categoriaId },
      data: { ultimoNumero: { increment: 1 } }
    });

    const codigo = `${categoria.prefijo}-${String(categoria.ultimoNumero).padStart(3, '0')}`;

    return tx.producto.create({
      data: { nombre, codigo, categoriaId, precio, stockMinimo, unidadMedida, imagenUrl }
    });
  });
}

async function actualizarProducto(id, nombre, categoriaId, precio, stockMinimo, unidadMedida, imagenUrl) {
  return prisma.producto.update({
    where: { id },
    data: { nombre, categoriaId, precio, stockMinimo, unidadMedida, imagenUrl }
  });
}

async function desactivarProducto(id) {
  return prisma.producto.update({
    where: { id },
    data: { activo: false }
  });
}

module.exports = { listarProductos, crearProducto, actualizarProducto, desactivarProducto };