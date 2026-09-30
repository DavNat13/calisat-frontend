import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserNavbar from "../../modules/usuarios/components/UserNavbar";
import Button from "../ui/Button";
import NavbarEnlaces from "./NavbarEnlaces";
import NavbarCarrito from "./NavbarCarrito";
import NavbarMenuMovil from "./NavbarMenuMovil";
import "./Navbar.css";

/**
 * Barra superior: marca + enlaces de escritorio + acciones de sesión.
 *
 * La barra se compone así:
 * - NavbarEnlaces: los tres enlaces de escritorio (Catálogo/Nosotros/Contacto).
 * - NavbarCarrito: botón con el contador del carrito y apertura del panel.
 * - NavbarMenuMovil: menú de pantallas pequeñas (los mismos enlaces y la
 *   fila que abre el panel lateral); su ESTADO vive aquí, porque necesita
 *   controlar la hamburguesa y el contenedor desplegado (Escape, clic
 *   fuera, popstate).
 */
export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonRef = useRef(null);
  const menuRef = useRef(null);

  // El enlace de marca permanece montado: basta con cerrar el menú y el
  // foco sigue en la marca. Los enlaces DEL menú móvil, en cambio, se
  // desmontan al navegar: por eso mueven el foco al contenido principal.
  const cerrarMenu = () => setMenuAbierto(false);

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
          <NavbarEnlaces />
        </div>

        <div className="navbar__acciones">
          <NavbarCarrito />
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

      <NavbarMenuMovil
        abierto={menuAbierto}
        menuRef={menuRef}
        onCerrarMenu={cerrarMenu}
      />
    </nav>
  );
}
