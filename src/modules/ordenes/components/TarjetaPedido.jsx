import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { formatoCLP } from "../../../utils/formatoCLP";

/** Estados desde los que el pedido todavía se puede cancelar. */
const CANCELABLES = new Set(["PENDIENTE", "PAGADA", "EN_PREPARACION"]);

const TONO = {
  PENDIENTE: "amarillo",
  PAGADA: "exito",
  EN_PREPARACION: "neutral",
  ENVIADA: "amarillo",
  ENTREGADA: "exito",
  CANCELADA: "neutral",
  FALLO_PAGO: "peligro",
};

const fechaCorta = (iso) => {
  if (!iso) return "—";
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? "—" : fecha.toLocaleString("es-CL");
};

/**
 * Ficha de una orden en "Mis pedidos": identificador, estado, líneas con su
 * subtotal, desglose de subtotal + envío y acción de cancelación mientras
 * el estado lo permita.
 *
 * @param {object} props
 * @param {object} props.orden orden de `ms-orden`
 * @param {Function} props.onCancel llamada al pulsar "Cancelar"
 * @param {boolean} props.cancelando true mientras se envía la cancelación
 */
export default function TarjetaPedido({ orden, onCancel, cancelando }) {
  const enCurso = cancelando === orden.id;
  return (
    <li className="tarjeta pedidos__item">
      <div className="pedidos__cabecera">
        <div>
          <strong>{orden.id}</strong>
          <span className="pedidos__fecha">{fechaCorta(orden.fechaCreacion)}</span>
        </div>
        <Badge tone={TONO[orden.estado] ?? "neutral"}>{orden.estado}</Badge>
      </div>

      <ul className="pedidos__productos">
        {(orden.items ?? []).map((linea) => (
          <li key={linea.id ?? linea.sku}>
            {linea.nombreProducto || linea.sku} × {linea.cantidad}{" "}
            <span>{formatoCLP(linea.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="pedidos__pie">
        <span className="pedidos__costos">
          Subtotal {formatoCLP(orden.subtotal)} · Envío{" "}
          {formatoCLP(orden.costoEnvio ?? 0)}
        </span>
        <strong>{formatoCLP(orden.total)}</strong>
        {CANCELABLES.has(orden.estado) && (
          <Button
            variant="peligro"
            size="sm"
            disabled={enCurso}
            onClick={() => onCancel(orden.id)}
          >
            {enCurso ? "Cancelando…" : "Cancelar"}
          </Button>
        )}
      </div>
    </li>
  );
}
