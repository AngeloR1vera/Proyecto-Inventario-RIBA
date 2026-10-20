import { Navigate, Outlet } from "react-router-dom";
import { haySesion } from "../sesion.js";
import BarraSuperior from "./BarraSuperior.jsx";

function RutaProtegida() {
  if (!haySesion()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <BarraSuperior />
      <Outlet />
    </>
  );
}

export default RutaProtegida;