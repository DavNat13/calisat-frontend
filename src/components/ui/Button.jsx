import "./Button.css";

/**
 * Botón del kit de UI.
 * Solo expone la API: el aspecto vive en la primitiva global .boton
 * (src/styles/botones.css) compuesta aquí con clases semánticas.
 *
 * - variant: primario | secundario | peligro | fantasma
 * - size:    sm | md (por defecto, sin modificador) | lg
 * - icon:    nodo decorativo opcional (si no hay children, el nombre
 *            accesible debe venir de aria-label).
 */
export default function Button({
  variant = "primario",
  size = "md",
  type = "button",
  icon,
  children,
  className = "",
  disabled,
  onClick,
  ...resto
}) {
  const clases = [
    "boton",
    `boton--${variant}`,
    size !== "md" ? `boton--${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={clases}
      disabled={disabled}
      onClick={onClick}
      {...resto}
    >
      {icon && (
        <span className="boton__icono" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
