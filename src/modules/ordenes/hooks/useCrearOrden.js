import { useCallback, useRef, useState } from "react";
import useOrdenService from "../services/ordenService";
import useCarrito from "../../carrito/hooks/useCarrito";

const SIN_PEDIDO = { fase: "listo", orden: null, error: null };

/**
 * Confirma el checkout: arma el pedido con las líneas del carrito y lo crea
 * en `ms-orden`. Solo vacía el carrito cuando el backend respondió bien, de
 * modo que un fallo deja al usuario exactamente donde estaba.
 *
 * La clave de idempotencia se genera UNA vez por intento y se reutiliza en
 * los reintentos: si la primera petición llegó al backend y la respuesta se
 * perdió, el segundo envío devuelve la MISMA orden (HTTP 200) en vez de
 * duplicarla.
 */
export default function useCrearOrden() {
  const servicio = useOrdenService();
  const { items, vaciar } = useCarrito();
  const [estado, setEstado] = useState(SIN_PEDIDO);
  const claveRef = useRef(null);

  const confirmar = useCallback(async (datos = {}) => {
    if (items.length === 0) {
      setEstado({ fase: "error", orden: null, error: "Tu carrito está vacío." });
      return;
    }
    if (claveRef.current === null) {
      claveRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `orden-${Date.now()}`;
    }
    setEstado({ fase: "enviando", orden: null, error: null });
    try {
      const orden = await servicio.crear(items, {
        clave: claveRef.current,
        direccion: datos.direccion,
        costoEnvio: datos.costoEnvio,
      });
      claveRef.current = null;
      vaciar();
      setEstado({ fase: "confirmado", orden, error: null });
    } catch (detalle) {
      setEstado({ fase: "error", orden: null, error: detalle.message });
    }
  }, [items, servicio, vaciar]);

  /** Vuelve al carrito descartando el intento (y su clave de idempotencia). */
  const reiniciar = useCallback(() => {
    claveRef.current = null;
    setEstado(SIN_PEDIDO);
  }, []);

  return { ...estado, confirmar, reiniciar, hayItems: items.length > 0 };
}
