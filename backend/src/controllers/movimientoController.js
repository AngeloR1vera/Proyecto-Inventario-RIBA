const movimientoService = require('../services/movimientoService');

async function listar(req, res, next) {
  try {
    const movimientos = await movimientoService.listarMovimientos();
    res.json(movimientos);
  } catch (error) {
    next(error);
  }
}

async function registrar(req, res, next) {
  try {
    const productoId = Number(req.body.productoId);
    const tipo = String(req.body.tipo || '').toUpperCase();
    const cantidad = Number(req.body.cantidad);
    const sentidoAjuste = req.body.sentidoAjuste ? String(req.body.sentidoAjuste).toUpperCase() : null;
    const notas = req.body.notas ? String(req.body.notas).trim() : null;

    const tiposValidos = ['ENTRADA', 'SALIDA', 'AJUSTE'];
    if (!productoId || !tiposValidos.includes(tipo)) {
      return res.status(400).json({ mensaje: 'Producto y tipo de movimiento son obligatorios' });
    }
    if (!(cantidad > 0)) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser mayor que cero' });
    }
    if (tipo === 'AJUSTE' && !['INCREMENTO', 'DECREMENTO'].includes(sentidoAjuste)) {
      return res.status(400).json({ mensaje: 'Un ajuste debe indicar si incrementa o disminuye el stock' });
    }

    const movimiento = await movimientoService.registrarMovimiento(
      productoId, tipo, cantidad, req.usuario.id, sentidoAjuste, notas
    );
    res.status(201).json(movimiento);
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, registrar };