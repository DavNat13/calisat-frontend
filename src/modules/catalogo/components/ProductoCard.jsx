import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import "./ProductoCard.css";

const formatPrecio = (precio) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);
};

/**
 * Tarjeta de producto.
 *
 * - vistaInactivos: variante de la lista de dados de baja (badge "Inactivo"
 *   y acción única "Reactivar"; sin editar ni eliminar).
 * - reactivando: bloquea el botón mientras dura la petición.
 * El resto de variantes (gestión / vitrina) no cambian.
 */
export default function ProductoCard({
  producto,
  puedeGestionar,
  onEdit,
  onDelete,
  vistaInactivos = false,
  onReactivar,
  reactivando = false,
}) {
  const { sku, nombre, descripcion, precio, categoria, imagenUrl } = producto;

  return (
    <Card
      as="article"
      hover
      columna
      className={vistaInactivos ? "producto-card producto-card--inactivo" : "producto-card"}
    >
      {imagenUrl && (
        <img className="producto-card__imagen" src={imagenUrl} alt={nombre} />
      )}
      <div className="producto-card__cuerpo">
        <div className="producto-card__cabecera">
          <div className="producto-card__info">
            <h3 className="producto-card__nombre">{nombre}</h3>
            <Badge tone="neutral">{categoria}</Badge>
            {vistaInactivos && <Badge tone="peligro">Inactivo</Badge>}
          </div>
          <p className="producto-card__precio">{formatPrecio(precio)}</p>
        </div>

        <p className="producto-card__sku">SKU: {sku}</p>

        {descripcion && (
          <p className="producto-card__descripcion texto-clamp-2">
            {descripcion}
          </p>
        )}

        {vistaInactivos ? (
          <div className="producto-card__acciones producto-card__acciones--unica">
            <Button
              variant="primario"
              size="sm"
              icon={<RotateCcw className="icono icono--sm" aria-hidden="true" />}
              onClick={() => onReactivar?.(sku)}
              disabled={reactivando}
            >
              {reactivando ? "Reactivando..." : "Reactivar"}
            </Button>
          </div>
        ) : (
          puedeGestionar && (
            <div className="producto-card__acciones">
              <Button
                variant="secundario"
                size="sm"
                icon={<Pencil className="icono icono--sm" aria-hidden="true" />}
                onClick={() => onEdit(sku)}
              >
                Editar
              </Button>
              <Button
                variant="peligro"
                size="sm"
                icon={<Trash2 className="icono icono--sm" aria-hidden="true" />}
                onClick={() => onDelete(sku)}
              >
                Eliminar
              </Button>
            </div>
          )
        )}
      </div>
    </Card>
  );
}
