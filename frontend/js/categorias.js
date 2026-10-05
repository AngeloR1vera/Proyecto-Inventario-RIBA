import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from "./api.js";
import { exigirSesion, obtenerUsuario, cerrarSesion } from "./sesion.js";

exigirSesion();

const textoUsuario = document.getElementById("textoUsuario");
const botonSalir = document.getElementById("botonSalir");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const mensajeEstado = document.getElementById("mensajeEstado");

const formCategoria = document.getElementById("formCategoria");
const tituloFormulario = document.getElementById("tituloFormulario");
const campoNombre = document.getElementById("nombreCategoria");
const campoPrefijo = document.getElementById("prefijoCategoria");
const botonGuardar = formCategoria.querySelector("button[type='submit']");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeFormulario = document.getElementById("mensajeFormulario");

let idCategoriaEditando = null;

const usuarioActual = obtenerUsuario();
if (usuarioActual) {
  textoUsuario.textContent = usuarioActual.nombre;
}
botonSalir.addEventListener("click", cerrarSesion);

function prepararEdicion(categoria) {
  idCategoriaEditando = categoria.id;

  campoNombre.value = categoria.nombre;
  campoPrefijo.value = categoria.prefijo;
  campoPrefijo.disabled = true;

  tituloFormulario.textContent = "Editar categoría";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  mensajeFormulario.textContent = "";

  formCategoria.scrollIntoView({ behavior: "smooth" });
}

function salirModoEdicion() {
  idCategoriaEditando = null;
  formCategoria.reset();
  campoPrefijo.disabled = false;
  tituloFormulario.textContent = "Nueva categoría";
  botonGuardar.textContent = "Guardar categoría";
  botonCancelar.hidden = true;
}

botonCancelar.addEventListener("click", () => {
  salirModoEdicion();
  mensajeFormulario.textContent = "";
});

function dibujarCategorias(categoriasRecibidas) {
  cuerpoTabla.innerHTML = "";

  for (const categoria of categoriasRecibidas) {
    const fila = document.createElement("tr");

    const celdaPrefijo = document.createElement("td");
    celdaPrefijo.textContent = categoria.prefijo;

    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = categoria.nombre;

    const celdaAcciones = document.createElement("td");

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.textContent = "Editar";
    botonEditar.className = "boton-secundario";
    botonEditar.addEventListener("click", () => prepararEdicion(categoria));

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.className = "boton-peligro";
    botonEliminar.addEventListener("click", () => confirmarEliminacion(categoria));

    celdaAcciones.append(botonEditar, botonEliminar);
    fila.append(celdaPrefijo, celdaNombre, celdaAcciones);
    cuerpoTabla.appendChild(fila);
  }
}

async function confirmarEliminacion(categoria) {
  const seguro = confirm(`¿Eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`);
  if (!seguro) return;

  try {
    await eliminarCategoria(categoria.id);
    if (categoria.id === idCategoriaEditando) {
      salirModoEdicion();
    }
    await cargarCategorias();
  } catch (error) {
    mensajeEstado.textContent = "No se pudo eliminar la categoría: " + error.message;
  }
}

async function cargarCategorias() {
  mensajeEstado.textContent = "Cargando categorías...";

  try {
    const categoriasRecibidas = await obtenerCategorias();

    if (categoriasRecibidas.length === 0) {
      cuerpoTabla.innerHTML = "";
      mensajeEstado.textContent = "Todavía no hay categorías registradas.";
      return;
    }

    mensajeEstado.textContent = "";
    dibujarCategorias(categoriasRecibidas);
  } catch (error) {
    mensajeEstado.textContent = error.message;
  }
}

formCategoria.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeFormulario.textContent = "";

  const nombreCategoria = campoNombre.value.trim();
  const prefijoCategoria = campoPrefijo.value.trim().toUpperCase();
  const estabaEditando = idCategoriaEditando !== null;

  if (nombreCategoria === "") {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "El nombre no puede estar vacío.";
    return;
  }
  if (!estabaEditando && !/^[A-Z]+$/.test(prefijoCategoria)) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "El prefijo debe tener solo letras, sin espacios ni números.";
    return;
  }

  botonGuardar.disabled = true;
  botonGuardar.textContent = "Guardando...";

  try {
    if (estabaEditando) {
      await actualizarCategoria(idCategoriaEditando, { nombre: nombreCategoria });
    } else {
      await crearCategoria({ nombre: nombreCategoria, prefijo: prefijoCategoria });
    }

    salirModoEdicion();
    mensajeFormulario.className = "mensaje-ok";
    mensajeFormulario.textContent = estabaEditando
      ? "Cambios guardados correctamente."
      : "Categoría guardada correctamente.";
    await cargarCategorias();
  } catch (error) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = error.message;
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = idCategoriaEditando === null ? "Guardar categoría" : "Guardar cambios";
  }
});

cargarCategorias();