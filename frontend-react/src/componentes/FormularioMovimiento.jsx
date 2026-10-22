import { useState } from "react";
import { crearMovimiento } from "../api.js";
import { formatearCantidad } from "../utilidades.js";

// La historia HU-08 del documento pide una nota con la causa en cada ajuste.
// Si el equipo decide que sea opcional, se cambia a false.
const notaObligatoriaEnAjustes = true;

function FormularioMovimiento({ productos, onRegistrado }) {
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState("ENTRADA");
  const [sentidoAjuste, setSentidoAjuste] = useState("INCREMENTO");
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [registrando, setRegistrando] = useState(false);

  const esAjuste = tipo === "AJUSTE";
  const notaRequerida = esAjuste && notaObligatoriaEnAjustes;

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError("");

    const cantidadNumero = Number(cantidad);
    const notaLimpia = notas.trim();

    if (!(cantidadNumero > 0)) {
      setMensajeError("La cantidad debe ser un número mayor que cero.");
      return;
    }
    if (notaRequerida && notaLimpia === "") {
      setMensajeError("Un ajuste necesita una nota con la causa.");
      return;
    }

    setRegistrando(true);
    try {
      await crearMovimiento({
        productoId: Number(productoId),
        tipo,
        cantidad: cantidadNumero,
        sentidoAjuste: esAjuste ? sentidoAjuste : null,
        notas: notaLimpia
      });
      onRegistrado("Movimiento registrado correctamente.");
    } catch (error) {
      setMensajeError(error.message);
      setRegistrando(false);
    }
  }

  return (
    <form id="formMovimiento" onSubmit={manejarEnvio}>
      <h2>Nuevo movimiento</h2>

      <label htmlFor="productoMovimiento">Producto</label>
      <select
        id="productoMovimiento"
        value={productoId}
        onChange={(evento) => setProductoId(evento.target.value)}
        required
      >
        <option value="">Selecciona un producto</option>
        {productos.map((producto) => (
          <option key={producto.id} value={producto.id}>
            {`${producto.codigo} - ${producto.nombre} (stock: ${formatearCantidad(producto.stockActual)} ${producto.unidadMedida})`}
          </option>
        ))}
      </select>

      <label htmlFor="tipoMovimiento">Tipo</label>
      <select
        id="tipoMovimiento"
        value={tipo}
        onChange={(evento) => setTipo(evento.target.value)}
        required
      >
        <option value="ENTRADA">Entrada</option>
        <option value="SALIDA">Salida</option>
        <option value="AJUSTE">Ajuste</option>
      </select>

      {esAjuste && (
        <div>
          <label htmlFor="sentidoAjuste">¿El ajuste aumenta o disminuye el inventario?</label>
          <select
            id="sentidoAjuste"
            value={sentidoAjuste}
            onChange={(evento) => setSentidoAjuste(evento.target.value)}
          >
            <option value="INCREMENTO">Aumenta</option>
            <option value="DECREMENTO">Disminuye</option>
          </select>
        </div>
      )}

      <label htmlFor="cantidadMovimiento">Cantidad</label>
      <input
        type="number"
        id="cantidadMovimiento"
        min="0.001"
        step="any"
        value={cantidad}
        onChange={(evento) => setCantidad(evento.target.value)}
        required
      />

      <label htmlFor="notasMovimiento">
        {notaRequerida ? "Notas (obligatoria en ajustes)" : "Notas (opcional)"}
      </label>
      <input
        type="text"
        id="notasMovimiento"
        value={notas}
        onChange={(evento) => setNotas(evento.target.value)}
        required={notaRequerida}
      />

      <button type="submit" disabled={registrando}>
        {registrando ? "Registrando..." : "Registrar movimiento"}
      </button>

      {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
    </form>
  );
}

export default FormularioMovimiento;