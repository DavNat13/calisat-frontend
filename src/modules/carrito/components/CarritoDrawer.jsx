import Drawer from "../../../components/ui/Drawer";
import Button from "../../../components/ui/Button";
import useCarrito from "../hooks/useCarrito";
import CarritoDrawerItem from "./CarritoDrawerItem";
import CarritoResumen from "./CarritoResumen";
import CarritoVacio from "./CarritoVacio";
import "./CarritoDrawer.css";

/**
 * Panel lateral del carrito (diálogo lateral DERECHO del kit).
 *
 * Se compone sobre <Drawer>: aquí solo se declaran los tres estados
 * posibles del cuerpo —
 *   (a) vacío        → CarritoVacio
 *   (b) con ítems    → lista con scroll propio + CarritoResumen fijo al pie
 *   (c) error        → role="alert" + botón Reintentar
 * El foco, Escape, el bloqueo de scroll y el clic fuera los aporta Drawer.
 *
 * `id="panel-carrito"` es el que el botón de la navbar referencia con
 * aria-controls (el diálogo no existe en el DOM hasta que se abre).
 */
export default function CarritoDrawer() {
  const { items, abierto, error, cerrar, reintentar } = useCarrito();
  const hayItems = items.length > 0;

  return (
    <Drawer
      id="panel-carrito"
      open={abierto}
      onClose={cerrar}
      title="Tu carrito"
      labelledBy="titulo-carrito"
      className="carrito-drawer"
    >
      {error ? (
        <div className="carrito-drawer__error" role="alert">
          <p className="carrito-drawer__error-texto">{error}</p>
          <Button variant="secundario" size="sm" onClick={reintentar}>
            Reintentar
          </Button>
        </div>
      ) : hayItems ? (
        <>
          <ul className="carrito-drawer__lista" aria-label="Productos del carrito">
            {items.map((item) => (
              <CarritoDrawerItem key={item.sku} item={item} />
            ))}
          </ul>
          <CarritoResumen />
        </>
      ) : (
        <CarritoVacio onExplorar={cerrar} />
      )}
    </Drawer>
  );
}
