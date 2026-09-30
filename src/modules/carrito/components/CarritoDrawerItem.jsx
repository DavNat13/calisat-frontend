import { Minus, Package, Plus, Trash2 } from "lucide-react";
import useCarrito from "../hooks/useCarrito";
import { formatoCLP } from "../../../utils/formatoCLP";
import "./CarritoDrawerItem.css";

/**
 * Fila de un producto dentro del panel del carrito: miniatura, nombre,
 * SKU, stepper de cantidades, precio de línea y acción "Quitar".
 *
 * El stepper es un patrón compuesto (botón −, campo numérico, botón +) con
 * objetivos táctiles de 44px; el input es CONTROLADO por `cantidad`, de
 * modo que cualquier entrada fuera de 1..99 la normaliza el hook.
 */
export default function CarritoDrawerItem({ item }) {
  const { actualizarCantidad, quitar } = useCarrito();
  const { sku, nombre, imagenUrl, precio, cantidad } = item;

  // precio llega normalizado (number|null): con null se muestra "—" y nunca
  // un "$0" que falsearía el total.
  const precioLinea =
    precio === null || !Number.isFinite(Number(precio))
      ? null
      : Number(precio) * cantidad;

  return (
    <li className="carrito-drawer__item">
      <span className="carrito-drawer__miniatura">
        {imagenUrl ? (
          // alt="" a propósito: el nombre del producto ya está al lado y
          // duplicarlo haría que el lector de pantalla lo leyera dos veces.
          <img src={imagenUrl} alt="" />
        ) : (
          <Package className="icono" aria-hidden="true" />
        )}
      </span>

      <div className="carrito-drawer__item-datos">
        <div className="carrito-drawer__item-cabecera">
          <div className="carrito-drawer__item-texto">
            <p className="carrito-drawer__item-nombre">{nombre}</p>
            <p className="carrito-drawer__item-sku">SKU: {sku}</p>
          </div>
          <span className="carrito-drawer__item-precio">
            {formatoCLP(precioLinea)}
          </span>
        </div>

        <div className="carrito-drawer__item-pie">
          <div className="carrito-drawer__stepper">
            <button
              type="button"
              className="carrito-drawer__paso"
              aria-label={`Quitar una unidad de ${nombre}`}
              onClick={() => actualizarCantidad(sku, cantidad - 1)}
            >
              <Minus className="icono icono--sm" aria-hidden="true" />
            </button>
            {/* Etiqueta corta: el contexto lo aporta la propia fila <li>,
                donde el nombre del producto precede al campo. */}
            <input
              className="carrito-drawer__cantidad"
              type="number"
              min={1}
              max={99}
              value={cantidad}
              aria-label="Cantidad"
              onChange={(evento) => actualizarCantidad(sku, evento.target.value)}
            />
            <button
              type="button"
              className="carrito-drawer__paso"
              aria-label={`Añadir una unidad de ${nombre}`}
              onClick={() => actualizarCantidad(sku, cantidad + 1)}
            >
              <Plus className="icono icono--sm" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className="carrito-drawer__quitar"
            onClick={() => quitar(sku)}
          >
            <Trash2 className="icono icono--sm" aria-hidden="true" />
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
}
