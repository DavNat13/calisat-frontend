/**
 * Estados de una notificación — réplica del backend.
 *
 * Fuente de verdad: `calisat-ms-notificaciones/src/main/java/com/califorge/
 * msnotificaciones/model/EstadoNotificacion.java`:
 *
 *   PENDIENTE → ENVIANDO → ENVIADO / REINTENTO (backoff, máx. 5) / FALLIDO
 *   CANCELADO y OMITIDO son estados terminales de baja.
 *
 * `reintentar` (POST /{id}/reintentar) solo acepta FALLIDO, REINTENTO y
 * CANCELADO (NotificacionService.reintentar, líneas 174-179): con cualquier
 * otro estado el backend responde HTTP 409.
 */
export const ESTADOS_NOTIFICACION = [
  "PENDIENTE",
  "ENVIANDO",
  "ENVIADO",
  "REINTENTO",
  "FALLIDO",
  "CANCELADO",
  "OMITIDO",
];

/** Estados desde los cuales la acción "Reintentar" está habilitada. */
export const ESTADOS_REINTENTABLES = ["FALLIDO", "REINTENTO", "CANCELADO"];

/** true si el backend aceptaría un reintento para ese estado. */
export const esReintentable = (estado) =>
  ESTADOS_REINTENTABLES.includes(String(estado ?? "").toUpperCase());
