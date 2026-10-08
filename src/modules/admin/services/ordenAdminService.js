import useApiAdmin, { segmento } from "./apiAdmin";

/**
 * Servicio de administración de órdenes (ms-orden).
 *
 * Endpoints:
 *   GET    /api/v1/ordenes/todas?page&size   → Page<OrdenResponse> (ADMIN
 *          comprueba el rol en el controlador; 403 si no lo trae)
 *   PUT    /api/v1/ordenes/{id}/estado       → 200 · 404 · 409 (transición) · 400
 *   POST   /api/v1/ordenes/{id}/cancelar     → 200 · 404 · 409 (estado final)
 *
 * Todas con Bearer del panel (rol ADMINISTRADOR).
 */
const BASE = "/api/v1/ordenes";

const MENSAJES_LISTADO = {
  403: "Solo un administrador puede ver el listado global de órdenes.",
  404: "No se encontraron órdenes.",
};

const MENSAJES_ESTADO = {
  400: "Estado no válido para la orden.",
  403: "Solo un administrador puede cambiar el estado de una orden.",
  404: "No se encontró la orden indicada.",
  409: "Transición no permitida",
};

const MENSAJES_CANCELAR = {
  403: "Solo un administrador puede cancelar una orden ajena.",
  404: "No se encontró la orden indicada.",
  409: "La orden ya está en un estado final",
};

export default function useOrdenAdminService() {
  const { obtener, enviar } = useApiAdmin();

  /** Listado global paginado (más reciente primero). */
  const listarTodas = (pagina = 0, tamano = 20) =>
    obtener(`${BASE}/todas?page=${pagina}&size=${tamano}`, {
      mensajes: MENSAJES_LISTADO,
    });

  /** Transición de estado (solo destinos válidos, ver `estadoOrden.js`). */
  const cambiarEstado = (id, estado) =>
    enviar(`${BASE}/${segmento(id)}/estado`, {
      metodo: "PUT",
      cuerpo: { estado },
      mensajes: MENSAJES_ESTADO,
      conflictoConDetalle: true,
    });

  const cancelar = (id) =>
    enviar(`${BASE}/${segmento(id)}/cancelar`, {
      metodo: "POST",
      mensajes: MENSAJES_CANCELAR,
      conflictoConDetalle: true,
    });

  return { listarTodas, cambiarEstado, cancelar };
}
