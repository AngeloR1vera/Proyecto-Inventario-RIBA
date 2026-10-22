import { useEffect, useState } from "react";
import { obtenerMovimientos, obtenerProductos } from "../api.js";
import { formatearCantidad } from "../utilidades.js";
import FormularioMovimiento from "../componentes/FormularioMovimiento.jsx";

const etiquetasTipo = { ENTRADA: "Entrada", SALIDA: "Salida", AJUSTE: "Ajuste" };

function obtenerTextoTipo(movimiento) {
  if (movimiento.tipo === "AJUSTE") {
    if (movimiento.sentidoAjuste === "INCREMENTO") return "Ajuste (aumenta)";
    if (movimiento.sentidoAjuste === "DECREMENTO") return "Ajuste (disminuye)";
  }
  return etiquetasTipo[movimiento.tipo] || movimiento.tipo;
}

function Movimientos() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [mensajeEstado, setMensajeEstado] = useState("Cargando movimientos...");
  const [aviso, setAviso] = useState(null);
  const [contadorFormulario, setContadorFormulario] = useState(0);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let respuestaVieja = false;

    obtenerProductos()
      .then((productosRecibidos) => {
        if (!respuestaVieja) setProductos(productosRecibidos);
      })
      .catch((error) => {
        if (respuestaVieja) return;
        setAviso({ tipo: "error", texto: "No se pudieron cargar los productos: " + error.message });
      });

    return () => {
      respuestaVieja = true;
    };
  }, [recarga]);

  useEffect(() => {
    let respuestaVieja = false;
    setMensajeEstado("Cargando movimientos...");

    obtenerMovimientos()
      .then((movimientosRecibidos) => {
        if (respuestaVieja) return;

        const masRecientesPrimero = [...movimientosRecibidos].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setMovimientos(masRecientesPrimero);
        setMensajeEstado(
          masRecientesPrimero.length > 0 ? "" : "Todavía no hay movimientos registrados."
        );
      })
      .catch((error) => {
        if (respuestaVieja) return;
        setMovimientos([]);
        setMensajeEstado(error.message);
      });

    return () => {
      respuestaVieja = true;
    };
  }, [recarga]);

  function alRegistrar(textoExito) {
    setContadorFormulario((contador) => contador + 1);
    setAviso({ tipo: "ok", texto: textoExito });
    setRecarga((valor) => valor + 1);
  }

  function obtenerNombreProducto(movimiento) {
    if (movimiento.producto) {
      return `${movimiento.producto.codigo} - ${movimiento.producto.nombre}`;
    }
    const productoEncontrado = productos.find((producto) => producto.id === movimiento.productoId);
    if (productoEncontrado) {
      return `${productoEncontrado.codigo} - ${productoEncontrado.nombre}`;
    }
    return `Producto #${movimiento.productoId}`;
  }

  return (
    <main className="contenido">
      <h1>Movimientos</h1>

      <FormularioMovimiento
        key={contadorFormulario}
        productos={productos}
        onRegistrado={alRegistrar}
      />

      {aviso && (
        <p className={aviso.tipo === "ok" ? "mensaje-ok" : "mensaje-error"}>{aviso.texto}</p>
      )}

      <p>{mensajeEstado}</p>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Notas</th>
            <th>Registrado por</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id}>
              <td>{new Date(movimiento.fecha).toLocaleString("es-CO")}</td>
              <td>{obtenerNombreProducto(movimiento)}</td>
              <td className={"tipo-" + String(movimiento.tipo).toLowerCase()}>
                {obtenerTextoTipo(movimiento)}
              </td>
              <td>{formatearCantidad(movimiento.cantidad)}</td>
              <td>{movimiento.notas || "-"}</td>
              <td>{movimiento.usuario?.nombre || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default Movimientos;