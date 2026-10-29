import { useState } from "react";
import { crearUsuario, actualizarUsuario } from "../api.js";

function FormularioUsuario({ usuario, onGuardado, onCancelar }) {
  const [nombre, setNombre] = useState(usuario ? usuario.nombre : "");
  const [email, setEmail] = useState(usuario ? usuario.email : "");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState(usuario ? usuario.rol : "operador");
  const [mensajeError, setMensajeError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError("");

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();

    if (nombreLimpio === "") {
      setMensajeError("El nombre no puede estar vacío.");
      return;
    }

    const datosUsuario = { nombre: nombreLimpio, email: emailLimpio, rol };
    if (password !== "") {
      datosUsuario.password = password;
    }

    setGuardando(true);
    try {
      if (usuario) {
        await actualizarUsuario(usuario.id, datosUsuario);
        onGuardado("Cambios guardados correctamente.");
      } else {
        await crearUsuario(datosUsuario);
        onGuardado("Usuario guardado correctamente.");
      }
    } catch (error) {
      setMensajeError(error.message);
      setGuardando(false);
    }
  }

  let textoBoton = "Guardar usuario";
  if (usuario) textoBoton = "Guardar cambios";
  if (guardando) textoBoton = "Guardando...";

  return (
    <form id="formUsuario" onSubmit={manejarEnvio}>
      <h2>{usuario ? "Editar usuario" : "Nuevo usuario"}</h2>

      <label htmlFor="nombreUsuario">Nombre</label>
      <input
        type="text"
        id="nombreUsuario"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        required
      />

      <label htmlFor="emailUsuario">Correo electrónico</label>
      <input
        type="email"
        id="emailUsuario"
        autoComplete="off"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        required
      />

      <label htmlFor="passwordUsuario">Contraseña</label>
      <input
        type="password"
        id="passwordUsuario"
        autoComplete="new-password"
        value={password}
        onChange={(evento) => setPassword(evento.target.value)}
        required={!usuario}
      />
      {usuario && (
        <small className="texto-ayuda">
          Déjala vacía para mantener la contraseña actual
        </small>
      )}

      <label htmlFor="rolUsuario">Rol</label>
      <select
        id="rolUsuario"
        value={rol}
        onChange={(evento) => setRol(evento.target.value)}
        required
      >
        <option value="operador">Operador</option>
        <option value="admin">Administrador</option>
      </select>

      <button type="submit" disabled={guardando}>{textoBoton}</button>
      {usuario && (
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

export default FormularioUsuario;