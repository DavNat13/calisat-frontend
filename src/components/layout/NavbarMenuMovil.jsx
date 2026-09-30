import NavbarEnlaces from "./NavbarEnlaces";
import useCarrito from "../../modules/carrito/hooks/useCarrito";
import enfocarContenido from "../../utils/enfocarContenido";
import "./NavbarMenuMovil.css";

/**
 * Menú desplegable de la navbar en pantallas pequeñas (#menu-principal).
 *
 * El ESTADO (abierto), el ref del contenedor y los listeners de Escape /
 * clic fuera / popstate siguen en Navbar.jsx; aquí solo se compone el
 * contenido: los tres enlaces, un separador y la fila del carrito.
 *
 * @param {{ abierto: boolean, menuRef: RefObject<HTMLDivElement>,
 *           onCerrarMenu: () => void }} props
 */
export default function NavbarMenuMovil({ abierto, menuRef, onCerrarMenu }) {
  const { abrir, cantidadTotal } = useCarrito();

  // Al navegar desde un enlace el menú se desmonta: hay que cerrarlo y
  // trasladar el foco a #contenido, o quedaría perdido en <body>.
  const navegarDesdeMenu = () => {
    onCerrarMenu();
    enfocarContenido();
  };

  // El carrito cierra SOLO el menú: el foco lo retoma el panel lateral en
  // el momento en que este se abre.
  const alAbrirCarrito = () => {
    onCerrarMenu();
    abrir();
  };

  return (
    <div
      id="menu-principal"
      ref={menuRef}
      className={
        abierto
          ? "navbar__menu navbar__menu--abierto anim-slide-down"
          : "navbar__menu"
      }
    >
      <NavbarEnlaces onNavegar={navegarDesdeMenu} />
      <hr className="navbar__separador" />
      <button
        type="button"
        className="navbar__link navbar__carrito-movil"
        onClick={alAbrirCarrito}
      >
        Mi carrito ({cantidadTotal})
      </button>
    </div>
  );
}
