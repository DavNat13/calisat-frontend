import { SERVICIOS } from "../../../config/servicios";
/**
 * Constantes de la auditoría interna (eventos de usuario/orden/envío y
 * resultado del correo automatizado). Claves = valores EXACTOS de los enums
 * del backend (TipoAuditoria y ResultadoAuditoria).
 */
export const TIPOS_AUDITORIA = ["USUARIO", "ORDEN", ...(SERVICIOS.envios ? ["ENVIO"] : [])];

export const RESULTADOS_AUDITORIA = [
  "ENVIADO",
  "FALLIDO",
  "SIN_DESTINATARIO",
  "EVENTO_DESCONOCIDO",
];

/** Etiqueta visible de cada tipo (clave = enum TipoAuditoria). */
export const ETIQUETA_TIPO = {
  USUARIO: "Usuario",
  ORDEN: "Orden",
  ENVIO: "Envío",
};

/** Etiqueta visible de cada resultado (clave = enum ResultadoAuditoria). */
export const ETIQUETA_RESULTADO = {
  ENVIADO: "Enviado",
  FALLIDO: "Fallido",
  SIN_DESTINATARIO: "Sin destinatario",
  EVENTO_DESCONOCIDO: "Evento desconocido",
};

/** Tono del Badge por resultado (neutral / amarillo / éxito / peligro). */
export const TONO_RESULTADO = {
  ENVIADO: "exito",
  FALLIDO: "peligro",
  SIN_DESTINATARIO: "amarillo",
  EVENTO_DESCONOCIDO: "neutral",
};
