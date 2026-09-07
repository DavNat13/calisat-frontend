import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { apiRequest } from "../auth/AuthConfig";

const API_GATEWAY = "https://ho5p58iyu7.execute-api.us-east-1.amazonaws.com";
const PERFIL_ENDPOINT = "/api/v1/usuarios/perfil";

export default function useUserProfile() {
  const { instance, accounts } = useMsal();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const getToken = async () => {
    const response = await instance.acquireTokenSilent({
      ...apiRequest, 
      account: accounts[0]
    });
    return response.accessToken;
  };

  const obtenerPerfil = async () => {
    setLoading(true);
    setMensaje("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_GATEWAY}${PERFIL_ENDPOINT}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil(data);
        setMensaje("Perfil obtenido correctamente");
      } else if (res.status === 404) {
        setPerfil(null);
        setMensaje("Perfil no encontrado");
      }
    } catch (e) {
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
      const res = await fetch(`${API_GATEWAY}${PERFIL_ENDPOINT}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombreCompleto })
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil(data);
        setMensaje("Nombre actualizado correctamente");
      } else if (res.status === 404) {
        setMensaje("Perfil no encontrado");
      }
    } catch (e) {
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
      const res = await fetch(`${API_GATEWAY}${PERFIL_ENDPOINT}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPerfil(null);
        setMensaje("Perfil eliminado (baja lógica)");
      } else if (res.status === 404) {
        setMensaje("Perfil no encontrado");
      }
    } catch (e) {
      setMensaje("Error al eliminar perfil");
    } finally {
      setLoading(false);
    }
  };

  return {
    perfil,
    loading,
    mensaje,
    obtenerPerfil,
    actualizarNombre,
    eliminarPerfil
  };
}
