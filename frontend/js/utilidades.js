export function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  });
}

export function formatearCantidad(valor) {
  return Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 3 });
}

export function estadoStock(producto) {
  const stockActual = Number(producto.stockActual);
  const stockMinimo = Number(producto.stockMinimo);

  if (stockActual === 0) return "agotado";
  if (stockActual <= stockMinimo) return "bajo";
  return "normal";
}

export function crearEtiquetaStock(producto) {
  const estado = estadoStock(producto);
  if (estado === "normal") return null;

  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta-stock etiqueta-" + estado;
  etiqueta.textContent = estado === "agotado" ? "Agotado" : "Stock bajo";
  return etiqueta;
}