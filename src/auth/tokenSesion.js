import { useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "react-oidc-context";
import { apiRequest } from "./AuthConfig";

/**
 * Bearer de la sesión ACTIVA, para las llamadas del carrito y de las
 * órdenes (los módulos de administración siguen con su propio getToken
 * en apiAdmin.js / adminService.js).
 *
 * Soporta las dos fuentes de sesión que ya existen en la app:
 *   - Microsoft Entra ID (MSAL) → `accessToken` de la cuenta activa, que
 *     es el que validan los microservicios.
 *   - AWS Cognito (oidc-client-ts) → `id_token` del usuario.
 *
 * Devuelve `null` cuando no hay sesión: el carrito en ese caso sigue
 * funcionando contra localStorage (modo anónimo) y las llamadas que
 * exijan autenticación fallarán de forma controlada.
 */
export default function useTokenSesion() {
  const { instance, accounts } = useMsal();
  const cognito = useAuth();

  return useCallback(async () => {
    const cuenta = instance.getActiveAccount() ?? accounts[0];
    if (cuenta) {
      try {
        const respuesta = await instance.acquireTokenSilent({
          ...apiRequest,
          account: cuenta,
        });
        return respuesta.accessToken ?? null;
      } catch {
        // Token silencioso no disponible (consentimiento/interacción):
        // se trata como "sin token" en vez de tumbar la operación.
        return null;
      }
    }
    if (cognito.isAuthenticated && cognito.user?.id_token) {
      return cognito.user.id_token;
    }
    return null;
  }, [instance, accounts, cognito.isAuthenticated, cognito.user]);
}
