import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { bloquearScroll, moverFocoAlAbrir, trapDeFoco } from "./focoTrap";
import "./Modal.css";

/**
 * Modal accesible del kit de UI.
 *
 * Comportamiento/a11y (toda la lógica vive en focoTrap.js, compartida con
 * Drawer): role="dialog" + aria-modal + aria-labelledby hacia el título
 * (h2, para no romper la jerarquía de encabezados), cierra con Escape y al
 * pulsar fuera, bloquea el scroll del body, Tab/Shift+Tab ciclan dentro del
 * panel y el foco entra por [data-foco-principal] y se restaura al cerrar.
 *
 * Props: open, title, onClose, footer (nodo con las acciones), children.
 */
export default function Modal({
  open = false,
  title,
  onClose,
  children,
  footer,
  className = "",
}) {
  const panelRef = useRef(null);
  const idTitulo = useId();

  // Escape + focus-trap mientras esté abierto
  useEffect(
    () => trapDeFoco({ panelRef, abierto: open, onEscape: onClose }),
    [open, onClose]
  );

  // Bloqueo del scroll (clase global en base.css, con contador de anidamiento)
  useEffect(() => bloquearScroll(open), [open]);

  // Foco al entrar y restauración al salir
  useEffect(() => moverFocoAlAbrir(panelRef, open), [open]);

  if (!open) return null;

  const cerrarEnOverlay = (evento) => {
    if (evento.target === evento.currentTarget) onClose?.();
  };

  return (
    <div className="modal-overlay anim-fade-in" onClick={cerrarEnOverlay}>
      <div
        ref={panelRef}
        className={["modal", "anim-scale-in", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        <div className="modal__cabecera">
          <h2 className="modal__titulo" id={idTitulo}>
            {title}
          </h2>
          <button
            type="button"
            className="boton boton--fantasma boton--icono boton--sm modal__cerrar"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="icono" aria-hidden="true" />
          </button>
        </div>

        <div className="modal__cuerpo">{children}</div>

        {footer && <div className="modal__acciones">{footer}</div>}
      </div>
    </div>
  );
}
