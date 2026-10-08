import { useCallback } from "react";
import { API_BASE_URL } from "../../../config/api";
import { registrarFallo } from "../../../utils/errores";
import useTokenSesion from "../../../auth/tokenSesion";

/** Reglas del checkout — réplica exacta de TarifaEnvioService (ms-envios). */
export const UMBRAL_GRATIS = 80000;
export const KG_INCLUIDOS = 3;
export const RECARGO_POR_KG = 990;

const COSTO = { SUR: 3990, CENTRO: 5990, NORTE: 7990, INTERNACIONAL: 14990 };
const PLAZO = { SUR: "2-4", CENTRO: "1-3", NORTE: "3-6", INTERNACIONAL: "7-12" };

const SUR = [
  "puerto montt", "puerto varas", "osorno", "castro", "ancud", "chaiten",
  "calbuco", "pailen", "fresia", "llanquihue", "puerto aysen", "coyhaique",
  "aysen", "quellon", "maullin", "dalcahue", "chonchi",
];
const CENTRO = [
  "santiago", "providencia", "nunoa", "las condes", "vitacura", "macul",
  "penalolen", "la florida", "maipu", "puente alto", "san bernardo",
  "colina", "talagante", "padre hurtado", "valparaiso", "vina del mar",
  "quilpue", "villa alemana", "quillota", "san antonio", "san felipe",
  "los andes", "rancagua", "buin", "paine",
];

const limpiar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const etiqueta = {
  SUR: "Sur (Los Lagos y Aysén)",
  CENTRO: "Centro (Metropolitana, Valparaíso y O'Higgins)",
  NORTE: "Norte y resto del país",
  INTERNACIONAL: "Internacional",
};

/** Cálculo local: mismas reglas que el microservicio (fallback sin red). */
export function cotizarLocal({ ciudad, pais, subtotal = 0, pesoKg = 0 } = {}) {
  const destino = limpiar(ciudad);
  const paisLimpio = limpiar(pais);
  if (paisLimpio && paisLimpio !== "chile") {
    return armar("INTERNACIONAL", COSTO.INTERNACIONAL, subtotal, pesoKg, false);
  }
  let zona = "NORTE";
  if (SUR.includes(destino)) zona = "SUR";
  else if (CENTRO.includes(destino)) zona = "CENTRO";
  return armar(zona, COSTO[zona], subtotal, pesoKg, false);
}

function armar(zona, base, subtotal, pesoKg, gratis) {
  const excedente = Math.max(0, Math.ceil(Number(pesoKg) || 0) - KG_INCLUIDOS);
  const recargo = excedente * RECARGO_POR_KG;
  const porMonto = Number(subtotal) >= UMBRAL_GRATIS;
  const costo = porMonto ? 0 : base + recargo;
  return {
    zona,
    etiquetaZona: etiqueta[zona],
    costo,
    plazo: PLAZO[zona],
    gratisPorMonto: porMonto || gratis,
    descripcion: porMonto
      ? `Envío gratis: tu pedido supera los ${UMBRAL_GRATIS} CLP.`
      : `${etiqueta[zona]} ${costo} CLP.`,
  };
}

/**
 * Cotiza el envío del checkout.
 *
 * Intenta `POST /api/v1/envios/cotizar` (lógica del microservicio); si esa
 * ruta aún no está publicada en el API Gateway o no responde, se aplica
 * localmente la MISMA tabla de tarifas para que el checkout nunca se quede
 * sin total.
 */
export default function useCotizacionService() {
  const tokenSesion = useTokenSesion();

  // Memoizada: si cambiará en cada render, el efecto del checkout que la
  // depende se re-programaría en bucle tras cada respuesta.
  return useCallback(async (datos) => {
    const local = cotizarLocal(datos);
    try {
      const token = await tokenSesion();
      if (!token) return local;
      const res = await fetch(`${API_BASE_URL}/api/v1/envios/cotizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          direccionCiudad: datos.ciudad,
          direccionPais: datos.pais,
          montoSubtotal: datos.subtotal,
          pesoKg: datos.pesoKg ?? 0,
        }),
      });
      if (!res.ok) {
        registrarFallo("cotizacion", `HTTP ${res.status}`);
        return local;
      }
      const remota = await res.json().catch(() => null);
      return remota?.costo == null ? local : { ...remota, costo: Number(remota.costo) };
    } catch (detalle) {
      registrarFallo("cotizacion/red", detalle);
      return local;
    }
  }, [tokenSesion]);
}
