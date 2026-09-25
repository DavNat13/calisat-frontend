import useApiAdmin, { segmento } from "./apiAdmin";

/**
 * Servicio del microservicio de envíos (ms-envios).
 *
 * Endpoints:
 *   GET  /api/v1/envios                     → List<EnvioResponse> (ADMIN|LOG
 *        reciben el listado global; con ?ordenId= filtra por orden)
 *   POST /api/v1/envios                     → 201 · 409 (orden ya con envío) · 400
 *   PUT  /api/v1/envios/{id}/estado         → 200 · 404 · 409 (transición) · 400
 *   GET  /api/v1/envios/seguimiento/{guia}  → {numeroGuia, estado, eventos[]}
 *        PÚBLICO (SecurityConfig → permitAll): se pide SIN token.
 *
 * Escrituras con Bearer (ADMINISTRADOR | LOGISTICA).
 */
const BASE = "/api/v1/envios";

const MENSAJES_LISTADO = {
  404: "No se encontraron envíos con esos criterios.",
};

const MENSAJES_CREAR = {
  400: "Datos del envío no válidos: revisa el UUID de la orden y la dirección de entrega.",
  409: "Esa orden ya tiene un envío asociado.",
};

/**
 * 409 → prefijo propio + mensaje de negocio del backend (ver
 * `conflictoConDetalle` en apiAdmin.js): la UI exige mostrar el detalle de
 * la transición rechazada.
 */
const MENSAJES_ESTADO = {
  400: "Datos no válidos para el cambio de estado.",
  404: "No se encontró el envío indicado.",
  409: "Transición no permitida",
};

const MENSAJES_SEGUIMIENTO = {
  404: "No se encontró ningún envío con ese número de guía.",
};

export default function useEnvioService() {
  const { obtener, enviar } = useApiAdmin();

  /** Listado global del panel. */
  const listar = () => obtener(BASE, { mensajes: MENSAJES_LISTADO });

  /** Listado filtrado por orden (?ordenId=uuid). */
  const listarPorOrden = (ordenId) =>
    obtener(`${BASE}?ordenId=${segmento(ordenId)}`, { mensajes: MENSAJES_LISTADO });

  const crear = (datos) =>
    enviar(BASE, { metodo: "POST", cuerpo: datos, mensajes: MENSAJES_CREAR });

  const cambiarEstado = (id, datos) =>
    enviar(`${BASE}/${segmento(id)}/estado`, {
      metodo: "PUT",
      cuerpo: datos,
      mensajes: MENSAJES_ESTADO,
      conflictoConDetalle: true,
    });

  /** Historial público por número de guía (sin Authorization). */
  const seguimiento = (numeroGuia) =>
    obtener(`${BASE}/seguimiento/${segmento(numeroGuia)}`, {
      conToken: false,
      mensajes: MENSAJES_SEGUIMIENTO,
    });

  return { listar, listarPorOrden, crear, cambiarEstado, seguimiento };
}
