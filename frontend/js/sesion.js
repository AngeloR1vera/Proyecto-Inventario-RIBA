const CLAVE_TOKEN = "riba_token";
const CLAVE_USUARIO = "riba_usuario";

export function guardarSesion(token, usuario) {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem(CLAVE_USUARIO);
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
  window.location.href = "index.html";
}

export function exigirSesion() {
  if (!obtenerToken()) {
    window.location.href = "index.html";
  }
}