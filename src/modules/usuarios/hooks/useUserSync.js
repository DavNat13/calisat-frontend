import { useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";

const REGISTRO_ENDPOINT = "/api/v1/usuarios/registro";

export default function useUserSync() {
  const { instance, accounts, inProgress } = useMsal();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (accounts.length > 0 && inProgress === "none" && !hasRegistered.current) {
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
    }
  }, [accounts, inProgress, instance]);

  return { hasRegistered };
}
