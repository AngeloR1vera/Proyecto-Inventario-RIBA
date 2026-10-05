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

function formatearCantidad(valor) {
  return Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 3 });
}

function dibujarMovimientos(movimientosRecibidos) {
  cuerpoTabla.innerHTML = "";

  const movimientosRecientes = [...movimientosRecibidos].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  for (const movimiento of movimientosRecientes) {
    const producto = productosPorId[movimiento.productoId];
    const nombreProducto = producto
      ? `${producto.codigo} - ${producto.nombre}`
      : `Producto #${movimiento.productoId}`;

    const fila = document.createElement("tr");

    const celdaFecha = document.createElement("td");
    celdaFecha.textContent = new Date(movimiento.fecha).toLocaleString("es-CO");

    const celdaProducto = document.createElement("td");
    celdaProducto.textContent = nombreProducto;

    const celdaTipo = document.createElement("td");
    celdaTipo.textContent = etiquetasTipo[movimiento.tipo] || movimiento.tipo;
    celdaTipo.className = "tipo-" + String(movimiento.tipo).toLowerCase();

    const celdaCantidad = document.createElement("td");
    celdaCantidad.textContent = formatearCantidad(movimiento.cantidad);

    const celdaNotas = document.createElement("td");
    celdaNotas.textContent = movimiento.notas || "-";

    fila.append(celdaFecha, celdaProducto, celdaTipo, celdaCantidad, celdaNotas);
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
      notas: campoNotas.value.trim()
    });

    formMovimiento.reset();
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