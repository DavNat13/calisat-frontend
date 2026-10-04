import { Link } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import useAuthSession from "../../../auth/useAuthSession";
import useUserSync from "../hooks/useUserSync";
import useMenuDesplegable from "../hooks/useMenuDesplegable";
import UserMenu from "./UserMenu";
import "./UserNavbar.css";

/**
 * Acciones de sesión en la navbar pública.
 *
 * - Sin sesión → enlace a /login (YA NO dispara instance.loginRedirect: el
 *   flujo dual Entra ID / Cognito se elige en la página de acceso).
 * - Con sesión (de AZURE o de COGNITO) → disparador del desplegable; el
 *   contenido vive en UserMenu (visibilidades por rol vía useAuthRole) y el
 *   comportamiento accesible (Escape, clic fuera, popstate, flechas, foco)
 *   en useMenuDesplegable.
 * El cierre de sesión lo resuelve `useAuthSession().logout()`: MSAL para la
 * cuenta institucional, `removeUser()` + Hosted UI para Cognito.
 */
export default function UserNavbar() {
  const { isAuthenticated, user, logout } = useAuthSession();
  useUserSync();
  // Desestructurado: la regla react-hooks/refs exige que el ref llegue al JSX
  // como identificador directo (ref={contenedorRef}), no como propiedad de un
  // objeto devuelto por el hook (ref={menu.contenedorRef}).
  const {
    abierto,
    alternar,
    cerrarYContenido,
    contenedorRef,
    botonRef,
    manejarTeclas,
  } = useMenuDesplegable();

  const handleLogout = () => {
    logout().catch((e) => console.error("Error en logout:", e));
  };

  if (isAuthenticated) {
    // `user` viene normalizado de useAuthSession (name/email siempre string);
    // la cadena de respaldo cierra el botón con "Mi cuenta" para que nunca
    // se pinte undefined ni un label vacío.
    const nombreVisible = user?.name || user?.email || "Mi cuenta";

    return (
      <div
        className="usuario"
        ref={contenedorRef}
        onKeyDown={manejarTeclas}
      >
        <button
          type="button"
          ref={botonRef}
          className="usuario__boton"
          onClick={alternar}
          aria-label="Menú de usuario"
          aria-haspopup="true"
          aria-expanded={abierto}
        >
          <User className="icono" aria-hidden="true" />
          <span className="usuario__nombre">{nombreVisible}</span>
        </button>
        {abierto && (
          <UserMenu onCerrar={cerrarYContenido} onCerrarSesion={handleLogout} />
        )}
      </div>
    );
  }

  // Navegación = enlace (<a>), no <button>: es un cambio de destino, así que
  // habilita abrir en otra pestaña (clic medio / Ctrl+mayús+C), mostrar la
  // URL al pasar el cursor y que el lector de pantalla anuncie "enlace".
  // El aspecto es idéntico al del botón anterior: mismas clases primitivas
  // .boton .boton--primario .boton--sm que emite <Button variant size>.
  return (
    <Link to="/login" className="boton boton--primario boton--sm">
      <span className="boton__icono" aria-hidden="true">
        <LogIn className="icono" />
      </span>
      Iniciar Sesión
    </Link>
  );
}
