import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserNavbar from "../../modules/usuarios/components/UserNavbar";
import useAuthRole from "../../auth/useAuthRole";
import { ROLES } from "../../auth/roles";
import Button from "../ui/Button";
import enfocarContenido from "../../utils/enfocarContenido";
import "./Navbar.css";

const claseEnlace = ({ isActive }) =>
  isActive ? "navbar__link navbar__link--activo" : "navbar__link";

export default function Navbar() {
  const { hasAnyRole } = useAuthRole();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esCliente = hasAnyRole(ROLES.CLIENTE);
  const botonRef = useRef(null);
  const menuRef = useRef(null);

  // El enlace de marca permanece montado: basta con cerrar el menú y el
  // foco sigue en la marca. Los enlaces DEL menú móvil, en cambio, se
  // desmontan al navegar: por eso mueven el foco al contenido principal.
  const cerrarMenu = () => setMenuAbierto(false);

  const navegarDesdeMenu = () => {
    setMenuAbierto(false);
    enfocarContenido();
  };

  // Escape cierra el menú móvil y devuelve el foco a la hamburguesa.
  // El clic fuera y el botón "atrás/adelante" también lo cierran: sin
  // ellos, navegar desde el desplegable de usuario (o volver con el
  // historial) dejaba el menú desplegado bajo la navbar en la página nueva.
  useEffect(() => {
    if (!menuAbierto) return undefined;

    const alPulsarEscape = (evento) => {
      if (evento.key !== "Escape") return;
      setMenuAbierto(false);
      botonRef.current?.focus();
    };
    const alPulsarFuera = (evento) => {
      // La hamburguesa alterna: si este listener la cerrara, el `click`
      // posterior la volvería a abrir y el botón parecería roto.
      if (botonRef.current?.contains(evento.target)) return;
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
    };
    const alCambiarHistoria = () => {
      // Si el foco estaba en el menú, al desmontarse caería en <body>.
      const focoDentro = menuRef.current?.contains(document.activeElement);
      setMenuAbierto(false);
      if (focoDentro) botonRef.current?.focus();
    };

    document.addEventListener("keydown", alPulsarEscape);
    document.addEventListener("mousedown", alPulsarFuera);
    window.addEventListener("popstate", alCambiarHistoria);
    return () => {
      document.removeEventListener("keydown", alPulsarEscape);
      document.removeEventListener("mousedown", alPulsarFuera);
      window.removeEventListener("popstate", alCambiarHistoria);
    };
  }, [menuAbierto]);

  // Al abrir, el foco va al primer enlace del menú
  useEffect(() => {
    if (!menuAbierto) return;
    const primero = menuRef.current?.querySelector("a[href], button:not([disabled])");
    primero?.focus();
  }, [menuAbierto]);

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <div className="contenedor navbar__inner">
        <NavLink to="/" className="navbar__brand" onClick={cerrarMenu}>
          Calisat
        </NavLink>

        <div className="navbar__links">
          <NavLink to="/productos" className={claseEnlace}>
            Productos
          </NavLink>
          {esCliente && (
            <NavLink to="/carrito" className={claseEnlace}>
              Carrito
            </NavLink>
          )}
        </div>

        <div className="navbar__acciones">
          <UserNavbar />
          <Button
            ref={botonRef}
            variant="fantasma"
            size="sm"
            className="navbar__hamburguesa"
            icon={
              menuAbierto ? (
                <X className="icono" aria-hidden="true" />
              ) : (
                <Menu className="icono" aria-hidden="true" />
              )
            }
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          />
        </div>
      </div>

      <div
        id="menu-principal"
        ref={menuRef}
        className={
          menuAbierto
            ? "navbar__menu navbar__menu--abierto anim-slide-down"
            : "navbar__menu"
        }
      >
        <NavLink to="/productos" className={claseEnlace} onClick={navegarDesdeMenu}>
          Productos
        </NavLink>
        {esCliente && (
          <NavLink to="/carrito" className={claseEnlace} onClick={navegarDesdeMenu}>
            Carrito
          </NavLink>
        )}
      </div>
    </nav>
  );
}
