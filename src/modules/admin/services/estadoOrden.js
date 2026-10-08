/**
 * Máquina de estados de las órdenes — réplica EXACTa del backend.
 *
 * Fuente de verdad: `calisat-ms-orden/src/main/java/com/califorge/msorden/
 * service/OrdenService.java` (TRANSICIONES_PERMITIDAS, línea 61):
 *
 *   PENDIENTE     → { PAGADA, CANCELADA, FALLO_PAGO }
 *   PAGADA        → { EN_PREPARACION, CANCELADA }
 *   EN_PREPARACION→ { ENVIADA }
 *   ENVIADA       → { ENTREGADA }
 *   CANCELADA     → {}  (terminal)
 *   FALLO_PAGO    → {}  (terminal)
 *   ENTREGADA     → {}  (terminal)
 *
 * La UI ofrece SOLO los destinos válidos del estado actual: si se replica
 * mal este mapa, el backend responde HTTP 409.
 */
export const TRANSICIONES_ORDEN = {
  PENDIENTE: ["PAGADA", "CANCELADA", "FALLO_PAGO"],
  PAGADA: ["EN_PREPARACION", "CANCELADA"],
  EN_PREPARACION: ["ENVIADA"],
  ENVIADA: ["ENTREGADA"],
  CANCELADA: [],
  FALLO_PAGO: [],
  ENTREGADA: [],
};

/** Etiquetas legibles de cada estado del panel. */
export const ETIQUETA_ORDEN = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  EN_PREPARACION: "En preparación",
  ENVIADA: "Enviada",
  ENTREGADA: "Entregada",
  CANCELADA: "Cancelada",
  FALLO_PAGO: "Fallo de pago",
};

/** Tono del Badge: SOLO los tonos que soporta el kit (Badge.jsx). */
export const TONO_ORDEN = {
  PENDIENTE: "amarillo",
  PAGADA: "exito",
  EN_PREPARACION: "neutral",
  ENVIADA: "amarillo",
  ENTREGADA: "exito",
  CANCELADA: "neutral",
  FALLO_PAGO: "peligro",
};

/** Destinos permitidos desde un estado (vacío = estado terminal). */
export const destinosDe = (estado) =>
  TRANSICIONES_ORDEN[String(estado ?? "").toUpperCase()] ?? [];

/** true si el estado no admite ninguna transición (terminal). */
export const esTerminal = (estado) => destinosDe(estado).length === 0;
