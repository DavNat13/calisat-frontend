import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Pencil, RotateCcw, ShoppingCart, Trash2 } from "lucide-react";
import { formatoCLP } from "../../../utils/formatoCLP";
import useCarrito from "../../carrito/hooks/useCarrito";
import "./ProductoCard.css";

/**
 * Tarjeta de producto.
 *
 * - vistaInactivos: variante de la lista de dados de baja (badge "Inactivo"
 *   y acción única "Reactivar"; sin editar ni eliminar).
 * - reactivando: bloquea el botón mientras dura la petición.
 * - Modo VITRINA (ni gestión ni inactivos): el nombre enlaza a la ficha
 *   pública /producto/:sku, el precio se muestra en CLP y la acción única
 *   es "Añadir al carrito" (suma 1 unidad y despliega el drawer como
 *   confirmación).
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
  const { agregar, abrir } = useCarrito();
  const [anuncio, setAnuncio] = useState("");
  const { sku, nombre, descripcion, precio, categoria, imagenUrl } = producto;

  // El carrito solo persiste {sku, nombre, imagenUrl, precio}: enviarle el
  // objeto completo arrastraría descripción/categoría a localStorage.
  const paraCarrito = { sku, nombre, imagenUrl, precio };
  const vitrina = !puedeGestionar && !vistaInactivos;

  const onAgregar = () => {
    agregar(paraCarrito, 1);
    abrir();
    // Región viva: se vacía y se vuelve a escribir en un turno distinto
    // para que el lector de pantalla anuncie también las veces seguidas.
    setAnuncio("");
    setTimeout(() => setAnuncio("Añadido al carrito"), 100);
  };

  return (
    <Card
      as="article"
      hover
      columna
      className={vistaInactivos ? "producto-card producto-card--inactivo" : "producto-card"}
    >
      {imagenUrl && (
        <img
          className="producto-card__imagen"
          src={imagenUrl}
          alt={nombre}
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="producto-card__cuerpo">
        <div className="producto-card__cabecera">
          <div className="producto-card__info">
            <h3 className="producto-card__nombre">
              {vitrina ? (
                <Link className="producto-card__nombre-enlace" to={`/producto/${sku}`}>
                  {nombre}
                </Link>
              ) : (
                nombre
              )}
            </h3>
            <Badge tone="neutral">{categoria}</Badge>
            {vistaInactivos && <Badge tone="peligro">Inactivo</Badge>}
          </div>
          <p className="producto-card__precio">{formatoCLP(precio)}</p>
        </div>

        <p className="producto-card__sku">SKU: {sku}</p>

        {descripcion && (
          <p className="producto-card__descripcion texto-clamp-2">
            {descripcion}
          </p>
        )}

        {/* Confirmación anunciada al añadir: el drawer ya aporta la señal
            VISUAL, aquí va la audible para lectores de pantalla. */}
        <span className="visualmente-oculto" role="status">
          {anuncio}
        </span>

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
        ) : puedeGestionar ? (
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
        ) : (
          <div className="producto-card__acciones producto-card__acciones--unica">
            <Button
              variant="primario"
              size="sm"
              icon={<ShoppingCart className="icono icono--sm" aria-hidden="true" />}
              onClick={onAgregar}
            >
              Añadir al carrito
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
