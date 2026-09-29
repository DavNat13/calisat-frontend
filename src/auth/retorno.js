/**
 * "Retorno": ruta original que el usuario quería abrir antes de que
 * `ProtectedRoute` lo mandase a `/login`.
 *
 * `ProtectedRoute` la inyecta en `location.state.from`, pero el redirect
 * OAuth RECARGA la SPA: `history.state` se pierde en el camino. Por eso la
 * ruta se persiste en `sessionStorage` ANTES de navegar y se consume (y se
 * borra) al volver. Si no había retorno, el destino es `/`.
 *
 * Fuera de alcance de `App.jsx` (no se puede tocar) no hay `<Router>`, así
 * que la vuelta se resuelve con una navegación de documento
 * (`location.replace`) cuando hace falta. Si el destino es `/` no se
 * recarga: la ruta comodín `*` de `App.jsx` ya aterriza en `/`.
 *
 * Nota de seguridad: solo se aceptan rutas internas (empiezan por `/` y no
 * por `//`), de modo que un `sessionStorage` manipulado no pueda convertir
 * el retorno en una redirección a un dominio externo (open redirect).
 */
import { useEffect } from "react";
import useAuthSession from "./useAuthSession";

export const RETORNO_KEY = "retorno_pendiente";

function normalizarRuta(ruta) {
  if (typeof ruta !== "string") return "/";
  if (!ruta.startsWith("/") || ruta.startsWith("//")) return "/";
  return ruta;
}

/** Guarda el destino pendiente (sobrescribe cualquier valor anterior). */
export function guardarRetorno(ruta) {
  try {
    sessionStorage.setItem(RETORNO_KEY, normalizarRuta(ruta));
  } catch {
    // sessionStorage no disponible (modo privado estricto): se omite.
  }
}

/** Lee y BORRA el destino pendiente (null si no había ninguno). */
export function consumirRetorno() {
  try {
    const valor = sessionStorage.getItem(RETORNO_KEY);
    if (valor === null) return null;
    sessionStorage.removeItem(RETORNO_KEY);
    return normalizarRuta(valor);
  } catch {
    return null;
  }
}

/** Descarta el retorno sin consumirlo (p. ej. al cerrar sesión). */
export function olvidarRetorno() {
  try {
    sessionStorage.removeItem(RETORNO_KEY);
  } catch {
    // sin sessionStorage no hay nada que limpiar
  }
}

/**
 * Consume el retorno cuando ya hay sesión y los dos proveedores han
 * terminado de inicializar (`cargando` = inProgress MSAL / isLoading oidc).
 * Se monta dentro de `DualAuthProvider`, único punto con ambos contextos.
 */
export default function useRetorno() {
  const { isAuthenticated, cargando } = useAuthSession();

  useEffect(() => {
    if (cargando || !isAuthenticated) return;

    const destino = consumirRetorno();
    if (!destino) return;

    // Ya estamos en el destino y sin parámetros: nada que recargar.
    const actual = window.location.pathname;
    if (actual === destino && window.location.search === "") return;

    // "/" lo resuelve la ruta comodín del router (sin recargar el documento).
    if (destino === "/") return;

    window.location.replace(destino);
  }, [cargando, isAuthenticated]);
}
