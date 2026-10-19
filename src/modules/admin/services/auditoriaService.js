import useApiAdmin, { segmento } from "./apiAdmin";

/**
 * Servicio del historial de auditoría interna (auditoria.queue →
 * auditoria_evento) del microservicio de notificaciones.
 *
 * Endpoint (solo ROLE_ADMINISTRADOR en el backend):
 *   GET /api/v1/auditoria?page=&size=&tipo=&resultado= → Page<AuditoriaResponse>
 *
 * Los parámetros `tipo` y `resultado` se resuelven con `valueOf` en el
 * backend: hay que enviar los valores EXACTOS de los enums (USUARIO, no
 * Usuario; SIN_DESTINATARIO, no Sin destinatario).
 */
const BASE = "/api/v1/auditoria";

const MENSAJES_LISTADO = {
  400: "Filtro de auditoría no válido para el listado.",
  403: "No tienes permisos para consultar la auditoría.",
};

/** Tamaño de página del listado del panel. */
export const TAMANO_PAGINA_AUDITORIA = 20;

export default function useAuditoriaService() {
  const { obtener } = useApiAdmin();

  /** `tipo`/`resultado` vacíos = sin filtro (parámetros opcionales). */
  const listar = (
    pagina = 0,
    tamano = TAMANO_PAGINA_AUDITORIA,
    tipo = "",
    resultado = ""
  ) => {
    const filtros = `${tipo ? `&tipo=${segmento(tipo)}` : ""}${
      resultado ? `&resultado=${segmento(resultado)}` : ""
    }`;
    return obtener(`${BASE}?page=${pagina}&size=${tamano}${filtros}`, {
      mensajes: MENSAJES_LISTADO,
    });
  };

  return { listar };
}
