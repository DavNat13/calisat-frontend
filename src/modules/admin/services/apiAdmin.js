import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";
import {
  MENSAJE_OPERACION_FALLIDA,
  errorDeUsuario,
  registrarFallo,
} from "../../../utils/errores";

/**
 * Cliente HTTP compartido de las secciones nuevas del panel (Fase 3).
 *
 * Centraliza en UN solo sitio el patrón que ya usan `adminService.js` y
 * `catalogoService.js`:
 * - Token SIEMPRE de la cuenta ACTIVA (`getActiveAccount`, con fallback a
 *   `accounts[0]`) vía `acquireTokenSilent` + `apiRequest`.
 * - El detalle real (status, cuerpo) se manda a la consola con
 *   `registrarFallo`; en la UI SOLO salen copias propias en español
 *   construidas con `errorDeUsuario` (ver src/utils/errores.js).
 *
 * Cada consumidor pasa su propio mapa `mensajes` (status → copy) para que
 * el texto de la UI sea específico de la operación sin filtrar el cuerpo
 * crudo del servidor.
 */

/** Segmento de path codificado de forma segura (SKU, número de guía…). */
export const segmento = (valor) => encodeURIComponent(String(valor ?? "").trim());

/** true si la cadena es un UUID (8-4-4-4-12 en hex), p. ej. un ordenId. */
export const esUuid = (valor) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(valor ?? "").trim()
  );

/** Espacios colapsados + recorte: evita saltos de línea o textos largos. */
const sanear = (texto) =>
  String(texto ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

/** Campo `mensaje` del cuerpo de error del backend (null si no lo hay). */
const detalleDe = (cuerpo) => {
  try {
    const datos = JSON.parse(cuerpo);
    return typeof datos?.mensaje === "string" ? datos.mensaje : "";
  } catch {
    return "";
  }
};

/**
 * Traduce una respuesta fallida a un error con mensaje visible.
 *
 * - `mensajes`: mapa status → copia propia en español.
 * - `conflictoConDetalle`: solo en 409, añade el mensaje de negocio que
 *   devuelva el backend DESPUÉS de nuestro propio prefijo (p. ej.
 *   "Transición no permitida: ENTREGADO → CREADO"). Es texto de dominio
 *   escrito por el equipo, saneado y recortado; cualquier otro fallo sigue
 *   mostrando únicamente copias propias.
 */
const lanzarFallo = async (
  res,
  contexto,
  ruta,
  { mensajes = {}, conflictoConDetalle = false } = {}
) => {
  const cuerpo = await res.text().catch(() => "");
  registrarFallo(
    contexto,
    `${ruta} → HTTP ${res.status} ${res.statusText} — ${cuerpo.slice(0, 500)}`
  );

  if (res.status === 401) {
    throw errorDeUsuario("Tu sesión expiró. Cierra sesión y vuelve a entrar.");
  }
  if (res.status === 403) {
    throw errorDeUsuario("No tienes permisos para realizar esta acción.");
  }

  const propio = mensajes[res.status];
  if (res.status === 409 && conflictoConDetalle) {
    const detalle = sanear(detalleDe(cuerpo));
    throw errorDeUsuario(
      `${propio ?? "Operación no permitida"}${detalle ? `: ${detalle}` : "."}`
    );
  }
  throw errorDeUsuario(propio ?? MENSAJE_OPERACION_FALLIDA);
};

export default function useApiAdmin() {
  const { instance, accounts } = useMsal();

  /** Token de la cuenta ACTIVA (misma regla que adminService/catalogoService). */
  const getToken = async () => {
    const cuenta = instance.getActiveAccount() ?? accounts[0];
    const response = await instance.acquireTokenSilent({
      ...apiRequest,
      account: cuenta,
    });
    return response.accessToken;
  };

  /**
   * GET JSON.
   * - `conToken: false` para endpoints públicos (seguimiento de guías).
   * - `nullEn404: true` para búsquedas exactas: el "no existe" se comunica
   *   con una lista vacía, no como error.
   */
  const obtener = async (
    ruta,
    { conToken = true, mensajes = {}, nullEn404 = false } = {}
  ) => {
    const headers = conToken ? { Authorization: `Bearer ${await getToken()}` } : {};
    const res = await fetch(`${API_BASE_URL}${ruta}`, { headers });
    if (res.status === 404 && nullEn404) return null;
    if (!res.ok) {
      await lanzarFallo(res, "apiAdmin/obtener", ruta, { mensajes });
    }
    // Cuerpo vacío / 204 → null (nunca rompe el .json()).
    return res.json().catch(() => null);
  };

  /** Petición con cuerpo JSON (POST/PUT/DELETE). Devuelve null en 204. */
  const enviar = async (
    ruta,
    {
      metodo = "POST",
      cuerpo,
      conToken = true,
      mensajes = {},
      conflictoConDetalle = false,
    } = {}
  ) => {
    const headers = { "Content-Type": "application/json" };
    if (conToken) headers.Authorization = `Bearer ${await getToken()}`;

    const res = await fetch(`${API_BASE_URL}${ruta}`, {
      method: metodo,
      headers,
      body:
        cuerpo === undefined || cuerpo === null ? undefined : JSON.stringify(cuerpo),
    });
    if (!res.ok) {
      await lanzarFallo(res, "apiAdmin/enviar", ruta, {
        mensajes,
        conflictoConDetalle,
      });
    }
    return res.json().catch(() => null);
  };

  return { obtener, enviar };
}
