/**
 * Copy en español de la pantalla de acceso dual (Entra ID + Cognito).
 * Toda la redacción vive aquí para que LoginPage.jsx se mantenga < 150 líneas.
 * Los logotipos NO se declaran aquí: los pasa LoginPage desde LoginLogos.jsx.
 */

/** Etiqueta accesible de la sección (no lleva <h2> visible: la página ya
 *  tiene un único h1 y los títulos de las tarjetas son h2). */
export const SECCION = { etiqueta: "Opciones de acceso" };

export const CABECERA = {
  titulo: "Inicia sesión",
  subtitulo: "Elige con qué cuenta quieres entrar.",
};

export const OPCION_INSTITUCIONAL = {
  id: "institucional",
  titulo: "Iniciar sesión con Microsoft Azure",
  descripcion: "Cuenta de tu centro: estudiantes y equipo interno.",
};

export const OPCION_PUBLICO = {
  id: "publico",
  titulo: "Iniciar sesión con AWS Cognito",
  descripcion: "Correo o teléfono personal, para clientes externos.",
};

export const PIE =
  "Si tu centro te dio una cuenta de Microsoft, usa la primera opción; " +
  "si eres cliente, usa la segunda.";

/** Etiquetas de acción, incluidas las alternas durante la carga. */
export const ACCIONES = {
  continuar: "Continuar",
  registrar: "Crear una cuenta",
  cerrarSesion: "Cerrar sesión",
  redirigiendo: "Redirigiendo…",
  abriendoRegistro: "Abriendo registro…",
  cerrandoSesion: "Cerrando…",
};

export function textoSesion(proveedor, identificador) {
  const plataforma = proveedor === "azure" ? "Microsoft" : "AWS Cognito";
  return `Sesión activa como ${identificador} (${plataforma}).`;
}
