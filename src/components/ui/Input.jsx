import { useId } from "react";
import { CircleAlert } from "lucide-react";
import "./Input.css";

/**
 * Campo de formulario del kit de UI.
 * Renderiza la estructura .campo (label + control + mensajes) definida en
 * src/styles/inputs.css. Todas las demás props pasan al input/textarea.
 *
 * - label:   texto visible del label (ligado con htmlFor/id)
 * - id:      id del control (si no se pasa, se genera con useId)
 * - error:   mensaje de error (role="alert"); sustituye al hint
 * - hint:    mensaje de ayuda bajo el control
 * - multiline: renderiza <textarea> en lugar de <input>
 */
export default function Input({
  label,
  id,
  error,
  hint,
  multiline = false,
  className = "",
  ...props
}) {
  const idAuto = useId();
  const campoId = id ?? idAuto;
  const mensajeId = `${campoId}-mensaje`;
  const hayMensaje = Boolean(error || hint);
  const Control = multiline ? "textarea" : "input";

  return (
    <div className={error ? "campo campo--error" : "campo"}>
      {label && (
        <label className="campo__label" htmlFor={campoId}>
          {label}
        </label>
      )}
      <Control
        {...props}
        id={campoId}
        className={["campo__control", className].filter(Boolean).join(" ")}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={hayMensaje ? mensajeId : undefined}
      />
      {error ? (
        <p className="campo__error campo__estado" id={mensajeId} role="alert">
          <CircleAlert className="icono icono--sm" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="campo__ayuda" id={mensajeId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
