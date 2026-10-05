const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');

async function iniciarSesion(email, password) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !usuario.activo) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
  };
}

module.exports = { iniciarSesion };