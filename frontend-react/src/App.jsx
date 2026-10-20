import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./paginas/Login.jsx";
import { cerrarSesion } from "./sesion.js";

function CatalogoProvisional() {
  return (
    <main className="contenido">
      <h1>Catálogo (en construcción)</h1>
      <button type="button" onClick={cerrarSesion}>Salir</button>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/catalogo" element={<CatalogoProvisional />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;