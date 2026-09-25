import "./Badge.css";

/**
 * Insignia (chip) del kit de UI.
 * Etiqueta compacta para estados/categorías. El texto es SIEMPRE negro
 * (los fondos claros de marca no sostienen texto blanco ni amarillo);
 * el matiz vive en el fondo y el borde.
 *
 * - tone: neutral | amarillo | exito | peligro
 */
export default function Badge({
  tone = "neutral",
  className = "",
  children,
  ...resto
}) {
  const clases = [
    "insignia",
    tone && tone !== "neutral" ? `insignia--${tone}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={clases} {...resto}>
      {children}
    </span>
  );
}
