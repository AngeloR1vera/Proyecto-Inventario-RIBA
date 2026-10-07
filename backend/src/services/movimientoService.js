const { prisma } = require('../lib/prisma');

async function listarMovimientos() {
  return prisma.movimiento.findMany({
    include: {
      producto: { select: { codigo: true, nombre: true } },
      usuario: { select: { nombre: true } }
    },
    orderBy: { fecha: 'desc' }
  });
}

async function registrarMovimiento(productoId, tipo, cantidad, usuarioId, sentidoAjuste, notas) {
  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({ where: { id: productoId } });

    if (!producto || !producto.activo) {
      const error = new Error('El producto no existe o está inactivo');
      error.status = 404;
      throw error;
    }

    let stockNuevo;
    if (tipo === 'ENTRADA') {
      stockNuevo = Number(producto.stockActual) + cantidad;
    } else if (tipo === 'SALIDA') {
      stockNuevo = Number(producto.stockActual) - cantidad;
    } else {
      stockNuevo = sentidoAjuste === 'INCREMENTO'
        ? Number(producto.stockActual) + cantidad
        : Number(producto.stockActual) - cantidad;
    }

    if (stockNuevo < 0) {
      const error = new Error(`Stock insuficiente: solo hay ${producto.stockActual} ${producto.unidadMedida} disponibles`);
      error.status = 400;
      throw error;
    }

    await tx.producto.update({
      where: { id: productoId },
      data: { stockActual: stockNuevo }
    });

    return tx.movimiento.create({
      data: { productoId, tipo, cantidad, usuarioId, sentidoAjuste, notas }
    });
  });
}

module.exports = { listarMovimientos, registrarMovimiento };