import useApiAdmin, { segmento } from "./apiAdmin";

/**
 * Servicio del microservicio de notificaciones (ms-notificaciones).
 *
 * Endpoints (todos con Bearer; sin RBAC en el backend, pero la ruta del
 * panel está restringida a ADMINISTRADOR en el frontend):
 *   GET  /api/v1/notificaciones?estado=&page=&size= → Page<NotificacionResponse>
 *   GET  /api/v1/notificaciones/{id}                → detalle + intentosEnvio[]
 *   POST /api/v1/notificaciones/{id}/reintentar     → 200 · 409 (estado no permite)
 *   POST /api/v1/notificaciones/enviar              → 201 NotificacionResponse
 *
 * El parámetro `estado` se resuelve con `valueOf` en el backend: hay que
 * enviar los valores EXACTOS del enum (FALLIDO, no FALLIDA).
 */
const BASE = "/api/v1/notificaciones";

const MENSAJES_LISTADO = {
  400: "Filtro de estado no válido para el listado de notificaciones.",
};

const MENSAJES_DETALLE = {
  404: "No se encontró la notificación indicada.",
};

const MENSAJES_REINTENTO = {
  400: "No se pudo solicitar el reintento de la notificación.",
  404: "No se encontró la notificación indicada.",
  409: "El estado actual no permite reintentar: solo FALLIDO, REINTENTO o CANCELADO.",
};

const MENSAJES_ENVIO = {
  400: "No se pudo enviar el correo: revisa el asunto, el cuerpo y el email.",
  401: "Tu sesión expiró: vuelve a iniciar sesión para enviar el correo.",
};

/** Tamaño de página del listado del panel. */
export const TAMANO_PAGINA_NOTIFICACIONES = 20;

export default function useNotificacionService() {
  const { obtener, enviar } = useApiAdmin();

  /** `estado` vacío = todos los estados (parámetro opcional). */
  const listar = (pagina = 0, tamano = TAMANO_PAGINA_NOTIFICACIONES, estado = "") => {
    const filtro = estado ? `&estado=${segmento(estado)}` : "";
    return obtener(`${BASE}?page=${pagina}&size=${tamano}${filtro}`, {
      mensajes: MENSAJES_LISTADO,
    });
  };

  const detalle = (id) =>
    obtener(`${BASE}/${segmento(id)}`, { mensajes: MENSAJES_DETALLE });

  const reintentar = (id) =>
    enviar(`${BASE}/${segmento(id)}/reintentar`, {
      metodo: "POST",
      mensajes: MENSAJES_REINTENTO,
    });

  /**
   * Envío manual desde el panel admin → 201 con la notificación creada.
   * `destinatarioEmail` vacío = el backend resuelve el sub autenticado.
   */
  const enviarManual = ({ canal, asunto, cuerpoTexto, destinatarioEmail }) =>
    enviar(`${BASE}/enviar`, {
      metodo: "POST",
      cuerpo: {
        canal: canal || "EMAIL",
        asunto,
        cuerpoTexto,
        destinatarioEmail: destinatarioEmail || null,
      },
      mensajes: MENSAJES_ENVIO,
    });

  return { listar, detalle, reintentar, enviarManual };
}
