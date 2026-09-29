/**
 * Configuración de AWS Cognito (Hosted UI) para la SPA — acceso PÚBLICO.
 *
 * Revisión de seguridad (misma política que `src/auth/AuthConfig.js` para
 * Microsoft Entra ID):
 *  - `clientId` / `authority` / `redirect_uri` / `logout_uri` son
 *    identificadores PÚBLICOS de una SPA: viven en el JavaScript de
 *    producción por diseño. El flujo es de REDIRECT con PKCE sobre un
 *    cliente PÚBLICO, así que aquí NO hay (ni puede haber) client secret,
 *    API keys, tokens ni credenciales. Nunca los añadas a este fichero.
 *  - El token no se guarda a mano: lo persiste `oidc-client-ts` en
 *    `sessionStorage` (se borra al cerrar la pestaña, no se comparte entre
 *    pestañas) y `automaticSilentRenew` queda desactivado (sin iframes).
 *  - Los logs de la app imprimen únicamente el identificador del usuario o
 *    la descripción de la excepción, NUNCA accessToken/idToken.
 *
 * ⚠️ El `redirect_uri` debe coincidir EXACTAMENTE con uno de los
 * "App redirect URLs" registrados en la app del user pool de Cognito
 * (sin barra final aquí, igual que allí): si no coincide, el Hosted UI
 * rechaza el flujo con `error_description=redirect_uri mismatch`.
 * Igualmente, `post_logout_redirect_uri` debe estar en "Sign out URL(s)".
 *
 * El dominio del Hosted UI es el "Domain prefix" del user pool
 * (`us-east-1uk0q6emaq`) + `.auth.us-east-1.amazoncognito.com`.
 */

/** Clave de `sessionStorage` que indica QUÉ proveedor pidió el redirect. */
export const PENDING_AUTH_PROVIDER_KEY = "pending_auth_provider";
export const AUTH_PROVIDER_AZURE = "azure";
export const AUTH_PROVIDER_COGNITO = "cognito";

/** Issuer del user pool (idéntico al que valida el backend). */
export const COGNITO_AUTHORITY =
  "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UK0Q6EmAQ";
/** App client id (público, con PKCE) del user pool. */
export const COGNITO_CLIENT_ID = "79rbb9f5e2l5nmak9d17ueb2se";
/** URL de la SPA: entrada y salida de sesión (sin barra final). */
export const COGNITO_REDIRECT_URI =
  "https://ezeh839whh.execute-api.us-east-1.amazonaws.com/desarrollo";
export const COGNITO_LOGOUT_URI = COGNITO_REDIRECT_URI;
/** Dominio del Hosted UI (login/registro/logout de Cognito). */
export const COGNITO_DOMAIN =
  "https://us-east-1uk0q6emaq.auth.us-east-1.amazoncognito.com";
/** Scopes pedidos en el authorize (el id token ya trae email/teléfono). */
export const COGNITO_SCOPE = "email openid phone";

/**
 * Ajustes que consume el `<AuthProvider>` de react-oidc-context.
 * `response_type: "code"` + PKCE: Cognito no admite el flujo implícito desde
 * 2021. `loadUserInfo: false`: el ID token ya trae `email`/`phone_number`,
 * así que no hace falta llamar a `/oauth2/userInfo`.
 */
export const cognitoOidcConfig = {
  authority: COGNITO_AUTHORITY,
  client_id: COGNITO_CLIENT_ID,
  redirect_uri: COGNITO_REDIRECT_URI,
  response_type: "code",
  scope: COGNITO_SCOPE,
  post_logout_redirect_uri: COGNITO_LOGOUT_URI,
  loadUserInfo: false,
  monitorSession: false,
  automaticSilentRenew: false,
};

/**
 * Cierre de sesión en el Hosted UI: borra la cookie de sesión de Cognito e
 * invalida la sesión en el lado del proveedor (equivalente al
 * `logoutRedirect` de MSAL). OJO: llama a `cognito.removeUser()` ANTES de
 * navegar, si no, al volver la app se leería como autenticada.
 */
export function cerrarSesionHostedUi() {
  window.location.href =
    `${COGNITO_DOMAIN}/logout` +
    `?client_id=${COGNITO_CLIENT_ID}` +
    `&logout_uri=${encodeURIComponent(COGNITO_LOGOUT_URI)}`;
}

/**
 * URL de ALTA en el Hosted UI (`/signup`): registra al usuario y, cuando la
 * cuenta queda confirmada, el Hosted UI redirige de vuelta a la SPA con un
 * `?code=...&state=...` idéntico al del login, por eso quien llama debe
 * marcar `AUTH_PROVIDER_COGNITO` en `sessionStorage` antes de navegar.
 */
export function urlRegistroHostedUi() {
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: "code",
    scope: COGNITO_SCOPE,
    redirect_uri: COGNITO_REDIRECT_URI,
  });
  return `${COGNITO_DOMAIN}/signup?${params.toString()}`;
}
