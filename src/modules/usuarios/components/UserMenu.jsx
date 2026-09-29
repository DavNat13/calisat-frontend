import { Link } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import useAuthRole from "../../../auth/useAuthRole";
import { ROLES } from "../../../auth/roles";

/**
 * Desplegable del menú de usuario (extraído de UserNavbar.jsx).
 *
 * NO controla su propia apertura: el estado vive en useMenuDesplegable y el
 * disparador sigue en UserNavbar. Aquí solo se compone el contenido y las
 * visibilidades por rol, idénticas a las originales.
 *
 * @param {{ onCerrar: () => void, onCerrarSesion: () => void }} props
 * - onCerrar: cierra el menú y mueve el foco a #contenido (los enlaces se
 *   desmontan al navegar; sin esto el foco caería en <body>).
 * - onCerrarSesion: dispara el logout del proveedor activo.
 */
export default function UserMenu({ onCerrar, onCerrarSesion }) {
  const { hasAnyRole, roles } = useAuthRole();

  const esCliente = hasAnyRole(ROLES.CLIENTE);
  const esAdministrador = hasAnyRole(ROLES.ADMINISTRADOR);
  const esLogistica = hasAnyRole(ROLES.LOGISTICA);
  // Acceso al panel: mismos roles que las rutas /admin.
  const puedePanel = hasAnyRole([ROLES.ADMINISTRADOR, ROLES.LOGISTICA]);
  const rolVisible = roles[0] ?? "SIN ROL";

  return (
    <div className="usuario__desplegable anim-slide-down sombra-panel redondeado-control">
      <p className="usuario__rol">Rol: {rolVisible}</p>
      {puedePanel && (
        <>
          <Link to="/admin" className="usuario__opcion" onClick={onCerrar}>
            <LayoutDashboard className="icono icono--sm" aria-hidden="true" />
            Panel de administración
          </Link>
          {/* <hr> semántico: sin clase .usuario__opcion, las flechas lo saltan. */}
          <hr className="usuario__separador" />
        </>
      )}
      {esCliente && (
        <Link to="/perfil" className="usuario__opcion" onClick={onCerrar}>
          Mi Perfil
        </Link>
      )}
      {esAdministrador && (
        <Link to="/admin/productos" className="usuario__opcion" onClick={onCerrar}>
          Crear Productos
        </Link>
      )}
      {esLogistica && (
        <Link to="/productos" className="usuario__opcion" onClick={onCerrar}>
          Catálogo
        </Link>
      )}
      <button
        type="button"
        className="usuario__opcion usuario__opcion--salir"
        onClick={onCerrarSesion}
      >
        <LogOut className="icono icono--sm" aria-hidden="true" />
        Cerrar Sesión
      </button>
    </div>
  );
}
