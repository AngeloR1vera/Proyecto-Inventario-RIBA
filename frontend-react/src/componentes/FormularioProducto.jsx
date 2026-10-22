import { useState } from "react";
import { crearProducto, actualizarProducto } from "../api.js";

const unidadesDisponibles = [
  { valor: "unidad", texto: "Unidad" },
  { valor: "metros", texto: "Metros" },
  { valor: "centimetros", texto: "Centímetros" },
  { valor: "gramos", texto: "Gramos" }
];

function FormularioProducto({ producto, categorias, onGuardado, onCancelar }) {
  const [nombre, setNombre] = useState(producto ? producto.nombre : "");
  const [categoriaId, setCategoriaId] = useState(producto ? String(producto.categoriaId) : "");
  const [precio, setPrecio] = useState(producto ? String(Number(producto.precio) || 0) : "0");
  const [stockMinimo, setStockMinimo] = useState(
    producto ? String(Number(producto.stockMinimo) || 0) : "0"
  );
  const [unidadMedida, setUnidadMedida] = useState(producto ? producto.unidadMedida : "unidad");
  const [imagenUrl, setImagenUrl] = useState(producto?.imagenUrl || "");
  const [mensajeError, setMensajeError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError("");

    const nombreLimpio = nombre.trim();
    const precioNumero = Number(precio);
    const stockMinimoNumero = Number(stockMinimo);

    if (nombreLimpio === "") {
      setMensajeError("El nombre no puede estar vacío.");
      return;
    }
    if (!(precioNumero >= 0)) {
      setMensajeError("El precio no puede ser negativo.");
      return;
    }
    if (!(stockMinimoNumero >= 0)) {
      setMensajeError("El stock mínimo no puede ser negativo.");
      return;
    }

    const datosProducto = {
      nombre: nombreLimpio,
      categoriaId: Number(categoriaId),
      precio: precioNumero,
      stockMinimo: stockMinimoNumero,
      unidadMedida,
      imagenUrl: imagenUrl.trim() || null
    };

    setGuardando(true);
    try {
      if (producto) {
        await actualizarProducto(producto.id, datosProducto);
        onGuardado("Cambios guardados correctamente.");
      } else {
        await crearProducto(datosProducto);
        onGuardado("Producto guardado correctamente.");
      }
    } catch (error) {
      setMensajeError(error.message);
      setGuardando(false);
    }
  }

  let textoBoton = "Guardar producto";
  if (producto) textoBoton = "Guardar cambios";
  if (guardando) textoBoton = "Guardando...";

  return (
    <form id="formProducto" onSubmit={manejarEnvio}>
      <h2>{producto ? "Editar producto" : "Nuevo producto"}</h2>

      <label htmlFor="nombreProducto">Nombre</label>
      <input
        type="text"
        id="nombreProducto"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        required
      />

      <label htmlFor="categoriaProducto">Categoría</label>
      <select
        id="categoriaProducto"
        value={categoriaId}
        onChange={(evento) => setCategoriaId(evento.target.value)}
        required
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nombre}
          </option>
        ))}
      </select>

      <label htmlFor="precioProducto">Precio</label>
      <input
        type="number"
        id="precioProducto"
        min="0"
        step="0.01"
        value={precio}
        onChange={(evento) => setPrecio(evento.target.value)}
        required
      />

      <label htmlFor="stockMinimoProducto">Stock mínimo</label>
      <input
        type="number"
        id="stockMinimoProducto"
        min="0"
        step="any"
        value={stockMinimo}
        onChange={(evento) => setStockMinimo(evento.target.value)}
        required
      />

      <label htmlFor="unidadProducto">Unidad de medida</label>
      <select
        id="unidadProducto"
        value={unidadMedida}
        onChange={(evento) => setUnidadMedida(evento.target.value)}
        required
      >
        {unidadesDisponibles.map((unidad) => (
          <option key={unidad.valor} value={unidad.valor}>
            {unidad.texto}
          </option>
        ))}
      </select>

      <label htmlFor="imagenProducto">URL de imagen (opcional)</label>
      <input
        type="text"
        id="imagenProducto"
        placeholder="https://..."
        value={imagenUrl}
        onChange={(evento) => setImagenUrl(evento.target.value)}
      />

      <button type="submit" disabled={guardando}>{textoBoton}</button>
      {producto && (
        <button
          type="button"
          id="botonCancelar"
          className="boton-secundario"
          onClick={onCancelar}
        >
          Cancelar edición
        </button>
      )}

      {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
    </form>
  );
}

export default FormularioProducto;