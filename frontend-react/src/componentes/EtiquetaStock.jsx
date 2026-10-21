import { estadoStock } from "../utilidades.js";

function EtiquetaStock({ producto }) {
  const estado = estadoStock(producto);

  if (estado === "normal") {
    return null;
  }

  return (
    <span className={`etiqueta-stock etiqueta-${estado}`}>
      {estado === "agotado" ? "Agotado" : "Stock bajo"}
    </span>
  );
}

export default EtiquetaStock;