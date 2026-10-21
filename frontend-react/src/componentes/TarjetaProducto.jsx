import { useState } from "react";
import EtiquetaStock from "./EtiquetaStock.jsx";
import { estadoStock, formatearPrecio, formatearCantidad } from "../utilidades.js";

function TarjetaProducto({ producto }) {
  const [imagenFallo, setImagenFallo] = useState(false);

  const estado = estadoStock(producto);
  const claseTarjeta =
    estado === "normal" ? "tarjeta-producto" : `tarjeta-producto tarjeta-${estado}`;
  const mostrarImagen = producto.imagenUrl && !imagenFallo;

  return (
    <article className={claseTarjeta}>
      <div className="tarjeta-imagen">
        {mostrarImagen ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            onError={() => setImagenFallo(true)}
          />
        ) : (
          "Sin imagen"
        )}
      </div>

      <div className="tarjeta-cuerpo">
        <p className="tarjeta-codigo">{producto.codigo}</p>
        <h3>{producto.nombre}</h3>
        <p className="tarjeta-categoria">{producto.categoria?.nombre || "Sin categoría"}</p>
        <p className="tarjeta-precio">{formatearPrecio(producto.precio)}</p>
        <p className="tarjeta-stock">
          Stock: {formatearCantidad(producto.stockActual)} {producto.unidadMedida}
        </p>
        <EtiquetaStock producto={producto} />
      </div>
    </article>
  );
}

export default TarjetaProducto;