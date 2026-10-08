import { API_BASE_URL } from "../../../config/api";
import { registrarFallo } from "../../../utils/errores";
import useTokenSesion from "../../../auth/tokenSesion";

const BASE = "/api/v1/carrito";

/** Copias propias en español por status (jamás se muestra el cuerpo crudo). */
const MENSAJES = {
  400: "Datos de carrito no válidos.",
  404: "Ese producto ya no está en tu carrito.",
  409: "El carrito cambió; vuelve a intentarlo.",
};

/**
 * Carrito de compras contra `ms-carrito` (vía API Gateway).
 *
 *   GET    /api/v1/carrito               → carrito propio (sub del JWT)
 *   POST   /api/v1/carrito/items         → alta/upsert por SKU
 *   PUT    /api/v1/carrito/items/{sku}   → reemplaza la cantidad
 *   DELETE /api/v1/carrito/items/{sku}   → borra un item
 *   DELETE /api/v1/carrito               → vacía (idempotente)
 *
 * Siempre con el Bearer de la sesión activa. Ante 401/403 no se lanza:
 * se devuelve `{ sinSesion: true }` para que el carrito continúe contra
 * localStorage (modo anónimo) en lugar de romper la UI.
 */
export default function useCarritoService() {
  const tokenSesion = useTokenSesion();

  const llamada = async (ruta, { metodo = "GET", cuerpo } = {}) => {
    const token = await tokenSesion();
    if (!token) return { ok: false, sinSesion: true, datos: null };

    const headers = { "Content-Type": "application/json" };
    headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${API_BASE_URL}${ruta}`, {
        method: metodo,
        headers,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
    } catch (detalle) {
      registrarFallo("carritoService/red", detalle);
      return { ok: false, sinRed: true, datos: null };
    }

    if (res.status === 401 || res.status === 403) {
      return { ok: false, sinSesion: true, datos: null };
    }
    if (!res.ok) {
      registrarFallo(`carritoService/${metodo}`, `HTTP ${res.status}`);
      throw new Error(MENSAJES[res.status] ?? "No pudimos actualizar tu carrito.");
    }
    return { ok: true, datos: await res.json().catch(() => null) };
  };

  return {
    /** Carrito remoto, o null si no hay sesión aceptada. */
    obtener: async () => (await llamada(BASE)).datos,
    agregarItem: (sku, cantidad) =>
      llamada(`${BASE}/items`, { metodo: "POST", cuerpo: { sku, cantidad } }),
    actualizarItem: (sku, cantidad) =>
      llamada(`${BASE}/items/${encodeURIComponent(sku)}`, {
        metodo: "PUT",
        cuerpo: { cantidad },
      }),
    quitarItem: (sku) =>
      llamada(`${BASE}/items/${encodeURIComponent(sku)}`, { metodo: "DELETE" }),
    vaciar: () => llamada(BASE, { metodo: "DELETE" }),
  };
}
