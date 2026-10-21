import { useEffect, useState } from "react";
import {
  obtenerProductos,
  obtenerCategorias,
  obtenerProductosEnAlerta
} from "../api.js";
import TarjetaProducto from "../componentes/TarjetaProducto.jsx";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [categoriaFiltrada, setCategoriaFiltrada] = useState("");
  const [mensajeEstado, setMensajeEstado] = useState("Cargando catálogo...");
  const [errorFiltro, setErrorFiltro] = useState("");
  const [cantidadEnAlerta, setCantidadEnAlerta] = useState(0);

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch((error) =>
        setErrorFiltro("No se pudo cargar el filtro de categorías: " + error.message)
      );
  }, []);

  useEffect(() => {
    obtenerProductosEnAlerta()
      .then((productosEnAlerta) => setCantidadEnAlerta(productosEnAlerta.length))
      // El aviso es un dato de apoyo: si falla, el catálogo sigue funcionando sin él
      .catch(() => setCantidadEnAlerta(0));
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(textoBusqueda.trim());
    }, 300);

    return () => clearTimeout(temporizador);
  }, [textoBusqueda]);

  useEffect(() => {
    let respuestaVieja = false;
    setMensajeEstado("Cargando catálogo...");

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
            : "Todavía no hay productos en el catálogo."
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
  }, [busquedaAplicada, categoriaFiltrada]);

  return (
    <main className="contenido">
      <h1>Catálogo</h1>
      <p>{mensajeEstado}</p>

      {cantidadEnAlerta > 0 && (
        <div className="aviso-alertas">
          {cantidadEnAlerta === 1
            ? "1 producto con stock bajo o agotado"
            : `${cantidadEnAlerta} productos con stock bajo o agotado`}
        </div>
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

      {errorFiltro && <p className="mensaje-error">{errorFiltro}</p>}

      <div className="cuadricula-catalogo">
        {productos.map((producto) => (
          <TarjetaProducto key={producto.id} producto={producto} />
        ))}
      </div>
    </main>
  );
}

export default Catalogo;