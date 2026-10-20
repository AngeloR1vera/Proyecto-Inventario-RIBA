import { Navigate, Outlet } from "react-router-dom";
import { esAdmin } from "../sesion.js";

function SoloAdmin() {
  if (!esAdmin()) {
    return <Navigate to="/catalogo" replace />;
  }

  return <Outlet />;
}

export default SoloAdmin;