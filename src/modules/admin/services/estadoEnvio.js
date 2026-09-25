/**
 * Máquina de estados de los envíos — réplica EXACTa del backend.
 *
 * Fuente de verdad: `calisat-ms-envios/src/main/java/com/calisat/msenvios/
 * model/EstadoEnvio.java` (mapa TRANSICIONES, líneas 25-32):
 *
 *   CREADO        → { EN_PREPARACION, FALLIDO, DEVUELTO }
 *   EN_PREPARACION→ { DESPACHADO, FALLIDO, DEVUELTO }
 *   DESPACHADO    → { EN_TRANSITO, FALLIDO, DEVUELTO }
 *   EN_TRANSITO   → { ENTREGADO, FALLIDO, DEVUELTO }
 *   FALLIDO       → { DEVUELTO }
 *   ENTREGADO     → {}   (terminal)
 *   DEVUELTO      → {}   (terminal)
 *
 * La UI ofrece SOLO los destinos válidos del estado actual: si se replica
 * mal este mapa, el backend rechaza la petición con HTTP 409.
 */
export const TRANSICIONES_ENVIO = {
  CREADO: ["EN_PREPARACION", "FALLIDO", "DEVUELTO"],
  EN_PREPARACION: ["DESPACHADO", "FALLIDO", "DEVUELTO"],
  DESPACHADO: ["EN_TRANSITO", "FALLIDO", "DEVUELTO"],
  EN_TRANSITO: ["ENTREGADO", "FALLIDO", "DEVUELTO"],
  FALLIDO: ["DEVUELTO"],
  ENTREGADO: [],
  DEVUELTO: [],
};

/** Destinos permitidos desde un estado (vacío = estado terminal). */
export const destinosDe = (estado) =>
  TRANSICIONES_ENVIO[String(estado ?? "").toUpperCase()] ?? [];

/** true si el estado no admite ninguna transición (ENTREGADO / DEVUELTO). */
export const esTerminal = (estado) => destinosDe(estado).length === 0;
