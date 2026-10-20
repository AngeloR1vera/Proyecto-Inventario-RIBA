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