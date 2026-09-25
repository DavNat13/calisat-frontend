import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import "./Modal.css";

/** Elementos que pueden recibir foco dentro del panel del diálogo. */
const SELECTOR_FOQUEABLES = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

const elementosFocables = (nodo) =>
  Array.from(nodo.querySelectorAll(SELECTOR_FOQUEABLES)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      (el.offsetWidth > 0 || el.offsetHeight > 0)
  );

/**
 * Modal accesible del kit de UI.
 *
 * Comportamiento/a11y:
 * - role="dialog" + aria-modal + aria-labelledby hacia el título (h2, para
 *   no romper la jerarquía de encabezados de la página que lo abre).
 * - Se cierra con Escape y al pulsar fuera (overlay).
 * - Bloquea el scroll del body mientras está abierto (se restaura al cerrar).
 * - Focus-trap real: Tab/Shift+Tab ciclan dentro del panel.
 * - Al abrir lleva el foco al botón marcado con data-foco-principal
 *   (si no existe, al panel) y lo restaura al cerrar.
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
  useEffect(() => {
    if (!open) return undefined;

    const alPulsarTecla = (evento) => {
      if (evento.key === "Escape") {
        onClose?.();
        return;
      }
      if (evento.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focoables = elementosFocables(panel);
      if (focoables.length === 0) {
        evento.preventDefault();
        panel.focus();
        return;
      }

      const primero = focoables[0];
      const ultimo = focoables[focoables.length - 1];
      const actual = document.activeElement;
      const dentroDelPanel = panel.contains(actual);

      // Captura (capture=true) para interceptar la tabulación antes del
      // navegador: si el foco está fuera o en el borde, se recicla dentro.
      if (evento.shiftKey) {
        if (!dentroDelPanel || actual === primero) {
          evento.preventDefault();
          ultimo.focus();
        }
      } else if (!dentroDelPanel || actual === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alPulsarTecla, true);
    return () => document.removeEventListener("keydown", alPulsarTecla, true);
  }, [open, onClose]);

  // Bloqueo del scroll del body (clase definida en Modal.css)
  useEffect(() => {
    if (!open) return undefined;

    document.body.classList.add("scroll-bloqueado");
    return () => document.body.classList.remove("scroll-bloqueado");
  }, [open]);

  // Foco al entrar y restauración al salir
  useEffect(() => {
    if (!open) return undefined;

    const anterior = document.activeElement;
    const panel = panelRef.current;
    const objetivo = (panel && panel.querySelector("[data-foco-principal]")) || panel;
    if (objetivo && typeof objetivo.focus === "function") objetivo.focus();

    return () => {
      if (anterior && typeof anterior.focus === "function") anterior.focus();
    };
  }, [open]);

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
