import useApiAdmin from "./apiAdmin";

/**
 * Servicio del directorio de destinatarios (ms-notificaciones).
 *
 * Endpoints:
 *   GET  /api/v1/destinatarios → List<DestinatarioResponse> (JWT, sin roles)
 *   POST /api/v1/destinatarios → 201 · 400 — alta o actualización (upsert
 *        por azureSub: es la tabla que resuelven los listeners de orden y
 *        de envío para saber a quién enviar el correo)
 *
 * Sin DELETE en el backend: la baja se hace reenviando el registro con
 * `activo: false`.
 */
const BASE = "/api/v1/destinatarios";

const MENSAJES_LISTADO = {
  403: "No tienes permisos para consultar el directorio de destinatarios.",
};

const MENSAJES_ALTA = {
  400: "Datos no válidos: revisa el azureSub y el correo electrónico.",
  403: "No tienes permisos para dar de alta destinatarios.",
};

/** Solo los campos que acepta `DestinatarioAltaRequest`. */
const aPayload = ({ azureSub, email, nombre, rol, activo }) => ({
  azureSub,
  email,
  nombre,
  rol,
  activo,
});

export default function useDestinatarioService() {
  const { obtener, enviar } = useApiAdmin();

  const listar = () => obtener(BASE, { mensajes: MENSAJES_LISTADO });

  /** Alta o actualización por azureSub (idempotente). */
  const guardar = (datos) =>
    enviar(BASE, { metodo: "POST", cuerpo: aPayload(datos), mensajes: MENSAJES_ALTA });

  /** Baja lógica: mismo azureSub con `activo: false`. */
  const darDeBaja = (destinatario) => guardar({ ...destinatario, activo: false });

  return { listar, guardar, darDeBaja };
}

/**
 * Búsqueda en cliente (el endpoint no admite query de filtrado): email,
 * nombre o rol que contengan el término, sin distinguir mayúsculas.
 */
export const filtrarDestinatarios = (lista, consulta) => {
  const termino = String(consulta ?? "").trim().toLowerCase();
  if (!termino) return lista;
  return lista.filter((destinatario) =>
    [destinatario.email, destinatario.nombre, destinatario.rol]
      .filter(Boolean)
      .some((valor) => String(valor).toLowerCase().includes(termino))
  );
};
