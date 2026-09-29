import { useCallback, useEffect, useRef, useState } from "react";
import enfocarContenido from "../../../utils/enfocarContenido";

/** Opciones enfocables del desplegable, en orden visual. */
const listarOpciones = (contenedor, selector) =>
  Array.from(contenedor?.querySelectorAll(selector) ?? []);

/**
 * Menú desplegable accesible (patrón menu-button, WAI-ARIA).
 *
 * Extraído de UserNavbar.jsx para respetar el límite de 150 líneas por
 * archivo SIN perder ningún comportamiento actual:
 *  - estado `abierto` + refs de contenedor y disparador;
 *  - Escape cierra y devuelve el foco al disparador (solo si el foco estaba
 *    dentro del menú);
 *  - clic fuera (`mousedown`) cierra sin mover el foco;
 *  - `popstate` cierra: el historial navega y el menú seguía desplegado;
 *  - al abrir, el foco entra a la primera opción;
 *  - flechas ↑/↓ recorren las opciones con wrap (↓ con el menú cerrado abre).
 *
 * Los listeners se registran SOLO mientras `abierto` es true (mismo criterio
 * que la implementación original).
 *
 * @param {string} selectorOpciones CSS de las opciones navegables con flechas
 *   (por defecto `.usuario__opcion`; el `<hr>` no lo lleva y se salta).
 * @returns {{
 *   abierto: boolean,
 *   alternar: () => void,
 *   cerrarYContenido: () => void,
 *   contenedorRef: import('react').RefObject<HTMLDivElement>,
 *   botonRef: import('react').RefObject<HTMLButtonElement>,
 *   manejarTeclas: (e: KeyboardEvent) => void,
 * }}
 */
export default function useMenuDesplegable(selectorOpciones = ".usuario__opcion") {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const botonRef = useRef(null);

  // Cierre que devuelve el foco al disparador si el foco estaba dentro
  // (si no, quedaría en <body> al desmontarse el desplegable).
  const cerrarDevolverFoco = useCallback(() => {
    const focoDentro = contenedorRef.current?.contains(document.activeElement);
    setAbierto(false);
    if (focoDentro) botonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!abierto) return undefined;

    const alPulsarEscape = (evento) => {
      if (evento.key === "Escape") cerrarDevolverFoco();
    };
    // El clic fuera cubre la navegación desde los enlaces de la navbar y
    // popstate la que hace el historial (en ambos casos el desplegable
    // dejaba de estar en la página nueva).
    const alPulsarFuera = (evento) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener("keydown", alPulsarEscape);
    document.addEventListener("mousedown", alPulsarFuera);
    window.addEventListener("popstate", cerrarDevolverFoco);
    return () => {
      document.removeEventListener("keydown", alPulsarEscape);
      document.removeEventListener("mousedown", alPulsarFuera);
      window.removeEventListener("popstate", cerrarDevolverFoco);
    };
  }, [abierto, cerrarDevolverFoco]);

  // Al abrir, el foco entra a la primera opción (patrón menu-button:
  // Escape lo devuelve al botón).
  useEffect(() => {
    if (!abierto) return;
    listarOpciones(contenedorRef.current, selectorOpciones)[0]?.focus();
  }, [abierto, selectorOpciones]);

  // Flechas ↑/↓ para recorrer las opciones del desplegable.
  const manejarTeclas = (evento) => {
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;

    if (!abierto) {
      // Cerrado: el desplegable NO está montado, así que la lista estaba
      // siempre vacía y ↓ no abría nunca el menú. Al abrir, el efecto de
      // arriba enfoca la 1ª opción.
      if (evento.key === "ArrowDown") {
        evento.preventDefault();
        setAbierto(true);
      }
      return;
    }

    const lista = listarOpciones(contenedorRef.current, selectorOpciones);
    if (lista.length === 0) return;

    evento.preventDefault();
    const indice = lista.indexOf(document.activeElement);
    const delta = evento.key === "ArrowDown" ? 1 : -1;
    const siguiente =
      indice === -1
        ? delta > 0
          ? 0
          : lista.length - 1
        : (indice + delta + lista.length) % lista.length;
    lista[siguiente].focus();
  };

  // Cerrar y sacar el foco del sitio que se desmonta: los enlaces del
  // desplegable desaparecen al navegar y, sin esto, el foco quedaría en
  // <body>; se traslada al contenido principal (tabindex="-1").
  const cerrarYContenido = () => {
    setAbierto(false);
    enfocarContenido();
  };

  return {
    abierto,
    alternar: () => setAbierto((valor) => !valor),
    cerrarYContenido,
    contenedorRef,
    botonRef,
    manejarTeclas,
  };
}
