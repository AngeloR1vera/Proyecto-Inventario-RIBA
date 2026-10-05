function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = verificarRol;