/**
 * Coordinación de callbacks OAuth entre los DOS proveedores de la app.
 *
 * Microsoft Entra ID (MSAL) y AWS Cognito (oidc-client-ts) regresan por
 * redirect a la MISMA página con `?code=...&state=...` en el query string.
 * Si los dos intentaran canjear ese código, uno se apropiaría del del otro
 * y el login fallaría (o peor: se mezclarían identidades).
 *
 * Por eso, antes de disparar CUALQUIER redirect, `useLoginActions` marca en
 * `sessionStorage` quién lo pidió (`PENDING_AUTH_PROVIDER_KEY`) y aquí solo
 * ese proveedor procesa la respuesta. `sessionStorage` es por pestaña, así
 * que el marcador viaja con la navegación y desaparece al cerrar la pestaña.
 */
import {
  AUTH_PROVIDER_COGNITO,
  PENDING_AUTH_PROVIDER_KEY,
} from "../config/cognitoConfig";

/** Parámetros que deja el flujo OAuth en la barra de direcciones. */
const PARAMS_CALLBACK = [
  "code",
  "state",
  "session_state",
  "error",
  "error_description",
  "error_uri",
];

/** Clave con el último fallo de canje, para enseñarlo en /login. */
const AUTH_ERROR_KEY = "auth_callback_error";

/**
 * Guarda un mensaje de error de callback para que `/login` lo muestre cuando
 * el usuario vuelva a entrar (el fallo ocurre al cargar la SPA, donde aún no
 * hay ninguna ruta de login montada). Solo texto propio, nunca tokens.
 */
export function marcarErrorCallback(mensaje) {
  try {
    sessionStorage.setItem(AUTH_ERROR_KEY, mensaje);
  } catch {
    // sin sessionStorage el error se queda solo en consola
  }
}

/** Lee y BORRA el error de callback pendiente (null si no había). */
export function consumirErrorCallback() {
  try {
    const mensaje = sessionStorage.getItem(AUTH_ERROR_KEY);
    if (mensaje !== null) sessionStorage.removeItem(AUTH_ERROR_KEY);
    return mensaje;
  } catch {
    return null;
  }
}

/** ¿La URL actual trae una respuesta de autorización de alguno de los dos? */
export function hayCallbackDeAuth(search = window.location.search) {
  const params = new URLSearchParams(search);
  return Boolean(
    (params.get("code") || params.get("error")) && params.get("state")
  );
}

/**
 * Tras canjear el código los parámetros quedan en la URL: un F5 los
 * reenviaría al backend como si fueran parámetros de la app. Se borran con
 * `replaceState` para no añadir una entrada al historial.
 */
export function limpiarUrl() {
  const url = new URL(window.location.href);
  PARAMS_CALLBACK.forEach((param) => url.searchParams.delete(param));
  window.history.replaceState(
    null,
    "",
    url.pathname + url.search + url.hash
  );
}

/** ¿Hay que canjear un código de Azure / de Cognito, o no hay callback? */
export function clasificarCallback() {
  const pendiente = sessionStorage.getItem(PENDING_AUTH_PROVIDER_KEY);
  const callbackDeCognito = pendiente === AUTH_PROVIDER_COGNITO;
  // Sin marcador de Cognito, cualquier callback con `code`+`state` se trata
  // como de Azure: MSAL es el único que puede detectar y reportar él solo
  // un código ajeno (estado no encontrado en su caché de interacción).
  const callbackDeAzure = hayCallbackDeAuth() && !callbackDeCognito;
  return { callbackDeAzure, callbackDeCognito };
}

/** El marcador ya se usó: se borra en cuanto se resuelve el callback. */
export function limpiarProveedorPendiente() {
  sessionStorage.removeItem(PENDING_AUTH_PROVIDER_KEY);
}

/** Marca quién pidió el redirect (llamar SIEMPRE antes de navegar). */
export function marcarProveedorPendiente(proveedor) {
  sessionStorage.setItem(PENDING_AUTH_PROVIDER_KEY, proveedor);
}

/**
 * Procesa la respuesta de redirect de Microsoft Entra ID y, si la hubo, deja
 * su cuenta como ACTIVA. MSAL espera a `initialize()`, por eso se invoca desde
 * `main.jsx` y SIEMPRE en cada carga (no solo si la URL "parece" de Azure):
 * su respuesta viene en el HASH (`response_mode=fragment`) y su `state` vive
 * en la caché temporal de interacción, así que decidir por el query string
 * hacía que un redirect legítimo no se canjeara nunca → la cuenta no entraba
 * en la caché → `getActiveAccount()` quedaba null → la UI veía "sin sesión"
 * aunque Entra ya había autenticado.
 *
 * @param instance instancia MSAL ya inicializada.
 * @param silencioso `true` cuando ESTE callback NO es de Azure (Cognito o
 *   huérfanos). MSAL solo canjea el código cuyo `state` registró él mismo al
 *   lanzar el redirect: uno ajeno se rechaza y eso es esperado —no es un
 *   error que mostrar en /login ni un motivo para borrar la URL, que
 *   `oidc-client-ts` todavía necesita para canjear su `?code=` de Cognito.
 *
 * Solo se imprimen username/excepción: nunca tokens.
 */
export async function procesarCallbackAzure(instance, { silencioso = false } = {}) {
  try {
    const response = await instance.handleRedirectPromise();
    if (response?.account) {
      // setActiveAccount ANTES del primer render: sin él getActiveAccount()
      // queda null y useAuthSession (AuthRoleProvider/ProtectedRoute/
      // UserNavbar) leería la app como no autenticada.
      instance.setActiveAccount(response.account);
      console.info(
        "Autenticacion completada:",
        response.account.username ?? "(sin username)"
      );
    }
    // response === null → el respaldo lo hace `fijarCuentaActiva` (main.jsx).
  } catch (error) {
    // Protocolo rechazado (scope inexistente, consentimiento denegado,
    // estado caducado...): el detalle va a consola y, SOLO si este callback
    // era de Azure, se deja un mensaje legible para /login.
    console.error("Error al procesar la respuesta de Azure:", error);
    if (!silencioso) {
      marcarErrorCallback(
        "Microsoft devolvió un error al iniciar sesión. Inténtalo de nuevo."
      );
      limpiarProveedorPendiente();
    }
  }
  // La URL solo se limpia si el callback era de Azure: en modo silencioso hay
  // que preservar el `?code=` de Cognito (lo limpia `onSigninCallback`).
  if (silencioso) return;
  limpiarUrl();
}
