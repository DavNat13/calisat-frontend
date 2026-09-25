import "./Card.css";

/**
 * Envoltorio de tarjeta del kit de UI.
 * Compone la primitiva global .tarjeta (src/styles/tarjetas.css); aquí solo
 * se expone la API y el modificador de layout propio (.tarjeta--columna).
 *
 * - as:       elemento a renderizar (div por defecto, p. ej. as="article")
 * - hover     (bool): añade el modificador .tarjeta--hover (elevación al cursor)
 * - columna   (bool): tarjeta en columna flex de altura igual en rejilla
 * - className: clases semánticas adicionales del consumidor
 */
export default function Card({
  as: Etiqueta = "div",
  hover = false,
  columna = false,
  className = "",
  children,
  ...resto
}) {
  const clases = [
    "tarjeta",
    hover ? "tarjeta--hover" : "",
    columna ? "tarjeta--columna" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Etiqueta className={clases} {...resto}>{children}</Etiqueta>;
}
