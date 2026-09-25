/**
 * Manejo de errores de la capa de datos.
 *
 * Regla de oro: el DETALLE real (status HTTP, body del servidor, stack)
 * se manda a la consola del navegador para que el desarrollador pueda
 * depurar; en la UI solo se muestran copias propias en español.
 *
 * Motivo: los mensajes del backend pueden filtrar información interna
 * (rutas, esquemas de base de datos, trazas, URLs de infraestructura).
 *
 * Uso:
 *   throw errorDeUsuario("Se requiere rol administrador");   // visible en UI
 *   throw new Error(datosDelServidor);                       // SOLO consola
 *   setError(mensajeParaUsuario(err, "No se pudo guardar..."));
 */

/** Copy genérico para cuando una operación falla sin mensaje propio. */
export const MENSAJE_OPERACION_FALLIDA =
  "No se pudo completar la operación. Intenta de nuevo.";

/**
 * Crea un error cuyo mensaje SÍ puede mostrarse en la UI.
 * Úsalo únicamente con copias escritas por el equipo, nunca con texto
 * proveniente del servidor.
 */
export function errorDeUsuario(mensaje) {
  const error = new Error(mensaje);
  error.mensajeVisible = true;
  return error;
}

/** true si el mensaje del error es seguro para mostrar al usuario. */
export function mensajeVisible(error) {
  return Boolean(error) && error.mensajeVisible === true;
}

/**
 * Mensaje seguro para la UI: el propio del error si está marcado como
 * visible; si no, el genérico (o el respaldo indicado).
 */
export function mensajeParaUsuario(error, respaldo = MENSAJE_OPERACION_FALLIDA) {
  return mensajeVisible(error) ? error.message : respaldo;
}

/**
 * Registra el detalle real de un fallo en consola (solo visible para
 * quien abre DevTools; nunca llega al DOM).
 */
export function registrarFallo(contexto, detalle) {
  console.error(`[${contexto}]`, detalle);
}
