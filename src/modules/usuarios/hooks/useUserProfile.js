import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../../../auth/AuthConfig";
import { API_BASE_URL } from "../../../config/api";
import { MENSAJE_OPERACION_FALLIDA, registrarFallo } from "../../../utils/errores";

const PERFIL_ENDPOINT = "/api/v1/usuarios/perfil";

/**
 * Hook de perfil de usuario.
 *
 * Todas las peticiones llevan Bearer (endpoint protegido). Los mensajes
 * mostrados en UI son SIEMPRE copias propias en español; el detalle real
 * (status/payload) va a consola vía `registrarFallo`.
 */
export default function useUserProfile() {
  const { instance, accounts } = useMsal();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  // HTTP de la ÚLTIMA carga (null si hubo red caída). La página lo traduce a
  // modo fallback: 403 (rol sin permiso) y 404 (sin ficha) no deben dejar
  // /perfil en blanco, sino pasar a los datos de la sesión.
  const [codigoFallo, setCodigoFallo] = useState(null);

  const getToken = async () => {
    // Misma regla que en catalogoService: token SIEMPRE de la cuenta activa
    // (la que ve el usuario en la navbar), no de `accounts[0]` a ciegas.
    const cuenta = instance.getActiveAccount() ?? accounts[0];
    const response = await instance.acquireTokenSilent({
      ...apiRequest,
      account: cuenta,
    });
    return response.accessToken;
  };

  const obtenerPerfil = async () => {
    setLoading(true);
    setMensaje("");
    setCodigoFallo(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}${PERFIL_ENDPOINT}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil(data);
        setMensaje("Perfil obtenido correctamente");
      } else if (res.status === 404) {
        setPerfil(null);
        setCodigoFallo(res.status);
        setMensaje("Perfil no encontrado");
      } else {
        registrarFallo("usuarios/obtenerPerfil", `HTTP ${res.status}`);
        setPerfil(null);
        setCodigoFallo(res.status);
        setMensaje(MENSAJE_OPERACION_FALLIDA);
      }
    } catch (err) {
      registrarFallo("usuarios/obtenerPerfil", err);
      setMensaje("Error al obtener perfil");
    } finally {
      setLoading(false);
    }
  };

  const actualizarNombre = async (nombreCompleto) => {
    setLoading(true);
    setMensaje("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}${PERFIL_ENDPOINT}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombreCompleto }),
      });
      if (res.ok) {
        // Respaldo ante respuestas 204/sin cuerpo: res.json() rechazaría y
        // una actualización EXITOSA se mostraría como "Error al actualizar".
        const data = await res.json().catch(() => null);
        if (data) setPerfil(data);
        setMensaje("Nombre actualizado correctamente");
      } else if (res.status === 404) {
        setMensaje("Perfil no encontrado");
      } else {
        registrarFallo("usuarios/actualizarNombre", `HTTP ${res.status}`);
        setMensaje(MENSAJE_OPERACION_FALLIDA);
      }
    } catch (err) {
      registrarFallo("usuarios/actualizarNombre", err);
      setMensaje("Error al actualizar nombre");
    } finally {
      setLoading(false);
    }
  };

  const eliminarPerfil = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}${PERFIL_ENDPOINT}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setPerfil(null);
        setMensaje("Perfil eliminado (baja lógica)");
      } else if (res.status === 404) {
        setMensaje("Perfil no encontrado");
      } else {
        registrarFallo("usuarios/eliminarPerfil", `HTTP ${res.status}`);
        setMensaje(MENSAJE_OPERACION_FALLIDA);
      }
    } catch (err) {
      registrarFallo("usuarios/eliminarPerfil", err);
      setMensaje("Error al eliminar perfil");
    } finally {
      setLoading(false);
    }
  };

  return {
    perfil,
    loading,
    mensaje,
    codigoFallo,
    obtenerPerfil,
    actualizarNombre,
    eliminarPerfil,
  };
}
