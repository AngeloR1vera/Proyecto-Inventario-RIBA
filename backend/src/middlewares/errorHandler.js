function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con ese valor único' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ mensaje: 'No se encontró el registro solicitado' });
  }

  res.status(err.status || 500).json({ mensaje: err.message || 'Error interno del servidor' });
}

module.exports = errorHandler;