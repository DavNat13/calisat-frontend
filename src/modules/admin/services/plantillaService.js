import useApiAdmin, { segmento } from "./apiAdmin";

/**
 * Servicio de plantillas de mensaje (ms-notificaciones).
 *
 * Endpoints:
 *   GET    /api/v1/plantillas         → List<PlantillaResponse> (JWT)
 *   GET    /api/v1/plantillas/{codigo}→ PlantillaResponse | 404
 *   POST   /api/v1/plantillas         → 201 · 400 · 409 (código repetido)
 *   PUT    /api/v1/plantillas/{codigo}→ 200 · 404 · 400 (sube `version`)
 *   DELETE /api/v1/plantillas/{codigo}→ 204 · 404 — baja LÓGICA (activa=false)
 *
 * Sin RBAC en el backend (usuarios autenticados); el panel las restringe a
 * ADMINISTRADOR. Los placeholders van entre `{{var}}`.
 */
const BASE = "/api/v1/plantillas";

const MENSAJES_LISTADO = {
  403: "No tienes permisos para consultar las plantillas.",
};

const MENSAJES_CREAR = {
  400: "Datos no válidos: revisa el código y los límites de cada campo.",
  409: "Ya existe una plantilla con ese código.",
};

const MENSAJES_ACTUALIZAR = {
  400: "Datos no válidos en la plantilla.",
  404: "No se encontró la plantilla indicada.",
};

const MENSAJES_ELIMINAR = {
  403: "No tienes permisos para dar de baja plantillas.",
  404: "No se encontró la plantilla indicada.",
};

export default function usePlantillaService() {
  const { obtener, enviar } = useApiAdmin();

  const listar = () => obtener(BASE, { mensajes: MENSAJES_LISTADO });

  const obtenerPorCodigo = (codigo) =>
    obtener(`${BASE}/${segmento(codigo)}`, {
      mensajes: MENSAJES_ACTUALIZAR,
      nullEn404: true,
    });

  const crear = (plantilla) =>
    enviar(BASE, { metodo: "POST", cuerpo: plantilla, mensajes: MENSAJES_CREAR });

  /** PUT parcial: solo los campos enviados se modifican. */
  const actualizar = (codigo, cambios) =>
    enviar(`${BASE}/${segmento(codigo)}`, {
      metodo: "PUT",
      cuerpo: cambios,
      mensajes: MENSAJES_ACTUALIZAR,
    });

  /** Baja lógica (el backend nunca borra físicamente). */
  const eliminar = (codigo) =>
    enviar(`${BASE}/${segmento(codigo)}`, {
      metodo: "DELETE",
      mensajes: MENSAJES_ELIMINAR,
    });

  return { listar, obtenerPorCodigo, crear, actualizar, eliminar };
}
