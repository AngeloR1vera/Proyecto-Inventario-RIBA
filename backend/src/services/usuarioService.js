const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');

const datosVisibles = { id: true, nombre: true, email: true, rol: true, activo: true };

async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: datosVisibles,
    orderBy: { nombre: 'asc' }
  });
}

async function crearUsuario(nombre, email, password, rol) {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol },
      select: datosVisibles
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const errorDuplicado = new Error('Ya existe un usuario con ese correo');
      errorDuplicado.status = 409;
      throw errorDuplicado;
    }
    throw error;
  }
}

async function actualizarUsuario(id, nombre, email, rol, password) {
  const datos = { nombre, email, rol };

  if (password) {
    datos.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    return await prisma.usuario.update({
      where: { id },
      data: datos,
      select: datosVisibles
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const errorDuplicado = new Error('Ya existe un usuario con ese correo');
      errorDuplicado.status = 409;
      throw errorDuplicado;
    }
    if (error.code === 'P2025') {
      const errorNoExiste = new Error('Usuario no encontrado');
      errorNoExiste.status = 404;
      throw errorNoExiste;
    }
    throw error;
  }
}

async function desactivarUsuario(id) {
  try {
    return await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: datosVisibles
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const errorNoExiste = new Error('Usuario no encontrado');
      errorNoExiste.status = 404;
      throw errorNoExiste;
    }
    throw error;
  }
}

async function reactivarUsuario(id) {
  try {
    return await prisma.usuario.update({
      where: { id },
      data: { activo: true },
      select: datosVisibles
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const errorNoExiste = new Error('Usuario no encontrado');
      errorNoExiste.status = 404;
      throw errorNoExiste;
    }
    throw error;
  }
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, desactivarUsuario, reactivarUsuario };