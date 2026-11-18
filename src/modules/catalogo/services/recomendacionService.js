import { useCallback } from "react";
import { API_BASE_URL } from "../../../config/api";
import useTokenSesion from "../../../auth/tokenSesion";

/**
 * Recomendaciones personalizadas (Top-5) de `ms-analytics`:
 *   GET /api/v1/recomendaciones/me → [{ itemId, score, posicion, category }]
 * Devuelve [] sin sesión o ante cualquier fallo: es un enriquecimiento, nunca
 * debe tumbar la ficha de producto.
 */
export default function useRecomendacionService() {
  const tokenSesion = useTokenSesion();

  const misRecomendaciones = useCallback(async () => {
    const token = await tokenSesion();
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/recomendaciones/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const datos = await res.json();
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }, [tokenSesion]);

  return { misRecomendaciones };
}
