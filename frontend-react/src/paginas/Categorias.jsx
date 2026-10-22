import { useEffect, useState } from "react";
import { obtenerCategorias, eliminarCategoria } from "../api.js";
import { esAdmin } from "../sesion.js";
import FormularioCategoria from "../componentes/FormularioCategoria.jsx";

function Categorias() {
  const puedeEditar = esAdmin();

  const [categorias, setCategorias] = useState([]);
  const [mensajeEstado, setMensajeEstado] = useState("Cargando categorías...");
  const [aviso, setAviso] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [contadorFormulario, setContadorFormulario] = useState(0);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let respuestaVieja = false;
    setMensajeEstado("Cargando categorías...");

    obtenerCategorias()
      .then((categoriasRecibidas) => {
        if (respuestaVieja) return;

        setCategorias(categoriasRecibidas);
        setMensajeEstado(
          categoriasRecibidas.length > 0 ? "" : "Todavía no hay categorías registradas."
        );
      })
      .catch((error) => {
        if (respuestaVieja) return;
        setCategorias([]);
        setMensajeEstado(error.message);
      });

    return () => {
      respuestaVieja = true;
    };
  }, [recarga]);

  function limpiarFormulario() {
    setCategoriaEditando(null);
    setContadorFormulario((contador) => contador + 1);
  }

  function empezarEdicion(categoria) {
    setAviso(null);
    setCategoriaEditando(categoria);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function alGuardar(textoExito) {
    limpiarFormulario();
    setAviso({ tipo: "ok", texto: textoExito });
    setRecarga((valor) => valor + 1);
  }

  async function eliminar(categoria) {
    const seguro = window.confirm(
      `¿Eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!seguro) return;

    try {
      await eliminarCategoria(categoria.id);
      if (categoriaEditando && categoriaEditando.id === categoria.id) {
        limpiarFormulario();
      }
      setAviso({ tipo: "ok", texto: "Categoría eliminada correctamente." });
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setAviso({ tipo: "error", texto: "No se pudo eliminar la categoría: " + error.message });
    }
  }

  const claveFormulario = `${categoriaEditando ? categoriaEditando.id : "nueva"}-${contadorFormulario}`;

  return (
    <main className="contenido">
      <h1>Categorías</h1>

      {puedeEditar && (
        <FormularioCategoria
          key={claveFormulario}
          categoria={categoriaEditando}
          onGuardado={alGuardar}
          onCancelar={limpiarFormulario}
        />
      )}

      {aviso && (
        <p className={aviso.tipo === "ok" ? "mensaje-ok" : "mensaje-error"}>{aviso.texto}</p>
      )}

      <p>{mensajeEstado}</p>

      <table>
        <thead>
          <tr>
            <th>Prefijo</th>
            <th>Nombre</th>
            {puedeEditar && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>{categoria.prefijo}</td>
              <td>{categoria.nombre}</td>
              {puedeEditar && (
                <td>
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => empezarEdicion(categoria)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton-peligro"
                    onClick={() => eliminar(categoria)}
                  >
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default Categorias;