import { obtenerToken, cerrarSesion } from "./sesion.js";

const URL_BASE = "http://localhost:4000/api";

// true = datos simulados, false = backend real
const SIMULAR = {
  auth: false,
  productos: false,
  categorias: false,
  movimientos: false
};

async function pedir(ruta, opciones = {}, requiereToken = true) {
  const cabeceras = { "Content-Type": "application/json" };
  if (requiereToken) {
    cabeceras.Authorization = `Bearer ${obtenerToken()}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(URL_BASE + ruta, { ...opciones, headers: cabeceras });
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor. Intenta de nuevo en un momento.");
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && requiereToken) {
      cerrarSesion();
      throw new Error("Tu sesión expiró. Inicia sesión de nuevo.");
    }
    if (respuesta.status === 401 && !requiereToken) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    const cuerpoError = await respuesta.json().catch(() => ({}));
    throw new Error(cuerpoError.mensaje || `Error del servidor (${respuesta.status}).`);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}

/* ---------- Login ---------- */

function simularLogin(email, password) {
  return new Promise((resolver, rechazar) => {
    setTimeout(() => {
      if (email === "admin@riba.com" && password === "1234") {
        resolver({
          token: "token-de-prueba",
          usuario: { id: 1, nombre: "Admin de prueba", rol: "admin" }
        });
      } else {
        rechazar(new Error("Correo o contraseña incorrectos."));
      }
    }, 500);
  });
}

export function iniciarSesion(email, password) {
  if (SIMULAR.auth) {
    return simularLogin(email, password);
  }
  return pedir(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
}

/* ---------- Datos de prueba ---------- */

const categoriasDePrueba = [
  { id: 1, nombre: "Manillas de Oro Laminado 18k", prefijo: "ML", ultimoNumero: 2 },
  { id: 2, nombre: "Manillas de Temporada", prefijo: "MT", ultimoNumero: 1 }
];

const productosDePrueba = [
  { id: 1, codigo: "ML-001", nombre: "Manilla San Miguel de Oro Laminado 18k", categoriaId: 1, stockActual: 12, stockMinimo: 3, unidadMedida: "unidad", imagenUrl: null, activo: true },
  { id: 2, codigo: "MT-001", nombre: "Manilla de Temporada Navideña", categoriaId: 2, stockActual: 10, stockMinimo: 2, unidadMedida: "unidad", imagenUrl: null, activo: true },
  { id: 3, codigo: "ML-002", nombre: "Manilla Tres Carriles de Oro Laminado 18k", categoriaId: 1, stockActual: 5, stockMinimo: 1, unidadMedida: "unidad", imagenUrl: null, activo: true }
];

const movimientosDePrueba = [
  { id: 1, productoId: 1, tipo: "ENTRADA", cantidad: 15, usuarioId: 1, fecha: "2026-09-25T10:30:00", sentidoAjuste: null, notas: "Compra inicial" },
  { id: 2, productoId: 1, tipo: "SALIDA", cantidad: 3, usuarioId: 1, fecha: "2026-09-26T15:10:00", sentidoAjuste: null, notas: "" }
];

/* ---------- Categorías ---------- */

function existeCategoriaConNombre(nombre, idIgnorado = null) {
  return categoriasDePrueba.some(
    (categoria) =>
      categoria.id !== idIgnorado &&
      categoria.nombre.toLowerCase() === nombre.toLowerCase()
  );
}

function existeCategoriaConPrefijo(prefijo) {
  return categoriasDePrueba.some(
    (categoria) => categoria.prefijo.toLowerCase() === prefijo.toLowerCase()
  );
}

export function obtenerCategorias() {
  if (SIMULAR.categorias) {
    return new Promise((resolver) => {
      setTimeout(() => resolver(categoriasDePrueba), 300);
    });
  }
  return pedir("/categorias");
}

export function crearCategoria(datosCategoria) {
  if (SIMULAR.categorias) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        if (existeCategoriaConNombre(datosCategoria.nombre)) {
          rechazar(new Error("Ya existe una categoría con ese nombre."));
          return;
        }
        if (existeCategoriaConPrefijo(datosCategoria.prefijo)) {
          rechazar(new Error("Ya existe una categoría con ese prefijo."));
          return;
        }
        const categoriaNueva = { id: Date.now(), ultimoNumero: 0, ...datosCategoria };
        categoriasDePrueba.push(categoriaNueva);
        resolver(categoriaNueva);
      }, 400);
    });
  }
  return pedir("/categorias", { method: "POST", body: JSON.stringify(datosCategoria) });
}

export function actualizarCategoria(idCategoria, datosCategoria) {
  if (SIMULAR.categorias) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        const posicion = categoriasDePrueba.findIndex((categoria) => categoria.id === idCategoria);
        if (posicion === -1) {
          rechazar(new Error("La categoría ya no existe."));
          return;
        }
        if (existeCategoriaConNombre(datosCategoria.nombre, idCategoria)) {
          rechazar(new Error("Ya existe una categoría con ese nombre."));
          return;
        }
        categoriasDePrueba[posicion] = { ...categoriasDePrueba[posicion], ...datosCategoria };
        resolver(categoriasDePrueba[posicion]);
      }, 400);
    });
  }
  return pedir(`/categorias/${idCategoria}`, { method: "PUT", body: JSON.stringify(datosCategoria) });
}

export function eliminarCategoria(idCategoria) {
  if (SIMULAR.categorias) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        const posicion = categoriasDePrueba.findIndex((categoria) => categoria.id === idCategoria);
        if (posicion === -1) {
          rechazar(new Error("La categoría ya no existe."));
          return;
        }
        const tieneProductos = productosDePrueba.some((producto) => producto.categoriaId === idCategoria);
        if (tieneProductos) {
          rechazar(new Error("No se puede eliminar: hay productos en esta categoría."));
          return;
        }
        categoriasDePrueba.splice(posicion, 1);
        resolver(null);
      }, 400);
    });
  }
  return pedir(`/categorias/${idCategoria}`, { method: "DELETE" });
}

/* ---------- Productos ---------- */

export function obtenerProductos() {
  if (SIMULAR.productos) {
    return new Promise((resolver) => {
      setTimeout(() => resolver(productosDePrueba), 400);
    });
  }
  return pedir("/productos");
}

export function crearProducto(datosProducto) {
  if (SIMULAR.productos) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        const categoria = categoriasDePrueba.find((item) => item.id === datosProducto.categoriaId);
        if (!categoria) {
          rechazar(new Error("La categoría seleccionada ya no existe."));
          return;
        }

        // El backend arma el código con el prefijo de la categoría y un consecutivo
        categoria.ultimoNumero += 1;
        const codigoNuevo = `${categoria.prefijo}-${String(categoria.ultimoNumero).padStart(3, "0")}`;

        const productoNuevo = {
          id: Date.now(),
          codigo: codigoNuevo,
          stockActual: 0,
          activo: true,
          ...datosProducto
        };
        productosDePrueba.push(productoNuevo);
        resolver(productoNuevo);
      }, 400);
    });
  }
  return pedir("/productos", { method: "POST", body: JSON.stringify(datosProducto) });
}

export function actualizarProducto(idProducto, datosProducto) {
  if (SIMULAR.productos) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        const posicion = productosDePrueba.findIndex((producto) => producto.id === idProducto);
        if (posicion === -1) {
          rechazar(new Error("El producto ya no existe."));
          return;
        }
        productosDePrueba[posicion] = { ...productosDePrueba[posicion], ...datosProducto };
        resolver(productosDePrueba[posicion]);
      }, 400);
    });
  }
  return pedir(`/productos/${idProducto}`, { method: "PUT", body: JSON.stringify(datosProducto) });
}

export function eliminarProducto(idProducto) {
  if (SIMULAR.productos) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        const posicion = productosDePrueba.findIndex((producto) => producto.id === idProducto);
        if (posicion === -1) {
          rechazar(new Error("El producto ya no existe."));
          return;
        }
        const tieneMovimientos = movimientosDePrueba.some((movimiento) => movimiento.productoId === idProducto);
        if (tieneMovimientos) {
          rechazar(new Error("No se puede eliminar: el producto ya tiene movimientos registrados."));
          return;
        }
        productosDePrueba.splice(posicion, 1);
        resolver(null);
      }, 400);
    });
  }
  return pedir(`/productos/${idProducto}`, { method: "DELETE" });
}

/* ---------- Movimientos ---------- */

export function obtenerMovimientos() {
  if (SIMULAR.movimientos) {
    return new Promise((resolver) => {
      setTimeout(() => resolver(movimientosDePrueba), 400);
    });
  }
  return pedir("/movimientos");
}

export function crearMovimiento(datosMovimiento) {
  if (SIMULAR.movimientos) {
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        const producto = productosDePrueba.find((item) => item.id === datosMovimiento.productoId);
        if (!producto) {
          rechazar(new Error("El producto ya no existe."));
          return;
        }
        if (!(datosMovimiento.cantidad > 0)) {
          rechazar(new Error("La cantidad debe ser mayor que cero."));
          return;
        }

        let stockNuevo = producto.stockActual;

        if (datosMovimiento.tipo === "ENTRADA") {
          stockNuevo = producto.stockActual + datosMovimiento.cantidad;
        } else if (datosMovimiento.tipo === "SALIDA") {
          if (datosMovimiento.cantidad > producto.stockActual) {
            rechazar(new Error(`Stock insuficiente: solo hay ${producto.stockActual} ${producto.unidadMedida} de "${producto.nombre}".`));
            return;
          }
          stockNuevo = producto.stockActual - datosMovimiento.cantidad;
        } else if (datosMovimiento.tipo === "AJUSTE") {
          if (datosMovimiento.sentidoAjuste === "DECREMENTO" && datosMovimiento.cantidad > producto.stockActual) {
            rechazar(new Error(`El ajuste dejaría el stock en negativo: solo hay ${producto.stockActual} ${producto.unidadMedida}.`));
            return;
          }
          stockNuevo = datosMovimiento.sentidoAjuste === "DECREMENTO"
            ? producto.stockActual - datosMovimiento.cantidad
            : producto.stockActual + datosMovimiento.cantidad;
        }

        producto.stockActual = Math.round(stockNuevo * 1000) / 1000;

        const movimientoNuevo = {
          id: Date.now(),
          usuarioId: 1,
          fecha: new Date().toISOString(),
          ...datosMovimiento
        };
        movimientosDePrueba.push(movimientoNuevo);
        resolver(movimientoNuevo);
      }, 400);
    });
  }
  return pedir("/movimientos", { method: "POST", body: JSON.stringify(datosMovimiento) });
}