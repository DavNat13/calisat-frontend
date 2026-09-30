import { Navigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import useCarrito from "../hooks/useCarrito";
import { formatoCLP } from "../../../utils/formatoCLP";
import "./CheckoutPage.css";

/**
 * Checkout (Fase 2): resumen SOLO LECTURA del carrito.
 *
 * El pago todavía no existe, así que la página muestra qué se va a comprar
 * y avisa con "Próximamente"; la edición sigue viviendo en el panel lateral
 * (el botón "Volver al carrito" lo reabre).
 */
export default function CheckoutPage() {
  const {
    items,
    cargando,
    cantidadTotal,
    subtotal,
    preciosIncompletos,
    abrir,
  } = useCarrito();

  // Sin ítems (y sin una carga en curso) no hay nada que pagar: se vuelve
  // al catálogo en lugar de dejar un <main> en blanco.
  if (items.length === 0 && !cargando) {
    return <Navigate to="/productos" replace />;
  }

  return (
    <div className="pagina">
      <div className="contenedor checkout">
        <header className="pagina__cabecera">
          <div className="pagina__cabecera-texto">
            <h1 className="pagina__titulo">Resumen del pedido</h1>
            <p className="pagina__descripcion">
              Revisa tus productos antes de pagar. Todos los precios están
              en pesos chilenos (CLP).
            </p>
          </div>
        </header>

        <section className="tarjeta checkout__resumen" aria-label="Productos del pedido">
          <ul className="checkout__lista">
            {items.map((item) => (
              <li key={item.sku} className="checkout__fila">
                <span className="checkout__nombre">
                  {item.nombre}
                  <span className="checkout__cantidad"> × {item.cantidad}</span>
                </span>
                {/* precio llega normalizado (number|null): null ⇒ "—" */}
                <span className="checkout__precio">
                  {formatoCLP(item.precio == null ? null : item.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="tarjeta__footer checkout__total">
            <span>
              Total ({cantidadTotal} producto{cantidadTotal === 1 ? "" : "s"})
            </span>
            <strong>{formatoCLP(subtotal)}</strong>
          </div>
        </section>

        {preciosIncompletos && (
          <p className="checkout__aviso" role="status">
            Algunos precios no están disponibles; el total se confirma al
            pagar.
          </p>
        )}

        <section className="tarjeta checkout__pago">
          <Badge tone="amarillo">Próximamente</Badge>
          <p className="checkout__pago-texto">
            El pago se habilitará muy pronto. Por ahora puedes volver al
            carrito para seguir revisando tu pedido.
          </p>
          <div className="pagina__acciones">
            <Button variant="secundario" onClick={abrir}>
              Volver al carrito
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
