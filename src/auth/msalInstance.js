/**
 * Creación de la instancia MSAL compartida por toda la app.
 *
 * Vive en su propio fichero para que `main.jsx` se quede muy por debajo de
 * las 150 líneas y para que la inicialización quede separada de la
 * coordinación de callbacks (ver `redirectCallback.js`).
 *
 * Los logs de este módulo imprimen únicamente username o la excepción de
 * MSAL (errorCode/errorMessage/correlationId): NUNCA accessToken ni idToken.
 */
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./AuthConfig";

/** Instancia única (estado de token en sessionStorage, ver AuthConfig.js). */
export function crearMsalInstance() {
  const instance = new PublicClientApplication(msalConfig);

  // Registro de fallos interactivos (login / acquireToken) en consola.
  instance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_FAILURE ||
      event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
    ) {
      console.error("Fallo de MSAL:", event.error);
    }
  });

  return instance;
}

/**
 * MSAL no marca ninguna cuenta como "activa" por su cuenta: sin este paso
 * `getActiveAccount()` devuelve null y `AuthRoleProvider` no puede leer los
 * claims de roles del id token (ProtectedRoute denegaría siempre y la UI no
 * mostraría ninguna opción de rol). Se marca solo si aún no hay una, para no
 * pisar una selección explícita. El valor persiste en la caché de MSAL
 * (sessionStorage), así que también sobrevive a un refresh.
 *
 * NOTA: solo aporta sesión de Microsoft Entra ID; con sesión de Cognito la
 * cuenta de MSAL sigue siendo null y los roles salen de `cognito:groups`.
 */
export function fijarCuentaActiva(instance) {
  try {
    const cuentas = instance.getAllAccounts();
    if (cuentas.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(cuentas[0]);
    }
  } catch (error) {
    console.error("Error al fijar la cuenta activa:", error);
  }
}
