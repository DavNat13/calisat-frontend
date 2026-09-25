/**
 * Mueve el foco al contenedor principal (#contenido).
 *
 * Se usa al navegar desde menús que se desmontan (menú móvil de la navbar,
 * desplegable de usuario): si no, el foco queda perdido en <body> tras el
 * cambio de ruta y el siguiente Tab vuelve a empezar por la cabecera.
 * El <main id="contenido"> lleva tabindex="-1" para poder recibirlo.
 */
export default function enfocarContenido() {
  const contenido = document.getElementById("contenido");
  if (contenido && typeof contenido.focus === "function") contenido.focus();
}
