import { NavLink, Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  Bell,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Truck,
} from "lucide-react";
import useAuthRole from "../../../auth/useAuthRole";
import { ROLES } from "../../../auth/roles";
import Badge from "../../../components/ui/Badge";
import enfocarContenido from "../../../utils/enfocarContenido";
import "./AdminSidebar.css";

/** Clases semánticas del item de navegación (NavLink activo incluido). */
const claseItem = ({ isActive }) =>
  isActive ? "panel-item panel-item--activo" : "panel-item";

/**
 * Panel lateral del panel de administración.
 *
 * - isOpen/onClose: control del cajón móvil (≤992px). Cualquier enlace
 *   cierra el panel al navegar.
 * - panelRef: ref del <aside> que AdminLayout usa para el foco y para el
 *   cierre con clic fuera.
 *
 * La visibilidad de cada enlace depende del rol (useAuthRole): Dashboard y
 * Envíos son de gestión (ADMINISTRADOR | LOGISTICA); Productos, Inventario
 * y Notificaciones son exclusivas de ADMINISTRADOR, igual que en las rutas.
 */
export default function AdminSidebar({ isOpen, onClose, panelRef }) {
  const { instance, accounts } = useMsal();
  const { hasAnyRole, roles } = useAuthRole();
  const esAdministrador = hasAnyRole(ROLES.ADMINISTRADOR);
  const esLogistica = hasAnyRole(ROLES.LOGISTICA);
  const verGestion = esAdministrador || esLogistica;

  // Cuenta ACTIVA (misma regla que los servicios: token e identidad siempre
  // de getActiveAccount(); accounts[0] solo como respaldo).
  const cuenta = instance.getActiveAccount() ?? accounts[0];
  const nombre = cuenta?.name || cuenta?.username || "Mi cuenta";
  const rolVisible = roles[0] ?? "SIN ROL";

  // Navegar desde el panel: en móvil el cajón se cierra y el foco pasa al
  // contenido (el enlace oculto lo perdería y caería en <body>); en
  // escritorio el enlace sigue montado, así que el foco se queda donde
  // está y no se roba al usuario.
  const navegarDesdePanel = () => {
    if (!isOpen) return;
    onClose?.();
    enfocarContenido();
  };

  // Mismo logout que UserNavbar (redirect de MSAL); primero se cierra el
  // panel para que el cajón no quede montado durante la redirección.
  const cerrarSesion = () => {
    if (isOpen) onClose?.();
    instance
      .logoutRedirect()
      .catch((error) => console.error("Error en logout:", error));
  };

  return (
    <aside
      id="panel-lateral"
      ref={panelRef}
      className={
        isOpen ? "panel-lateral panel-lateral--abierto" : "panel-lateral"
      }
    >
      <div className="panel-lateral__cabecera">
        <span className="panel-lateral__marca">Calisat</span>
        <p className="panel-lateral__subtitulo">Panel de Control</p>
      </div>

      <nav className="panel-lateral__nav" aria-label="Panel de administración">
        <ul className="panel-lateral__lista">
          {verGestion && (
            <li>
              {/* end: sin él, /admin/productos también marcaría activo /admin */}
              <NavLink to="/admin" end className={claseItem} onClick={navegarDesdePanel}>
                <LayoutDashboard className="icono" aria-hidden="true" />
                Dashboard
              </NavLink>
            </li>
          )}

          {/* --- Bloque exclusivo de ADMINISTRADOR --- */}
          {esAdministrador && (
            <>
              <li>
                <NavLink to="/admin/productos" className={claseItem} onClick={navegarDesdePanel}>
                  <Package className="icono" aria-hidden="true" />
                  Productos
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/inventario" className={claseItem} onClick={navegarDesdePanel}>
                  <Boxes className="icono" aria-hidden="true" />
                  Inventario
                </NavLink>
              </li>
            </>
          )}

          {verGestion && (
            <li>
              <NavLink to="/admin/envios" className={claseItem} onClick={navegarDesdePanel}>
                <Truck className="icono" aria-hidden="true" />
                Envíos
              </NavLink>
            </li>
          )}

          {esAdministrador && (
            <li>
              <NavLink
                to="/admin/notificaciones"
                className={claseItem}
                onClick={navegarDesdePanel}
              >
                <Bell className="icono" aria-hidden="true" />
                Notificaciones
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="panel-lateral__pie">
        <p className="panel-lateral__usuario">
          <span className="panel-lateral__usuario-nombre">{nombre}</span>
          <Badge tone="amarillo">{rolVisible}</Badge>
        </p>
        <div className="panel-lateral__acciones">
          <Link to="/" className="panel-item" onClick={navegarDesdePanel}>
            <Store className="icono" aria-hidden="true" />
            Volver a la Tienda
          </Link>
          <button
            type="button"
            className="panel-item panel-item--salir"
            onClick={cerrarSesion}
          >
            <LogOut className="icono" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
