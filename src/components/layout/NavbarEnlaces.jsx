import { NavLink } from "react-router-dom";

/**
 * Convención de enlaces de la navbar: subrayado amarillo + modificador
 * --activo cuando react-router detecta la ruta actual (misma clase para
 * escritorio y para el menú móvil).
 */
const claseEnlace = ({ isActive }) =>
  isActive ? "navbar__link navbar__link--activo" : "navbar__link";

/**
 * Los tres destinos del shell público.
 *
 * El mismo componente se reutiliza en el menú móvil (NavbarMenuMovil) para
 * que no existan dos copias de la navegación que diverjan: ahí se le pasa
 * `onNavegar` para que cada enlace cierre el menú y lleve el foco al
 * contenido; en escritorio ese prop no hace falta.
 *
 * @param {{ onNavegar?: () => void }} props
 */
export default function NavbarEnlaces({ onNavegar }) {
  return (
    <>
      <NavLink to="/productos" className={claseEnlace} onClick={onNavegar}>
        Catálogo
      </NavLink>
      <NavLink to="/nosotros" className={claseEnlace} onClick={onNavegar}>
        Nosotros
      </NavLink>
      <NavLink to="/contacto" className={claseEnlace} onClick={onNavegar}>
        Contacto
      </NavLink>
    </>
  );
}
