import { ShoppingCart } from "lucide-react";
import Button from "../ui/Button";
import useCarrito from "../../modules/carrito/hooks/useCarrito";
import "./NavbarCarrito.css";

/**
 * Botón del carrito en la navbar.
 *
 * Accesibilidad (patrón de diálogo):
 * - aria-haspopup="dialog" + aria-expanded: anuncia que hay un panel lateral
 *   y si está desplegado.
 * - aria-controls="panel-carrito": apunta al id del diálogo (lo pone
 *   CarritoDrawer sobre el panel del Drawer); el nodo aún no existe en el
 *   DOM, cosa permitida por la especificación.
 * - El contador es un badge con aria-hidden: el nombre accesible del botón
 *   ya lo describe ("Carrito, 3 productos"), y anunciarlo dos veces solo
 *   ensucia la lectura.
 * - El aria-live va FUERA del botón: notifica cambios de cantidad aunque
 *   el usuario no tenga el foco en el carrito.
 */
export default function NavbarCarrito() {
  const { cantidadTotal, abierto, abrir } = useCarrito();
  const unidades = `${cantidadTotal} producto${cantidadTotal === 1 ? "" : "s"}`;
  const contador = cantidadTotal >= 100 ? "99+" : String(cantidadTotal);

  return (
    <>
      <Button
        variant="fantasma"
        size="sm"
        className="navbar__carrito"
        icon={<ShoppingCart className="icono" aria-hidden="true" />}
        aria-label={`Carrito, ${unidades}`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls="panel-carrito"
        onClick={abrir}
      >
        <span
          className={
            cantidadTotal === 0
              ? "navbar__contador navbar__contador--oculto"
              : "navbar__contador"
          }
          aria-hidden="true"
        >
          {contador}
        </span>
      </Button>
      <span className="visualmente-oculto" aria-live="polite">
        {unidades} en el carrito
      </span>
    </>
  );
}
