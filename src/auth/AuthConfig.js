/**
 * Configuración MSAL (@azure/msal-browser) para la SPA.
 *
 * Revisión de seguridad (ver informe):
 * - El token NO se guarda a mano en localStorage/cookies: MSAL lo persiste
 *   en `sessionStorage` (se borra al cerrar la pestaña y no se comparte
 *   entre pestañas, a diferencia de localStorage). `memory` rompería el
 *   "sigue autenticado tras F5" (la caché se pierde y MSAL tendría que
 *   interactuar de nuevo), por eso se mantiene sessionStorage + el
 *   eslabón débil real se cubre con CSP estricta (script-src 'self').
 * - `storeAuthStateInCookie: false`: los cookies de estado solo eran
 *   necesarios en IE/entornos con cookies bloqueadas; no aplican aquí.
 *   (No existe `storeStateInBody` en msal-browser: no se usa.)
 * - La SPA usa flujo de REDIRECT con PKCE (client público, sin client
 *   secret): no hay secretos en el bundle. clientId/tenant/redirectUri
 *   son identificadores PÚBLICOS por diseño de una SPA.
 * - Los logs (src/main.jsx) imprimen únicamente el username/la excepción,
 *   nunca accessToken/idToken.
 *
 * Configuración FIJA en código (sin variables de entorno): la SPA no lee
 * nada del objeto de entorno de Vite ni archivos `.env`. Si cambia el
 * tenant, la app o el origen desplegado, hay que actualizar estos valores
 * Y el redirect URI registrado en Microsoft Entra ID (si no coinciden,
 * Entra rechaza el flujo).
 */
const CLIENT_ID = "d221f0d2-1a7c-4872-ad6c-367a1f0717ec";
const TENANT_ID = "e5372bf0-c5e3-4286-887c-79069f209c1f";
// Origen de la SPA (debe coincidir EXACTAMENTE con la URL pública
// registrada como "Mobile and web applications" en Entra ID).
const REDIRECT_URI = "https://ezeh839whh.execute-api.us-east-1.amazonaws.com/desarrrollo/";
const POST_LOGOUT_REDIRECT_URI =
  "https://ezeh839whh.execute-api.us-east-1.amazonaws.com/desarrrollo/";
// Scope expuesto por el propio API Gateway (debe coincidir con el
// Application ID URI configurado en Entra ID).
const API_SCOPE = `api://${CLIENT_ID}/read-write`;

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const apiRequest = {
  scopes: [API_SCOPE],
};
