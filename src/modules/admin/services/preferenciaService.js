import useApiAdmin from "./apiAdmin";

/**
 * Servicio de preferencias de notificación (ms-notificaciones).
 *
 * Endpoints (siempre del USUARIO AUTENTICADO, no hay listado global):
 *   GET /api/v1/preferencias → { preferencias: [{id, tipoCampana, canal,
 *                               optIn, tokenDesuscripcion}] }
 *   PUT /api/v1/preferencias → 200 · 400 — upsert por
 *        (tipoCampana, canal): crea si no existe y guarda `optIn`.
 *
 * `optIn` nace en false (consentimiento previo); ponerlo en true registra
 * el consentimiento explícito. No se puede borrar una suscripción, solo
 * dejarla en optIn=false.
 */
const BASE = "/api/v1/preferencias";

const MENSAJES_OBTENER = {
  401: "Tu sesión expiró. Cierra sesión y vuelve a entrar.",
  403: "No tienes permisos para consultar preferencias.",
};

const MENSAJES_GUARDAR = {
 400: "Datos no válidos: elige un tipo de campaña y un canal soportados.",
 403: "No tienes permisos para guardar preferencias.",
};

/** Canales que expone el enum `Canal` del microservicio. */
export const CANALES = ["EMAIL", "SMS", "PUSH", "IN_APP"];

/** Etiquetas legibles de cada canal. */
export const ETIQUETA_CANAL = {
  EMAIL: "Correo electrónico",
  SMS: "SMS",
  PUSH: "Notificación push",
  IN_APP: "Dentro de la aplicación",
};

/** Tipos de campaña que el panel ofrece de serie (el backend acepta cualquiera). */
export const TIPOS_CAMPANA = ["NOVEDADES", "PROMOCIONES", "PRODUCTOS", "NEWSLETTER"];

export default function usePreferenciaService() {
  const { obtener, enviar } = useApiAdmin();

  const obtenerPropias = () =>
    obtener(BASE, { mensajes: MENSAJES_OBTENER });

  /**
   * Guarda una preferencia (upsert en el backend). `preferencias` es la
   * lista COMPLETA que se desea registrar, no un diff.
   */
  const guardar = (preferencias) =>
    enviar(BASE, { metodo: "PUT", cuerpo: { preferencias }, mensajes: MENSAJES_GUARDAR });

  return { obtenerPropias, guardar };
}

/** Clave estable de una fila para poder identificarla en la tabla. */
export const clavePreferencia = (item) =>
  `${item?.tipoCampana ?? ""}|${item?.canal ?? ""}`;
