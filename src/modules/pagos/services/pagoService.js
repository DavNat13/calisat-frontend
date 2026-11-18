import { API_BASE_URL } from "../../../config/api";
import { registrarFallo } from "../../../utils/errores";
import useTokenSesion from "../../../auth/tokenSesion";

const BASE = "/api/v1/pagos";

/** Copias propias en español por status (nunca el cuerpo crudo del server). */
const MENSAJES = {
  400: "Los datos del pago no son válidos.",
  401: "Tu sesión expiró; vuelve a iniciar sesión para pagar.",
  403: "No tienes permiso para realizar este pago.",
  404: "No encontramos ese pago.",
  502: "La pasarela de pago no está disponible. Inténtalo en unos minutos.",
};

/** Error con `status` y, en 429 (antifraude), los segundos de espera. */
const errorDe = (status, mensaje, extra = {}) =>
  Object.assign(
    new Error(mensaje ?? MENSAJES[status] ?? "No pudimos procesar el pago."),
    { status },
    extra
  );

/**
 * Pagos contra `ms-pago` (WebPay + antifraude), siempre con el Bearer activo.
 *
 *   POST /api/v1/pagos/iniciar    → { pagoId, token, url, simulado }  (429 = tarjeta bloqueada)
 *   POST /api/v1/pagos/confirmar  → estado final del pago (PAGADO | RECHAZADO)
 *   GET  /api/v1/pagos/mis-pagos  → historial del usuario
 */
export default function usePagoService() {
  const tokenSesion = useTokenSesion();

  const llamada = async (ruta, { metodo = "GET", cuerpo } = {}) => {
    const token = await tokenSesion();
    if (!token) throw errorDe(401);

    let res;
    try {
      res = await fetch(`${API_BASE_URL}${ruta}`, {
        method: metodo,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
    } catch (detalle) {
      registrarFallo("pagoService/red", detalle);
      throw errorDe(0, "No hay conexión con el servidor; revisa tu red.");
    }
    if (res.status === 429) {
      const datos = await res.json().catch(() => ({}));
      const segundos = Number(datos?.reintentarEnSegundos) || 0;
      const minutos = Math.ceil(segundos / 60);
      throw errorDe(
        429,
        `Por seguridad bloqueamos temporalmente esta tarjeta por intentos repetidos.${
          minutos ? ` Reintenta en ${minutos} min.` : ""
        }`,
        { segundos }
      );
    }
    if (!res.ok) {
      registrarFallo(`pagoService/${metodo}`, `HTTP ${res.status}`);
      throw errorDe(res.status);
    }
    return res.json().catch(() => null);
  };

  return {
    iniciar: ({ ordenId, monto, tarjeta }) =>
      llamada(`${BASE}/iniciar`, { metodo: "POST", cuerpo: { ordenId, monto, tarjeta } }),
    confirmar: (token) => llamada(`${BASE}/confirmar`, { metodo: "POST", cuerpo: { token } }),
    misPagos: () => llamada(`${BASE}/mis-pagos`),
  };
}

/**
 * Lleva al navegador a WebPay: Transbank exige un POST con `token_ws`.
 * En modo simulado la URL ya apunta al retorno del propio sitio (GET).
 */
export function redirigirAWebpay({ url, token, simulado }) {
  if (simulado) {
    window.location.assign(url);
    return;
  }
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  const campo = document.createElement("input");
  campo.type = "hidden";
  campo.name = "token_ws";
  campo.value = token;
  form.appendChild(campo);
  document.body.appendChild(form);
  form.submit();
}
