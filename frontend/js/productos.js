import {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "./api.js";
import { exigirSesion, obtenerUsuario, cerrarSesion } from "./sesion.js";
import { formatearPrecio, formatearCantidad, estadoStock } from "./utilidades.js";

exigirSesion();

const textoUsuario = document.getElementById("textoUsuario");
const botonSalir = document.getElementById("botonSalir");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const mensajeEstado = document.getElementById("mensajeEstado");

const formProducto = document.getElementById("formProducto");
const tituloFormulario = document.getElementById("tituloFormulario");
const campoNombre = document.getElementById("nombreProducto");
const campoCategoria = document.getElementById("categoriaProducto");
const campoPrecio = document.getElementById("precioProducto");
const campoStockMinimo = document.getElementById("stockMinimoProducto");
const campoUnidad = document.getElementById("unidadProducto");
const campoImagen = document.getElementById("imagenProducto");
const botonGuardar = formProducto.querySelector("button[type='submit']");
const botonCancelar = document.getElementById("botonCancelar");
const mensajeFormulario = document.getElementById("mensajeFormulario");

const campoBusqueda = document.getElementById("campoBusqueda");
const filtroCategoria = document.getElementById("filtroCategoria");

let idProductoEditando = null;
let categoriasPorId = {};
let temporizadorBusqueda = null;
let numeroPeticion = 0;

const usuarioActual = obtenerUsuario();
if (usuarioActual) {
  textoUsuario.textContent = usuarioActual.nombre;
}
botonSalir.addEventListener("click", cerrarSesion);

function prepararEdicion(producto) {
  idProductoEditando = producto.id;

  campoNombre.value = producto.nombre;
  campoCategoria.value = String(producto.categoriaId);
  campoPrecio.value = Number(producto.precio);
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

function crearCeldaEstado(producto) {
  const celdaEstado = document.createElement("td");
  const estado = estadoStock(producto);

  if (estado === "normal") {
    celdaEstado.textContent = "-";
    return celdaEstado;
  }

  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta-stock etiqueta-" + estado;
  etiqueta.textContent = estado === "agotado" ? "Agotado" : "Stock bajo";
  celdaEstado.appendChild(etiqueta);
  return celdaEstado;
}

function dibujarProductos(productosRecibidos) {
  cuerpoTabla.innerHTML = "";

  for (const producto of productosRecibidos) {
    const nombreCategoria =
      producto.categoria?.nombre || categoriasPorId[producto.categoriaId] || "Sin categoría";
    const valoresFila = [
      producto.codigo,
      producto.nombre,
      nombreCategoria,
      formatearPrecio(producto.precio),
      formatearCantidad(producto.stockActual),
      formatearCantidad(producto.stockMinimo),
      producto.unidadMedida
    ];

    const fila = document.createElement("tr");
    const estado = estadoStock(producto);
    if (estado !== "normal") {
      fila.classList.add("fila-" + estado);
    }

    for (const valor of valoresFila) {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.appendChild(celda);
    }

    fila.appendChild(crearCeldaEstado(producto));

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
  const miPeticion = ++numeroPeticion;
  const textoBusqueda = campoBusqueda.value.trim();
  const categoriaFiltrada = filtroCategoria.value;
  const hayFiltros = textoBusqueda !== "" || categoriaFiltrada !== "";

  mensajeEstado.textContent = "Cargando productos...";

  try {
    const productosRecibidos = await obtenerProductos(textoBusqueda, categoriaFiltrada);

    // Si el usuario siguió escribiendo mientras esperaba, esta respuesta ya quedó vieja
    if (miPeticion !== numeroPeticion) return;

    if (productosRecibidos.length === 0) {
      cuerpoTabla.innerHTML = "";
      mensajeEstado.textContent = hayFiltros
        ? "No hay productos que coincidan con la búsqueda."
        : "Todavía no hay productos registrados.";
      return;
    }

    mensajeEstado.textContent = "";
    dibujarProductos(productosRecibidos);
  } catch (error) {
    if (miPeticion !== numeroPeticion) return;
    mensajeEstado.textContent = error.message;
  }
}

function crearOpcionCategoria(categoria) {
  const opcion = document.createElement("option");
  opcion.value = categoria.id;
  opcion.textContent = categoria.nombre;
  return opcion;
}

async function cargarCategorias() {
  try {
    const categoriasRecibidas = await obtenerCategorias();

    categoriasPorId = {};
    campoCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';

    for (const categoria of categoriasRecibidas) {
      categoriasPorId[categoria.id] = categoria.nombre;
      campoCategoria.appendChild(crearOpcionCategoria(categoria));
      filtroCategoria.appendChild(crearOpcionCategoria(categoria));
    }
  } catch (error) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "No se pudieron cargar las categorías: " + error.message;
  }
}

campoBusqueda.addEventListener("input", () => {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(cargarProductos, 300);
});

filtroCategoria.addEventListener("change", cargarProductos);

formProducto.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeFormulario.textContent = "";

  const nombreProducto = campoNombre.value.trim();
  const unidadMedida = campoUnidad.value.trim();
  const precioProducto = Number(campoPrecio.value);
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
  if (!(precioProducto >= 0)) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "El precio no puede ser negativo.";
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
    precio: precioProducto,
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