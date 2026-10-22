import { useState } from "react";
import { crearCategoria, actualizarCategoria } from "../api.js";

function FormularioCategoria({ categoria, onGuardado, onCancelar }) {
  const [nombre, setNombre] = useState(categoria ? categoria.nombre : "");
  const [prefijo, setPrefijo] = useState(categoria ? categoria.prefijo : "");
  const [mensajeError, setMensajeError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError("");

    const nombreLimpio = nombre.trim();
    const prefijoLimpio = prefijo.trim().toUpperCase();

    if (nombreLimpio === "") {
      setMensajeError("El nombre no puede estar vacío.");
      return;
    }
    if (!categoria && !/^[A-Z]+$/.test(prefijoLimpio)) {
      setMensajeError("El prefijo debe tener solo letras, sin espacios ni números.");
      return;
    }

    setGuardando(true);
    try {
      if (categoria) {
        await actualizarCategoria(categoria.id, { nombre: nombreLimpio });
        onGuardado("Cambios guardados correctamente.");
      } else {
        await crearCategoria({ nombre: nombreLimpio, prefijo: prefijoLimpio });
        onGuardado("Categoría guardada correctamente.");
      }
    } catch (error) {
      setMensajeError(error.message);
      setGuardando(false);
    }
  }

  let textoBoton = "Guardar categoría";
  if (categoria) textoBoton = "Guardar cambios";
  if (guardando) textoBoton = "Guardando...";

  return (
    <form id="formCategoria" onSubmit={manejarEnvio}>
      <h2>{categoria ? "Editar categoría" : "Nueva categoría"}</h2>

      <label htmlFor="nombreCategoria">Nombre</label>
      <input
        type="text"
        id="nombreCategoria"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        required
      />

      <label htmlFor="prefijoCategoria">Prefijo del código (solo letras, ej: ML)</label>
      <input
        type="text"
        id="prefijoCategoria"
        value={prefijo}
        onChange={(evento) => setPrefijo(evento.target.value)}
        disabled={Boolean(categoria)}
        required
      />

      <button type="submit" disabled={guardando}>{textoBoton}</button>
      {categoria && (
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

export default FormularioCategoria;