/**
 * Copy en español de la pantalla de acceso dual (Entra ID + Cognito).
 * Toda la redacción vive aquí para que LoginPage.jsx se mantenga < 150 líneas.
 * `icono` es un componente de lucide-react: se pinta con aria-hidden en la
 * píldora de la tarjeta (el nombre accesible lo aporta el propio texto).
 */
import { GraduationCap, ShoppingBag } from "lucide-react";

export const ID_SECCION = "login-opciones";

export const CABECERA = {
  titulo: "Inicia sesión",
  subtitulo:
    "Elige el tipo de acceso que necesitas. Si formas parte de la comunidad Calisat, entra con tu cuenta institucional; si eres cliente, usa tu cuenta pública.",
};

export const SECCION = {
  titulo: "Elige cómo quieres entrar",
};

export const PIE =
  "¿No sabes cuál elegir? Si tu centro te dio una cuenta de Microsoft, usa el acceso institucional. En caso contrario, usa el acceso público.";

export const OPCION_INSTITUCIONAL = {
  id: "institucional",
  etiqueta: "Estudiantes y equipo interno",
  icono: GraduationCap,
  titulo: "Acceso Institucional",
  audiencia:
    "Estudiantes, docentes y personal administrativo con cuenta de Microsoft de tu centro.",
  beneficios: [
    "Entras con tu cuenta de Microsoft (Entra ID): no tienes que crear nada nuevo.",
    "Acceso al panel de administración, inventario y envíos si tu rol lo permite.",
    "Tu perfil y tus permisos se sincronizan solos con la plataforma.",
  ],
  consecuencia:
    "Tu cuenta recibe un rol INSTITUCIONAL definido por tu centro: ADMINISTRADOR o LOGISTICA (dan acceso al panel) o CLIENTE (solo vitrina, carrito y perfil).",
  nota: "Te llevaremos a la página de Microsoft y volverás aquí automáticamente.",
};

export const OPCION_PUBLICO = {
  id: "publico",
  etiqueta: "Clientes externos",
  icono: ShoppingBag,
  titulo: "Acceso Público",
  audiencia:
    "Cualquier persona que consulta el catálogo o compra en Calisat, sin cuenta de Microsoft.",
  beneficios: [
    "Guarda tu carrito, tus direcciones y tu historial de compras.",
    "Sigue el estado de tus pedidos desde tu perfil.",
    "¿Todavía no tienes cuenta? Puedes crearla en el mismo paso.",
  ],
  consecuencia:
    "Tu cuenta nace siempre con el rol CLIENTE: ves catálogo, carrito, checkout y tu perfil. Nunca da acceso al panel de administración.",
  nota: "Usaremos tu correo o tu teléfono para identificarte.",
};

/** Etiquetas de acción, incluidas las alternas durante la carga. */
export const ACCIONES = {
  microsoft: "Continuar con Microsoft",
  entrar: "Iniciar sesión",
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
