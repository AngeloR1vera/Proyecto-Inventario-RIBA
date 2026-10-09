import {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "./api.js";
import { exigirSesion, obtenerUsuario, cerrarSesion } from "./sesion.js";

exigirSesion();

const textoUsuario = document.getElementById("textoUsuario");
const botonSalir = document.getElementById("botonSalir");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const mensajeEstado = document.getElementById("mensajeEstado");

const formProducto = document.getElementById("formProducto");
const tituloFormulario = document.getElementById("tituloFormulario");
const campoNombre = document.getElementById("nombreProducto");
const campoCategoria = document.getElementById("categoriaProducto");
const campoStockMinimo = document.getElementById("stockMinimoProducto");
const campoUnidad = document.getElementById("unidadProducto");
const campoImagen = document.getElementById("imagenProducto");
const botonGuardar = formProducto.querySelector("button[type='submit']");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeFormulario = document.getElementById("mensajeFormulario");

let idProductoEditando = null;
let categoriasPorId = {};

const usuarioActual = obtenerUsuario();
if (usuarioActual) {
  textoUsuario.textContent = usuarioActual.nombre;
}
botonSalir.addEventListener("click", cerrarSesion);

function formatearCantidad(valor) {
  return Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 3 });
}

function prepararEdicion(producto) {
  idProductoEditando = producto.id;

  campoNombre.value = producto.nombre;
  campoCategoria.value = String(producto.categoriaId);
  campoStockMinimo.value = Number(producto.stockMinimo);
  campoUnidad.value = producto.unidadMedida;
  campoImagen.value = producto.imagenUrl || "";

  tituloFormulario.textContent = "Editar producto";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  mensajeFormulario.textContent = "";

  formProducto.scrollIntoView({ behavior: "smooth" });
}

function salirModoEdicion() {
  idProductoEditando = null;
  formProducto.reset();
  tituloFormulario.textContent = "Nuevo producto";
  botonGuardar.textContent = "Guardar producto";
  botonCancelar.hidden = true;
}

botonCancelar.addEventListener("click", () => {
  salirModoEdicion();
  mensajeFormulario.textContent = "";
});

function dibujarProductos(productosRecibidos) {
  cuerpoTabla.innerHTML = "";

  for (const producto of productosRecibidos) {
    const nombreCategoria =
      producto.categoria?.nombre || categoriasPorId[producto.categoriaId] || "Sin categoría";
    const valoresFila = [
      producto.codigo,
      producto.nombre,
      nombreCategoria,
      formatearCantidad(producto.stockActual),
      formatearCantidad(producto.stockMinimo),
      producto.unidadMedida
    ];

    const fila = document.createElement("tr");
    for (const valor of valoresFila) {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.appendChild(celda);
    }

    const celdaImagen = document.createElement("td");
    if (producto.imagenUrl) {
      const img = document.createElement("img");
      img.src = producto.imagenUrl;
      img.style.cssText = "width:48px;height:48px;object-fit:cover;border-radius:4px";
      celdaImagen.appendChild(img);
    } else {
      celdaImagen.textContent = "-";
    }
    fila.appendChild(celdaImagen);

    const celdaAcciones = document.createElement("td");

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.textContent = "Editar";
    botonEditar.className = "boton-secundario";
    botonEditar.addEventListener("click", () => prepararEdicion(producto));

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.className = "boton-peligro";
    botonEliminar.addEventListener("click", () => confirmarEliminacion(producto));

    celdaAcciones.appendChild(botonEditar);
    celdaAcciones.appendChild(botonEliminar);
    fila.appendChild(celdaAcciones);

    cuerpoTabla.appendChild(fila);
  }
}

async function confirmarEliminacion(producto) {
  const seguro = confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`);
  if (!seguro) return;

  try {
    await eliminarProducto(producto.id);
    if (producto.id === idProductoEditando) {
      salirModoEdicion();
    }
    await cargarProductos();
  } catch (error) {
    mensajeEstado.textContent = "No se pudo eliminar el producto: " + error.message;
  }
}

async function cargarProductos() {
  mensajeEstado.textContent = "Cargando productos...";

  try {
    const productosRecibidos = await obtenerProductos();

    if (productosRecibidos.length === 0) {
      cuerpoTabla.innerHTML = "";
      mensajeEstado.textContent = "Todavía no hay productos registrados.";
      return;
    }

    mensajeEstado.textContent = "";
    dibujarProductos(productosRecibidos);
  } catch (error) {
    mensajeEstado.textContent = error.message;
  }
}

async function cargarCategorias() {
  try {
    const categoriasRecibidas = await obtenerCategorias();

    categoriasPorId = {};
    campoCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';

    for (const categoria of categoriasRecibidas) {
      categoriasPorId[categoria.id] = categoria.nombre;

      const opcion = document.createElement("option");
      opcion.value = categoria.id;
      opcion.textContent = categoria.nombre;
      campoCategoria.appendChild(opcion);
    }
  } catch (error) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "No se pudieron cargar las categorías: " + error.message;
  }
}

formProducto.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeFormulario.textContent = "";

  const nombreProducto = campoNombre.value.trim();
  const unidadMedida = campoUnidad.value.trim();
  const stockMinimo = Number(campoStockMinimo.value);

  if (nombreProducto === "") {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "El nombre no puede estar vacío.";
    return;
  }
  if (unidadMedida === "") {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "La unidad de medida no puede estar vacía.";
    return;
  }
  if (stockMinimo < 0) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "El stock mínimo no puede ser negativo.";
    return;
  }

  const datosProducto = {
    nombre: nombreProducto,
    categoriaId: Number(campoCategoria.value),
    stockMinimo,
    unidadMedida,
    imagenUrl: campoImagen.value.trim() || null
  };
  const estabaEditando = idProductoEditando !== null;

  botonGuardar.disabled = true;
  botonGuardar.textContent = "Guardando...";

  try {
    if (estabaEditando) {
      await actualizarProducto(idProductoEditando, datosProducto);
    } else {
      await crearProducto(datosProducto);
    }

    salirModoEdicion();
    mensajeFormulario.className = "mensaje-ok";
    mensajeFormulario.textContent = estabaEditando
      ? "Cambios guardados correctamente."
      : "Producto guardado correctamente.";
    await cargarProductos();
  } catch (error) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = error.message;
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = idProductoEditando === null ? "Guardar producto" : "Guardar cambios";
  }
});

async function iniciarPantalla() {
  await cargarCategorias();
  await cargarProductos();
}

iniciarPantalla();