import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import { formatoCLP } from "../../../../utils/formatoCLP";
import useCarrito from "../../../carrito/hooks/useCarrito";
import "./DetalleCompra.css";

/** Cantidad por línea: 1..99, el mismo tope que aplica el carrito. */
const limitar = (valor) => Math.min(99, Math.max(1, Number(valor) || 1));

/**
 * Columna de compra de la ficha: categoría → título → SKU → precio CLP →
 * descripción → stepper → CTA.
 *
 * El CTA añade la cantidad elegida y DESPLIEGA el drawer: la confirmación
 * visual la aporta el panel y la audible la región role="status" de abajo.
 */
export default function DetalleCompra({ producto }) {
  const { agregar, abrir } = useCarrito();
  const { sku, nombre, descripcion, precio, categoria, imagenUrl } = producto;
  const [cantidad, setCantidad] = useState(1);
  const [anuncio, setAnuncio] = useState("");
  const temporizador = useRef(null);

  // Si la ficha se desmonta antes del turno del anuncio se cancela: no se
  // escribe en una región que ya no está en el DOM.
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const cambiarCantidad = (delta) =>
    setCantidad((actual) => limitar(actual + delta));

  const onAgregar = () => {
    // Solo los campos que el carrito persiste (nunca descripción/categoría).
    agregar({ sku, nombre, imagenUrl, precio }, cantidad);
    abrir();
    // Vaciar y reescribir en un turno distinto hace que el lector de
    // pantalla anuncie también las adiciones idénticas seguidas.
    setAnuncio("");
    temporizador.current = setTimeout(() => setAnuncio("Añadido al carrito"), 120);
  };

  return (
    <div className="detalle__compra">
      <Badge tone="amarillo">{categoria}</Badge>
      <h1 className="detalle__titulo">{nombre}</h1>
      <p className="detalle__sku">SKU: {sku}</p>
      <p className="detalle__precio">{formatoCLP(precio)}</p>
      {descripcion && <p className="detalle__descripcion">{descripcion}</p>}

      <div className="detalle__cantidad">
        <span className="detalle__cantidad-etiqueta" id="detalle-cantidad">Cantidad</span>
        <div className="detalle__stepper" role="group" aria-labelledby="detalle-cantidad">
          <button
            type="button"
            className="detalle__paso"
            aria-label="Quitar una unidad"
            disabled={cantidad <= 1}
            onClick={() => cambiarCantidad(-1)}
          >
            <Minus className="icono" aria-hidden="true" />
          </button>
          <input
            className="detalle__numero"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={cantidad}
            aria-label="Unidades"
            onChange={(e) => setCantidad(limitar(e.target.value))}
          />
          <button
            type="button"
            className="detalle__paso"
            aria-label="Añadir una unidad"
            disabled={cantidad >= 99}
            onClick={() => cambiarCantidad(1)}
          >
            <Plus className="icono" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Button
        variant="primario"
        size="lg"
        className="boton--bloque"
        icon={<ShoppingCart aria-hidden="true" />}
        onClick={onAgregar}
      >
        Añadir al carrito
      </Button>

      <span className="visualmente-oculto" role="status">{anuncio}</span>
    </div>
  );
}
