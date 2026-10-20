import { NavLink } from "react-router-dom";
import { cerrarSesion, esAdmin, obtenerUsuario } from "../sesion.js";

const enlacesMenu = [
  { texto: "Catálogo", destino: "/catalogo" },
  { texto: "Productos", destino: "/productos" },
  { texto: "Categorías", destino: "/categorias" },
  { texto: "Movimientos", destino: "/movimientos" }
];

function BarraSuperior() {
  const usuarioActual = obtenerUsuario();
  const enlacesVisibles = esAdmin()
    ? [...enlacesMenu, { texto: "Usuarios", destino: "/usuarios" }]
    : enlacesMenu;

  return (
    <header className="barra-superior">
      <nav>
        {enlacesVisibles.map((enlace) => (
          <NavLink
            key={enlace.destino}
            to={enlace.destino}
            className={({ isActive }) => (isActive ? "enlace-activo" : "")}
          >
            {enlace.texto}
          </NavLink>
        ))}
      </nav>

      <div className="datos-sesion">
        {usuarioActual && (
          <span>
            {usuarioActual.nombre} ({usuarioActual.rol})
          </span>
        )}
        <button type="button" onClick={cerrarSesion}>Salir</button>
      </div>
    </header>
  );
}

export default BarraSuperior;