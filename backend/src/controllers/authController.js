const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const resultado = await authService.iniciarSesion(email, password);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

module.exports = { login };