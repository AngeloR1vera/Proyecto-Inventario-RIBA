import { useEffect, useState } from "react";
import { obtenerUsuarios, desactivarUsuario, reactivarUsuario } from "../api.js";
import FormularioUsuario from "../componentes/FormularioUsuario.jsx";

const etiquetasRol = { admin: "Administrador", operador: "Operador" };

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensajeEstado, setMensajeEstado] = useState("Cargando usuarios...");
  const [aviso, setAviso] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [contadorFormulario, setContadorFormulario] = useState(0);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let respuestaVieja = false;
    setMensajeEstado("Cargando usuarios...");

    obtenerUsuarios()
      .then((usuariosRecibidos) => {
        if (respuestaVieja) return;

        if (!Array.isArray(usuariosRecibidos)) {
          throw new Error("El servidor devolvió los usuarios en un formato inesperado.");
        }

        setUsuarios(usuariosRecibidos);
        setMensajeEstado(
          usuariosRecibidos.length > 0 ? "" : "Todavía no hay usuarios registrados."
        );
      })
      .catch((error) => {
        if (respuestaVieja) return;
        setUsuarios([]);
        setMensajeEstado(error.message);
      });

    return () => {
      respuestaVieja = true;
    };
  }, [recarga]);

  function limpiarFormulario() {
    setUsuarioEditando(null);
    setContadorFormulario((contador) => contador + 1);
  }

  function empezarEdicion(usuario) {
    setAviso(null);
    setUsuarioEditando(usuario);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function alGuardar(textoExito) {
    limpiarFormulario();
    setAviso({ tipo: "ok", texto: textoExito });
    setRecarga((valor) => valor + 1);
  }

  async function desactivar(usuario) {
    const seguro = window.confirm(
      `¿Desactivar a ${usuario.nombre}? No podrá iniciar sesión hasta que lo reactives.`
    );
    if (!seguro) return;

    try {
      await desactivarUsuario(usuario.id);
      if (usuarioEditando && usuarioEditando.id === usuario.id) {
        limpiarFormulario();
      }
      setAviso({ tipo: "ok", texto: "Usuario desactivado correctamente." });
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setAviso({ tipo: "error", texto: "No se pudo desactivar al usuario: " + error.message });
    }
  }

  async function reactivar(usuario) {
    try {
      await reactivarUsuario(usuario.id);
      setAviso({ tipo: "ok", texto: "Usuario reactivado correctamente." });
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setAviso({ tipo: "error", texto: "No se pudo reactivar al usuario: " + error.message });
    }
  }

  const claveFormulario = `${usuarioEditando ? usuarioEditando.id : "nuevo"}-${contadorFormulario}`;

  return (
    <main className="contenido">
      <h1>Usuarios</h1>

      <FormularioUsuario
        key={claveFormulario}
        usuario={usuarioEditando}
        onGuardado={alGuardar}
        onCancelar={limpiarFormulario}
      />

      {aviso && (
        <p className={aviso.tipo === "ok" ? "mensaje-ok" : "mensaje-error"}>{aviso.texto}</p>
      )}

      <p>{mensajeEstado}</p>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className={usuario.activo ? "" : "fila-inactiva"}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{etiquetasRol[usuario.rol] || usuario.rol}</td>
              <td>
                <span className={usuario.activo ? "estado-activo" : "estado-inactivo"}>
                  {usuario.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => empezarEdicion(usuario)}
                >
                  Editar
                </button>
                {usuario.activo ? (
                  <button
                    type="button"
                    className="boton-peligro"
                    onClick={() => desactivar(usuario)}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="boton-reactivar"
                    onClick={() => reactivar(usuario)}
                  >
                    Reactivar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default Usuarios;