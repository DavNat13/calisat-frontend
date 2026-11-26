import { useEffect, useRef } from "react";
import useAuthSession from "../../../auth/useAuthSession";
import useTokenSesion from "../../../auth/tokenSesion";
import { API_BASE_URL } from "../../../config/api";

const REGISTRO_ENDPOINT = "/api/v1/usuarios/registro";

/**
 * Registra/actualiza el usuario en el backend al abrir la app, tanto con
 * sesión de Microsoft Entra ID como de AWS Cognito (ms-usuarios valida los
 * dos emisores). Este alta es la que da de alta al usuario como destinatario
 * de los correos en ms-notificaciones.
 */
export default function useUserSync() {
  const { proveedor, cargando } = useAuthSession();
  const obtenerToken = useTokenSesion();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!proveedor || cargando) return;
    if (hasRegistered.current) return;

    hasRegistered.current = true;

    obtenerToken()
      .then((token) => {
        if (!token) throw new Error("Sesión sin token disponible");
        return fetch(`${API_BASE_URL}${REGISTRO_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
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
  }, [proveedor, cargando, obtenerToken]);

  return { hasRegistered };
}
