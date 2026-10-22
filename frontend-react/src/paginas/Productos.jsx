import { useEffect, useState } from "react";
import { obtenerProductos, obtenerCategorias, eliminarProducto } from "../api.js";
import { esAdmin } from "../sesion.js";
import { estadoStock, formatearPrecio, formatearCantidad } from "../utilidades.js";
import EtiquetaStock from "../componentes/EtiquetaStock.jsx";
import FormularioProducto from "../componentes/FormularioProducto.jsx";

function Productos() {
  const puedeEditar = esAdmin();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [categoriaFiltrada, setCategoriaFiltrada] = useState("");
  const [mensajeEstado, setMensajeEstado] = useState("Cargando productos...");
  const [aviso, setAviso] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [contadorFormulario, setContadorFormulario] = useState(0);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch((error) =>
        setAviso({ tipo: "error", texto: "No se pudieron cargar las categorías: " + error.message })
      );
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(textoBusqueda.trim());
    }, 300);

    return () => clearTimeout(temporizador);
  }, [textoBusqueda]);

  useEffect(() => {
    let respuestaVieja = false;
    setMensajeEstado("Cargando productos...");

    obtenerProductos(busquedaAplicada, categoriaFiltrada)
      .then((productosRecibidos) => {
        // Si el usuario cambió el filtro mientras esperaba, esta respuesta ya no sirve
        if (respuestaVieja) return;

        setProductos(productosRecibidos);

        if (productosRecibidos.length > 0) {
          setMensajeEstado("");
          return;
        }

        const hayFiltros = busquedaAplicada !== "" || categoriaFiltrada !== "";
        setMensajeEstado(
          hayFiltros
            ? "No hay productos que coincidan con la búsqueda."
            : "Todavía no hay productos registrados."
        );
      })
      .catch((error) => {
        if (respuestaVieja) return;
        setProductos([]);
        setMensajeEstado(error.message);
      });

    return () => {
      respuestaVieja = true;
    };
  }, [busquedaAplicada, categoriaFiltrada, recarga]);

  function limpiarFormulario() {
    setProductoEditando(null);
    setContadorFormulario((contador) => contador + 1);
  }

  function empezarEdicion(producto) {
    setAviso(null);
    setProductoEditando(producto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function alGuardar(textoExito) {
    limpiarFormulario();
    setAviso({ tipo: "ok", texto: textoExito });
    setRecarga((valor) => valor + 1);
  }

  async function eliminar(producto) {
    const seguro = window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`);
    if (!seguro) return;

    try {
      await eliminarProducto(producto.id);
      if (productoEditando && productoEditando.id === producto.id) {
        limpiarFormulario();
      }
      setAviso({ tipo: "ok", texto: "Producto eliminado correctamente." });
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setAviso({ tipo: "error", texto: "No se pudo eliminar el producto: " + error.message });
    }
  }

  const claveFormulario = `${productoEditando ? productoEditando.id : "nuevo"}-${contadorFormulario}`;

  return (
    <main className="contenido">
      <h1>Productos</h1>

      {puedeEditar && (
        <FormularioProducto
          key={claveFormulario}
          producto={productoEditando}
          categorias={categorias}
          onGuardado={alGuardar}
          onCancelar={limpiarFormulario}
        />
      )}

      {aviso && (
        <p className={aviso.tipo === "ok" ? "mensaje-ok" : "mensaje-error"}>{aviso.texto}</p>
      )}

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o código"
          value={textoBusqueda}
          onChange={(evento) => setTextoBusqueda(evento.target.value)}
        />
        <select
          value={categoriaFiltrada}
          onChange={(evento) => setCategoriaFiltrada(evento.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      <p>{mensajeEstado}</p>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock actual</th>
            <th>Stock mínimo</th>
            <th>Unidad</th>
            <th>Estado</th>
            <th>Imagen</th>
            {puedeEditar && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const estado = estadoStock(producto);

            return (
              <tr key={producto.id} className={estado === "normal" ? "" : `fila-${estado}`}>
                <td>{producto.codigo}</td>
                <td>{producto.nombre}</td>
                <td>{producto.categoria?.nombre || "Sin categoría"}</td>
                <td>{formatearPrecio(producto.precio)}</td>
                <td>{formatearCantidad(producto.stockActual)}</td>
                <td>{formatearCantidad(producto.stockMinimo)}</td>
                <td>{producto.unidadMedida}</td>
                <td>
                  <EtiquetaStock producto={producto} />
                  {estado === "normal" && "-"}
                </td>
                <td>
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                {puedeEditar && (
                  <td>
                    <button
                      type="button"
                      className="boton-secundario"
                      onClick={() => empezarEdicion(producto)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="boton-peligro"
                      onClick={() => eliminar(producto)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

export default Productos;