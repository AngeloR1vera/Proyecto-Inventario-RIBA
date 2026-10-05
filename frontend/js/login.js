import { iniciarSesion } from "./api.js";
import { guardarSesion, obtenerToken } from "./sesion.js";

const formularioLogin = document.getElementById("formLogin");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const mensajeError = document.getElementById("mensajeError");
const botonEntrar = formularioLogin.querySelector("button");

if (obtenerToken()) {
  window.location.href = "productos.html";
}

formularioLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeError.textContent = "";

  botonEntrar.disabled = true;
  botonEntrar.textContent = "Entrando...";

  try {
    const { token, usuario } = await iniciarSesion(
      campoEmail.value.trim(),
      campoPassword.value
    );
    guardarSesion(token, usuario);
    window.location.href = "productos.html";
  } catch (error) {
    mensajeError.textContent = error.message;
    botonEntrar.disabled = false;
    botonEntrar.textContent = "Entrar";
  }
});