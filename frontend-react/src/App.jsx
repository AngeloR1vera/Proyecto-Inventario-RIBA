import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./paginas/Login.jsx";
import Catalogo from "./paginas/Catalogo.jsx";
import Productos from "./paginas/Productos.jsx";
import Categorias from "./paginas/Categorias.jsx";
import RutaProtegida from "./componentes/RutaProtegida.jsx";
import SoloAdmin from "./componentes/SoloAdmin.jsx";

function PantallaProvisional({ titulo }) {
  return (
    <main className="contenido">
      <h1>{titulo}</h1>
      <p>Pantalla en construcción.</p>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/movimientos" element={<PantallaProvisional titulo="Movimientos" />} />

        <Route element={<SoloAdmin />}>
          <Route path="/usuarios" element={<PantallaProvisional titulo="Usuarios" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;