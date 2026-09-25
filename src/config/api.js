/**
 * Punto único de configuración de la URL base del API Gateway.
 *
 * - La URL va HARDCODEADA aquí, a propósito: la SPA no lee variables de
 *   entorno (objeto de entorno de Vite) en ninguna parte. Así no hay
 *   configuración por entorno que pueda colarse en el bundle ni caducar
 *   entre build y despliegue.
 * - Al ser un SPA pública, esta URL es visible para cualquier visitante:
 *   es un endpoint público, NO un secreto. Nunca guardes aquí tokens,
 *   claves ni credenciales.
 * - Si cambia el host del API Gateway, hay que ampliar también
 *   `connect-src` en nginx.conf (la CSP bloquea el fetch a orígenes no
 *   listados).
 */
const URL_BASE = "https://ho5p58iyu7.execute-api.us-east-1.amazonaws.com";

/** URL base sin barra final: `https://xxxx.execute-api.us-east-1.amazonaws.com` */
export const API_BASE_URL = URL_BASE.replace(/\/+$/, "");

/** Une la URL base con la ruta de un recurso (`"/api/v1/..."`). */
export function apiUri(ruta) {
  return `${API_BASE_URL}${ruta}`;
}
