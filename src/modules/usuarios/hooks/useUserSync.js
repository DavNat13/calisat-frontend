import { useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import useAuthSession from "../../../auth/useAuthSession";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";
import { AUTH_PROVIDER_AZURE } from "../../../config/cognitoConfig";

const REGISTRO_ENDPOINT = "/api/v1/usuarios/registro";

/**
 * Registra/actualiza el usuario en el backend al abrir la app.
 *
 * SOLO se dispara con sesión de AZURE: la llamada lleva el Bearer que emite
 * `instance.acquireTokenSilent(...)` contra el scope de Entra ID, que es lo
 * único que el API Gateway y el backend validan. Con sesión de Cognito ese
 * token no existe y el POST devolvería 401/403, así que no se lanza
 * (el alta de clientes públicos la resuelve el propio Cognito).
 */
export default function useUserSync() {
  const { instance, accounts, inProgress } = useMsal();
  const { proveedor } = useAuthSession();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (proveedor !== AUTH_PROVIDER_AZURE) return;
    if (accounts.length === 0 || inProgress !== "none") return;
    if (hasRegistered.current) return;

    hasRegistered.current = true;

    // Cuenta activa (la visible en UI); `accounts[0]` solo como respaldo.
    const cuenta = instance.getActiveAccount() ?? accounts[0];
    instance.acquireTokenSilent({ ...apiRequest, account: cuenta })
      .then(response => {
        return fetch(`${API_BASE_URL}${REGISTRO_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${response.accessToken}`,
            "Content-Type": "application/json"
          }
        });
      })
      .then(res => {
        if (res.ok) console.log("Usuario sincronizado con el backend");
        else console.error(`[usuarios/sincronizar] HTTP ${res.status}`);
      })
      .catch(e => {
        console.error("Error sincronizando usuario:", e);
        hasRegistered.current = false;
      });
  }, [accounts, inProgress, instance, proveedor]);

  return { hasRegistered };
}
