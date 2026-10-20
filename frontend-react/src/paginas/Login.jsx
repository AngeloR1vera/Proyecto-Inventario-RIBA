import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../api.js";
import { guardarSesion, haySesion } from "../sesion.js";

function Login() {
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [entrando, setEntrando] = useState(false);

  if (haySesion()) {
    return <Navigate to="/catalogo" replace />;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensajeError("");
    setEntrando(true);

    try {
      const { token, usuario } = await iniciarSesion(email.trim(), password);
      guardarSesion(token, usuario);
      navegar("/catalogo", { replace: true });
    } catch (error) {
      setMensajeError(error.message);
      setEntrando(false);
    }
  }

  return (
    <main className="contenedor-login">
      <h1>Iniciar sesión</h1>

      <form id="formLogin" onSubmit={manejarEnvio}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          required
        />

        <button type="submit" disabled={entrando}>
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p id="mensajeError">{mensajeError}</p>
    </main>
  );
}

export default Login;