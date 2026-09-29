/**
 * Acciones de navegación del login dual (sin estado React).
 *
 * Aquí vive TODO lo que dispara un redirect OAuth, para que
 * `useLoginActions.js` se quede muy por debajo de las 150 líneas.
 *
 * Regla común a las tres acciones: SE MARCA EN `sessionStorage` QUIÉN pidió
 * el redirect (y se persiste el retorno) ANTES de navegar. La SPA se
 * recarga al volver y `history.state` se pierde; el marcador, en cambio,
 * sobrevive y es lo que impide que Azure y Cognito canjeen el `?code=` del
 * otro (ver src/auth/redirectCallback.js).
 */
import { loginRequest } from "../../../auth/AuthConfig";
import { guardarRetorno } from "../../../auth/retorno";
import {
  limpiarProveedorPendiente,
  marcarProveedorPendiente,
} from "../../../auth/redirectCallback";
import {
  AUTH_PROVIDER_AZURE,
  AUTH_PROVIDER_COGNITO,
  urlRegistroHostedUi,
} from "../../../config/cognitoConfig";

/**
 * Persiste el destino al que volver tras el login.
 * @param {*} retorno primer argumento del onClick (el EVENTO del botón si
 *   LoginPage no lo ha envuelto → se ignora).
 * @param {string} destino ruta de `location.state?.from?.pathname` que
 *   inyecta ProtectedRoute, o "/" cuando el usuario entró a /login directo.
 */
export function prepararRetorno(retorno, destino) {
  guardarRetorno(typeof retorno === "string" ? retorno : destino);
}

/** Acceso institucional → redirect a Microsoft Entra ID (MSAL + PKCE). */
export async function iniciarInstitucional(instance) {
  marcarProveedorPendiente(AUTH_PROVIDER_AZURE);
  try {
    await instance.loginRedirect(loginRequest);
  } catch (error) {
    limpiarProveedorPendiente();
    console.error("Error al iniciar sesión con Microsoft:", error);
    throw error;
  }
}

/** Acceso público → redirect al Hosted UI de Cognito (react-oidc-context). */
export async function iniciarPublico(cognito) {
  marcarProveedorPendiente(AUTH_PROVIDER_COGNITO);
  try {
    await cognito.signinRedirect();
  } catch (error) {
    // OJO: el <AuthProvider> traga las excepciones y las deja en
    // `cognito.error` (se limpia el marcador desde useLoginActions); este
    // catch solo cubre un fallo previo a la navegación.
    limpiarProveedorPendiente();
    console.error("Error al iniciar sesión con AWS Cognito:", error);
    throw error;
  }
}

/**
 * Registro en el Hosted UI (`/signup?client_id=...&redirect_uri=...&
 * response_type=code&scope=...`). Cognito devuelve al terminar con el mismo
 * `?code=...&state=...` que el login, por eso también se marca Cognito.
 */
export function abrirRegistroPublico() {
  marcarProveedorPendiente(AUTH_PROVIDER_COGNITO);
  try {
    window.location.assign(urlRegistroHostedUi());
  } catch (error) {
    limpiarProveedorPendiente();
    console.error("Error al abrir el registro de Cognito:", error);
    throw error;
  }
}
