import { useState } from "react";
import { Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useIsAuthenticated } from "@azure/msal-react";
import useUserSync from "../../hooks/useUserSync";
import useAuthRole from "../../auth/useAuthRole";
import { ROLES } from "../../auth/roles";
import "./UserNavbar.css";

export default function UserNavbar() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { hasAnyRole, roles } = useAuthRole();
  const [showMenu, setShowMenu] = useState(false);
  useUserSync();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["User.Read"]
    }).catch(e => console.error("Error en login:", e));
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => console.error("Error en logout:", e));
  };

  if (isAuthenticated && accounts.length > 0) {
    const esCliente = hasAnyRole(ROLES.CLIENTE);
    const esAdministrador = hasAnyRole(ROLES.ADMINISTRADOR);
    const esLogistica = hasAnyRole(ROLES.LOGISTICA);
    const rolVisible = roles[0] ?? "SIN ROL";

    return (
      <div className="user-navbar">
        <button
          className="user-icon-btn"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Menú de usuario"
        >
          <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="user-name">{accounts[0].name}</span>
        </button>
        {showMenu && (
          <div className="user-dropdown">
            <div className="dropdown-item dropdown-rol" aria-disabled="true">
              Rol: {rolVisible}
            </div>
            {esCliente && (
              <Link to="/perfil" className="dropdown-item" onClick={() => setShowMenu(false)}>Mi Perfil</Link>
            )}
            {esAdministrador && (
              <Link to="/productos" className="dropdown-item" onClick={() => setShowMenu(false)}>Crear Productos</Link>
            )}
            {esLogistica && (
              <Link to="/productos" className="dropdown-item" onClick={() => setShowMenu(false)}>Catálogo</Link>
            )}
            <button className="dropdown-item logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button className="login-btn" onClick={handleLogin}>
      <svg className="login-icon" viewBox="0 0 23 23" fill="currentColor">
        <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
      </svg>
      Iniciar Sesión
    </button>
  );
}
