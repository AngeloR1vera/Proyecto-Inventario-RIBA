import { obtenerMovimientos, obtenerProductos, crearMovimiento } from "./api.js";
import { exigirSesion, obtenerUsuario, cerrarSesion } from "./sesion.js";

exigirSesion();

const textoUsuario = document.getElementById("textoUsuario");
const botonSalir = document.getElementById("botonSalir");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const mensajeEstado = document.getElementById("mensajeEstado");

const formMovimiento = document.getElementById("formMovimiento");
const campoProducto = document.getElementById("productoMovimiento");
const campoTipo = document.getElementById("tipoMovimiento");
const contenedorSentido = document.getElementById("contenedorSentido");
const campoSentido = document.getElementById("sentidoAjuste");
const campoCantidad = document.getElementById("cantidadMovimiento");
const campoNotas = document.getElementById("notasMovimiento");
const botonRegistrar = formMovimiento.querySelector("button");
const mensajeFormulario = document.getElementById("mensajeFormulario");

let productosPorId = {};

const etiquetasTipo = { ENTRADA: "Entrada", SALIDA: "Salida", AJUSTE: "Ajuste" };

const usuarioActual = obtenerUsuario();
if (usuarioActual) {
  textoUsuario.textContent = usuarioActual.nombre;
}
botonSalir.addEventListener("click", cerrarSesion);

campoTipo.addEventListener("change", () => {
  contenedorSentido.hidden = campoTipo.value !== "AJUSTE";
});

function formatearCantidad(valor) {
  return Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 3 });
}

function obtenerNombreProducto(movimiento) {
  if (movimiento.producto) {
    return `${movimiento.producto.codigo} - ${movimiento.producto.nombre}`;
  }
  const productoEncontrado = productosPorId[movimiento.productoId];
  if (productoEncontrado) {
    return `${productoEncontrado.codigo} - ${productoEncontrado.nombre}`;
  }
  return `Producto #${movimiento.productoId}`;
}

function obtenerTextoTipo(movimiento) {
  if (movimiento.tipo === "AJUSTE") {
    if (movimiento.sentidoAjuste === "INCREMENTO") return "Ajuste (aumenta)";
    if (movimiento.sentidoAjuste === "DECREMENTO") return "Ajuste (disminuye)";
  }
  return etiquetasTipo[movimiento.tipo] || movimiento.tipo;
}

function dibujarMovimientos(movimientosRecibidos) {
  cuerpoTabla.innerHTML = "";

  const movimientosRecientes = [...movimientosRecibidos].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  for (const movimiento of movimientosRecientes) {
    const fila = document.createElement("tr");

    const celdaFecha = document.createElement("td");
    celdaFecha.textContent = new Date(movimiento.fecha).toLocaleString("es-CO");

    const celdaProducto = document.createElement("td");
    celdaProducto.textContent = obtenerNombreProducto(movimiento);

    const celdaTipo = document.createElement("td");
    celdaTipo.textContent = obtenerTextoTipo(movimiento);
    celdaTipo.className = "tipo-" + String(movimiento.tipo).toLowerCase();

    const celdaCantidad = document.createElement("td");
    celdaCantidad.textContent = formatearCantidad(movimiento.cantidad);

    const celdaNotas = document.createElement("td");
    celdaNotas.textContent = movimiento.notas || "-";

    const celdaUsuario = document.createElement("td");
    celdaUsuario.textContent = movimiento.usuario?.nombre || "-";

    fila.append(celdaFecha, celdaProducto, celdaTipo, celdaCantidad, celdaNotas, celdaUsuario);
    cuerpoTabla.appendChild(fila);
  }
}

async function cargarMovimientos() {
  mensajeEstado.textContent = "Cargando movimientos...";

  try {
    const movimientosRecibidos = await obtenerMovimientos();

    if (movimientosRecibidos.length === 0) {
      cuerpoTabla.innerHTML = "";
      mensajeEstado.textContent = "Todavía no hay movimientos registrados.";
      return;
    }

    mensajeEstado.textContent = "";
    dibujarMovimientos(movimientosRecibidos);
  } catch (error) {
    mensajeEstado.textContent = error.message;
  }
}

async function cargarProductos() {
  try {
    const productosRecibidos = await obtenerProductos();

    productosPorId = {};
    campoProducto.innerHTML = '<option value="">Selecciona un producto</option>';

    for (const producto of productosRecibidos) {
      productosPorId[producto.id] = producto;

      const opcion = document.createElement("option");
      opcion.value = producto.id;
      opcion.textContent = `${producto.codigo} - ${producto.nombre} (stock: ${formatearCantidad(producto.stockActual)} ${producto.unidadMedida})`;
      campoProducto.appendChild(opcion);
    }
  } catch (error) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "No se pudieron cargar los productos: " + error.message;
  }
}

formMovimiento.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeFormulario.textContent = "";

  const cantidadMovimiento = Number(campoCantidad.value);
  const esAjuste = campoTipo.value === "AJUSTE";

  if (!(cantidadMovimiento > 0)) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = "La cantidad debe ser un número mayor que cero.";
    return;
  }

  botonRegistrar.disabled = true;
  botonRegistrar.textContent = "Registrando...";

  try {
    await crearMovimiento({
      productoId: Number(campoProducto.value),
      tipo: campoTipo.value,
      cantidad: cantidadMovimiento,
      sentidoAjuste: esAjuste ? campoSentido.value : null,
      notas: campoNotas.value.trim()
    });

    formMovimiento.reset();
    contenedorSentido.hidden = true;
    mensajeFormulario.className = "mensaje-ok";
    mensajeFormulario.textContent = "Movimiento registrado correctamente.";
    await cargarProductos();
    await cargarMovimientos();
  } catch (error) {
    mensajeFormulario.className = "mensaje-error";
    mensajeFormulario.textContent = error.message;
  } finally {
    botonRegistrar.disabled = false;
    botonRegistrar.textContent = "Registrar movimiento";
  }
});

async function iniciarPantalla() {
  await cargarProductos();
  await cargarMovimientos();
}

iniciarPantalla();