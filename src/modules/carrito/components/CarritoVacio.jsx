import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

/**
 * Estado vacío del panel del carrito.
 *
 * El enlace cierra el drawer (onExplorar) antes de navegar: si no, el
 * diálogo seguiría montado (y el body con scroll bloqueado) sobre la nueva
 * ruta.
 */
export default function CarritoVacio({ onExplorar }) {
  return (
    <div className="carrito-drawer__vacio">
      <span className="carrito-drawer__vacio-icono" aria-hidden="true">
        <ShoppingCart className="icono icono--xl" />
      </span>
      <p className="carrito-drawer__vacio-titulo">Tu carrito está vacío</p>
      <p className="carrito-drawer__vacio-texto">
        Agrega productos del catálogo y los verás aquí.
      </p>
      {/* <Link> (no <button>): es un cambio de destino, y así admite abrir
          en otra pestaña. El aspecto de botón viene de la primitiva global. */}
      <Link
        to="/productos"
        className="boton boton--secundario"
        onClick={onExplorar}
      >
        Explorar catálogo
      </Link>
    </div>
  );
}
