/**
 * Accesibilidad compartida por los diálogos del kit (Modal, Drawer).
 *
 * Se extrajo de Modal.jsx porque Drawer repite exactamente el mismo
 * comportamiento observable: Escape cierra, Tab/Shift+Tab cicla dentro del
 * panel, el scroll del body queda bloqueado y el foco entra por
 * [data-foco-principal] y se restaura al cerrar.
 *
 * Aquí vive la lógica pura (sin JSX) para que los componentes solo la
 * declaren en su useEffect.
 */

/** Elementos que pueden recibir foco dentro del panel del diálogo. */
export const SELECTOR_FOQUEABLES = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/** Focoables visibles del nodo (excluye ocultos y aria-hidden). */
export const elementosFocables = (nodo) =>
  Array.from(nodo.querySelectorAll(SELECTOR_FOQUEABLES)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      (el.offsetWidth > 0 || el.offsetHeight > 0)
  );

/**
 * Instala Escape (onEscape) y el focus-trap sobre el panel.
 * Se llama dentro de useEffect y SIEMPRE devuelve la limpieza (aunque
 * esté cerrado) para no romper el contrato de retorno del hook.
 */
export function trapDeFoco({ panelRef, abierto, onEscape }) {
  if (!abierto) return () => {};

  const alPulsarTecla = (evento) => {
    if (evento.key === "Escape") {
      onEscape?.();
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

    // Captura (capture=true) para interceptar la tabulación antes que el
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
}

// Contador de anidamiento: con dos diálogos a la vez (p. ej. un confirm
// dentro de un modal) el cierre del primero no debe desbloquear el body
// mientras el segundo siga abierto.
let profundidadScroll = 0;

/** Bloquea el scroll del body mientras `abierto`; devuelve la limpieza. */
export function bloquearScroll(abierto) {
  if (!abierto) return () => {};
  profundidadScroll += 1;
  document.body.classList.add("scroll-bloqueado");
  return () => {
    profundidadScroll = Math.max(0, profundidadScroll - 1);
    if (profundidadScroll === 0) {
      document.body.classList.remove("scroll-bloqueado");
    }
  };
}

/**
 * Foco inicial en [data-foco-principal] (o en el panel) y restauración
 * del foco anterior al desmontar. Compartido por Modal y Drawer.
 */
export function moverFocoAlAbrir(panelRef, abierto) {
  if (!abierto) return () => {};
  const anterior = document.activeElement;
  const panel = panelRef.current;
  const objetivo =
    (panel && panel.querySelector("[data-foco-principal]")) || panel;
  if (objetivo && typeof objetivo.focus === "function") objetivo.focus();
  return () => {
    if (anterior && typeof anterior.focus === "function") anterior.focus();
  };
}
