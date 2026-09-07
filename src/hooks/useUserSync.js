import { useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../auth/AuthConfig";

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY_URL;
const REGISTRO_ENDPOINT = "/api/v1/usuarios/registro";

export default function useUserSync() {
  const { instance, accounts, inProgress } = useMsal();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (accounts.length > 0 && inProgress === "none" && !hasRegistered.current) {
      hasRegistered.current = true;

      instance.acquireTokenSilent({ ...apiRequest, account: accounts[0] })
        .then(response => {
          return fetch(`${API_GATEWAY}${REGISTRO_ENDPOINT}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${response.accessToken}`,
              "Content-Type": "application/json"
            }
          });
        })
        .then(res => {
          if (res.ok) console.log("Usuario sincronizado con el backend");
        })
        .catch(e => {
          console.error("Error sincronizando usuario:", e);
          hasRegistered.current = false;
        });
    }
  }, [accounts, inProgress, instance]);

  return { hasRegistered };
}
