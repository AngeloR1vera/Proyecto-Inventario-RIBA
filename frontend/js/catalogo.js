import { obtenerProductos, obtenerCategorias, obtenerProductosEnAlerta } from "./api.js";
import { exigirSesion } from "./sesion.js";
import { iniciarBarraSuperior } from "./barra.js";
import {
  formatearPrecio,
  formatearCantidad,
  estadoStock,
  crearEtiquetaStock
} from "./utilidades.js";

exigirSesion();
iniciarBarraSuperior();

const mensajeEstado = document.getElementById("mensajeEstado");
const avisoAlertas = document.getElementById("avisoAlertas");
const cuadriculaCatalogo = document.getElementById("cuadriculaCatalogo");
const campoBusqueda = document.getElementById("campoBusqueda");
const filtroCategoria = document.getElementById("filtroCategoria");

let temporizadorBusqueda = null;
let numeroPeticion = 0;

function crearZonaImagen(producto) {
  const zonaImagen = document.createElement("div");
  zonaImagen.className = "tarjeta-imagen";

  if (!producto.imagenUrl) {
    zonaImagen.textContent = "Sin imagen";
    return zonaImagen;
  }

  const imagen = document.createElement("img");
  imagen.src = producto.imagenUrl;
  imagen.alt = producto.nombre;
  imagen.addEventListener("error", () => {
    imagen.remove();
    zonaImagen.textContent = "Sin imagen";
  });
  zonaImagen.appendChild(imagen);
  return zonaImagen;
}

function crearTarjeta(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-producto";

  const estado = estadoStock(producto);
  if (estado !== "normal") {
    tarjeta.classList.add("tarjeta-" + estado);
  }

  const cuerpoTarjeta = document.createElement("div");
  cuerpoTarjeta.className = "tarjeta-cuerpo";

  const codigoProducto = document.createElement("p");
  codigoProducto.className = "tarjeta-codigo";
  codigoProducto.textContent = producto.codigo;

  const nombreProducto = document.createElement("h3");
  nombreProducto.textContent = producto.nombre;

  const categoriaProducto = document.createElement("p");
  categoriaProducto.className = "tarjeta-categoria";
  categoriaProducto.textContent = producto.categoria?.nombre || "Sin categoría";

  const precioProducto = document.createElement("p");
  precioProducto.className = "tarjeta-precio";
  precioProducto.textContent = formatearPrecio(producto.precio);

  const stockProducto = document.createElement("p");
  stockProducto.className = "tarjeta-stock";
  stockProducto.textContent = `Stock: ${formatearCantidad(producto.stockActual)} ${producto.unidadMedida}`;

  cuerpoTarjeta.append(codigoProducto, nombreProducto, categoriaProducto, precioProducto, stockProducto);

  const etiquetaStock = crearEtiquetaStock(producto);
  if (etiquetaStock) {
    cuerpoTarjeta.appendChild(etiquetaStock);
  }

  tarjeta.append(crearZonaImagen(producto), cuerpoTarjeta);
  return tarjeta;
}

function dibujarCatalogo(productosRecibidos) {
  cuadriculaCatalogo.innerHTML = "";

  for (const producto of productosRecibidos) {
    cuadriculaCatalogo.appendChild(crearTarjeta(producto));
  }
}

async function cargarProductos() {
  const miPeticion = ++numeroPeticion;
  const textoBusqueda = campoBusqueda.value.trim();
  const categoriaFiltrada = filtroCategoria.value;
  const hayFiltros = textoBusqueda !== "" || categoriaFiltrada !== "";

  mensajeEstado.textContent = "Cargando catálogo...";

  try {
    const productosRecibidos = await obtenerProductos(textoBusqueda, categoriaFiltrada);

    // Si el usuario siguió escribiendo mientras esperaba, esta respuesta ya quedó vieja
    if (miPeticion !== numeroPeticion) return;

    if (productosRecibidos.length === 0) {
      cuadriculaCatalogo.innerHTML = "";
      mensajeEstado.textContent = hayFiltros
        ? "No hay productos que coincidan con la búsqueda."
        : "Todavía no hay productos en el catálogo.";
      return;
    }

    mensajeEstado.textContent = "";
    dibujarCatalogo(productosRecibidos);
  } catch (error) {
    if (miPeticion !== numeroPeticion) return;
    mensajeEstado.textContent = error.message;
  }
}

async function cargarCategoriasEnFiltro() {
  try {
    const categoriasRecibidas = await obtenerCategorias();

    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    for (const categoria of categoriasRecibidas) {
      const opcion = document.createElement("option");
      opcion.value = categoria.id;
      opcion.textContent = categoria.nombre;
      filtroCategoria.appendChild(opcion);
    }
  } catch (error) {
    mensajeEstado.textContent = "No se pudo cargar el filtro de categorías: " + error.message;
  }
}

async function cargarAvisoAlertas() {
  try {
    const productosEnAlerta = await obtenerProductosEnAlerta();

    if (productosEnAlerta.length === 0) {
      avisoAlertas.hidden = true;
      return;
    }

    avisoAlertas.textContent = productosEnAlerta.length === 1
      ? "1 producto con stock bajo o agotado"
      : `${productosEnAlerta.length} productos con stock bajo o agotado`;
    avisoAlertas.hidden = false;
  } catch (error) {
    // El aviso es un dato de apoyo: si falla, el catálogo sigue funcionando sin él
    avisoAlertas.hidden = true;
  }
}

campoBusqueda.addEventListener("input", () => {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(cargarProductos, 300);
});

filtroCategoria.addEventListener("change", cargarProductos);

async function iniciarPantalla() {
  await cargarProductos();
  await cargarCategoriasEnFiltro();
  await cargarAvisoAlertas();
}

iniciarPantalla();