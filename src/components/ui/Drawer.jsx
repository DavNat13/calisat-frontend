import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { bloquearScroll, moverFocoAlAbrir, trapDeFoco } from "./focoTrap";
import "./Drawer.css";

/**
 * Diálogo lateral DERECHO (panel deslizante) del kit de UI.
 *
 * Mismo contrato que Modal: no se renderiza cuando `open` es false, Escape
 * cierra, Tab cicla dentro del panel, el scroll del body queda bloqueado y
 * el foco entra por [data-foco-principal] (el botón cerrar) y se restaura
 * al salir. Toda esa lógica viene de focoTrap.js.
 *
 * Props: open, onClose, title, children, footer, className,
 *        labelledBy (id personalizado para el h2 del título),
 *        id (identidad del panel: permite que el disparador pueda apuntar
 *            con aria-controls aunque el diálogo aún no esté en el DOM).
 */
export default function Drawer({
  open = false,
  onClose,
  title,
  children,
  footer,
  className = "",
  labelledBy,
  id,
}) {
  const panelRef = useRef(null);
  const raizRef = useRef(null);
  const idAuto = useId();
  const idTitulo = labelledBy ?? idAuto;

  // El panel monta trasladado a la derecha (translateX(100%)); recién dos
  // frames después se añade el modificador BEM .drawer--abierto para que la
  // transición lo deslice (si no, el navegador aún no habría pintado el
  // estado inicial y saltaría al final sin animar). Se toca el DOM directo
  // en vez de setState: es un estado de presentación, no de React.
  useEffect(() => {
    if (!open) return undefined;
    const marco = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        raizRef.current?.classList.add("drawer--abierto")
      )
    );
    return () => cancelAnimationFrame(marco);
  }, [open]);

  useEffect(
    () => trapDeFoco({ panelRef, abierto: open, onEscape: onClose }),
    [open, onClose]
  );
  useEffect(() => bloquearScroll(open), [open]);
  useEffect(() => moverFocoAlAbrir(panelRef, open), [open]);

  if (!open) return null;

  // Clic fuera del panel (overlay o área vacía) = cerrar, igual que Modal.
  const cerrarFuera = (evento) => {
    if (panelRef.current && !panelRef.current.contains(evento.target)) {
      onClose?.();
    }
  };

  return (
    <div ref={raizRef} className="drawer" onClick={cerrarFuera}>
      <div className="drawer__overlay anim-fade-in" aria-hidden="true" />
      <div
        ref={panelRef}
        id={id}
        className={["drawer__panel", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        <div className="drawer__cabecera">
          <h2 className="drawer__titulo" id={idTitulo}>
            {title}
          </h2>
          <button
            type="button"
            className="boton boton--fantasma boton--icono boton--sm drawer__cerrar"
            onClick={onClose}
            aria-label="Cerrar"
            data-foco-principal=""
          >
            <X className="icono" aria-hidden="true" />
          </button>
        </div>

        <div className="drawer__cuerpo">{children}</div>

        {footer && <div className="drawer__acciones">{footer}</div>}
      </div>
    </div>
  );
}
