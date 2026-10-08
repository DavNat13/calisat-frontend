import { API_BASE_URL } from "../../../config/api";
import { registrarFallo } from "../../../utils/errores";
import useTokenSesion from "../../../auth/tokenSesion";

const BASE = "/api/v1/ordenes";

/** Copias propias en español por status (nunca el cuerpo crudo del server). */
const MENSAJES = {
  400: "El pedido no es válido: revisa los productos e inténtalo de nuevo.",
  401: "Tu sesión expiró; vuelve a iniciar sesión para confirmar el pedido.",
  403: "No tienes permiso para realizar esta operación.",
  404: "No encontramos ese pedido.",
  409: "Ese pedido ya no admite ese cambio de estado.",
};

const errorDe = (status, mensaje) =>
  new Error(mensaje ?? MENSAJES[status] ?? "No pudimos completar la operación.");

/**
 * Órdenes de compra contra `ms-orden` (vía API Gateway), siempre con el
 * Bearer de la sesión activa.
 *
 *   POST  /api/v1/ordenes              → crear (Idempotency-Key)
 *   GET   /api/v1/ordenes              → mis pedidos (paginado)
 *   GET   /api/v1/ordenes/todas        → listado global (solo ADMINISTRADOR)
 *   GET   /api/v1/ordenes/{id}         → detalle
 *   PUT   /api/v1/ordenes/{id}/estado  → transición de estado
 *   POST  /api/v1/ordenes/{id}/cancelar → cancelar (dueño o admin)
 */
export default function useOrdenService() {
  const tokenSesion = useTokenSesion();

  const llamada = async (ruta, { metodo = "GET", cuerpo, clave } = {}) => {
    const token = await tokenSesion();
    if (!token) throw errorDe(401);

    const headers = { "Content-Type": "application/json" };
    headers.Authorization = `Bearer ${token}`;
    if (clave) headers["Idempotency-Key"] = clave;

    let res;
    try {
      res = await fetch(`${API_BASE_URL}${ruta}`, {
        method: metodo,
        headers,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
    } catch (detalle) {
      registrarFallo("ordenService/red", detalle);
      throw errorDe(0, "No hay conexión con el servidor; revisa tu red.");
    }
    if (!res.ok) {
      registrarFallo(`ordenService/${metodo}`, `HTTP ${res.status}`);
      throw errorDe(res.status);
    }
    return res.json().catch(() => null);
  };

  const pagina = (ruta) =>
    llamada(ruta).then((datos) => datos?.content ?? []);

  return {
    /** Crea el pedido a partir de las líneas del carrito. */
    crear: (items, { clave, direccion, costoEnvio } = {}) =>
      llamada(BASE, {
        metodo: "POST",
        clave,
        cuerpo: {
          items: items.map((item) => ({
            sku: item.sku,
            nombreProducto: item.nombre ?? "",
            cantidad: item.cantidad,
            precioUnitario: Number(item.precio),
          })),
          ...(direccion ?? {}),
          costoEnvio: Number(costoEnvio) || 0,
        },
      }),
    misPedidos: () => pagina(BASE),
    todas: () => pagina(`${BASE}/todas`),
    detalle: (id) => llamada(`${BASE}/${encodeURIComponent(id)}`),
    cancelar: (id) => llamada(`${BASE}/${encodeURIComponent(id)}/cancelar`, { metodo: "POST" }),
    cambiarEstado: (id, estado) =>
      llamada(`${BASE}/${encodeURIComponent(id)}/estado`, {
        metodo: "PUT",
        cuerpo: { estado },
      }),
  };
}
