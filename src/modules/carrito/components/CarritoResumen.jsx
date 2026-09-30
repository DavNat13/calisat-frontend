import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import useCarrito from "../hooks/useCarrito";
import { formatoCLP } from "../../../utils/formatoCLP";

/**
 * Pie fijo del panel: subtotal, total y la CTA al checkout.
 *
 * Va fuera de la lista con scroll (drawer__pie) para que el resumen y la
 * acción principal sean siempre visibles, sin importar cuántos productos
 * haya en el carrito.
 */
export default function CarritoResumen() {
  const { cantidadTotal, subtotal, preciosIncompletos, cerrar } = useCarrito();
  const navegar = useNavigate();

  const unidades = `${cantidadTotal} producto${cantidadTotal === 1 ? "" : "s"}`;

  // Se cierra el panel ANTES de navegar: si no, el diálogo seguiría montado
  // sobre /checkout y el body mantendría el scroll bloqueado.
  const procederAlCheckout = () => {
    cerrar();
    navegar("/checkout");
  };

  return (
    <div className="carrito-drawer__pie">
      <div className="carrito-drawer__fila">
        <span>Subtotal ({unidades})</span>
        <span>{formatoCLP(subtotal)}</span>
      </div>
      <div className="carrito-drawer__fila carrito-drawer__fila--total">
        <span>Total</span>
        <strong>{formatoCLP(subtotal)}</strong>
      </div>
      {/* role="status" (no "alert"): es un dato a considerar, no una urgencia. */}
      {preciosIncompletos && (
        <p className="carrito-drawer__nota" role="status">
          Algunos precios no están disponibles; el total se confirma en el
          checkout.
        </p>
      )}
      {/* Sin ramas por rol: sin sesión, ProtectedRoute (/checkout) redirige
          a /login y devuelve el destino en state.from. */}
      <Button
        variant="primario"
        size="lg"
        onClick={procederAlCheckout}
      >
        Proceder al checkout
      </Button>
    </div>
  );
}
